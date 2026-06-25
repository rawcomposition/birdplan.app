# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code style

Code should be self-explanatory — **do not write code comments**. Comments are reserved for extraordinary cases only: hacks for upstream bugs, non-obvious regex, or undocumented workarounds that could save a developer hours of debugging. Match the conventions, naming, and idioms of surrounding code.

In React (frontend), prefer derivation, lazy initialization, and custom hooks over `useEffect` and `useMemo`.

## Commands

All commands run from the repo root (npm workspaces). Node >= 22.

```bash
npm run dev              # run frontend (Vite :5280) + backend (:5100) concurrently
npm run dev:frontend     # Vite dev server on :5280
npm run dev:backend      # Hono server with tsx watch on :5100
npm run lint             # ESLint (frontend only)
npm run typecheck        # builds backend + frontend, typechecks shared
npm run build            # production build of frontend + backend
```

There is no test suite. `typecheck` is the primary correctness gate — run it after changes that span workspaces, since `@birdplan/shared` types flow into both frontend and backend.

Utility scripts live in `backend/scripts/` (run via `tsx`, reusing the backend's deps, `.env`, models, and `@birdplan/shared` alias) and are exposed from the repo root, e.g. `npm run get-avicommons` (fetch bird image data), `npm run tz-sync-regions` (sync region timezones).

## Architecture

Monorepo with three npm workspaces:

- **`shared/`** — `@birdplan/shared`: shared TypeScript types only (`types.ts`). The single source of truth for domain models (`Trip`, `Hotspot`, `Profile`, `Participant`, etc.). Imported by both frontend and backend via the `@birdplan/shared` alias. Changing a type here affects both sides — re-run `typecheck`.
- **`backend/`** — Hono API server (ESM, `type: module`). Connects to MongoDB via Mongoose. Auth is via self-issued opaque session tokens (OTP / magic-link login); images are stored in Cloudflare R2 (S3-compatible, `lib/storage.ts`).
- **`frontend/`** — Vite SPA with **React Router 7** (`createBrowserRouter`; no `src/` dir). React 19, Tailwind 4, React Query, Zustand, Mapbox.

Standalone `tsx` utility scripts live in `backend/scripts/` (not a separate workspace) — see Commands above.

### Backend

- Entry `backend/index.ts` mounts route modules under `/v1/*` (e.g. `/v1/trips`, `/v1/profile`). Routes nest as Hono sub-apps; `routes/trips/index.ts` mounts `routes/trips/[tripId]/index.ts`, which in turn mounts `targets`, `markers`, `hotspots`, `itinerary`, `participants`.
- Path aliases (`lib/*`, `models/*`, `routes/*`, `shared/*`) resolve via tsconfig + `tsc-alias` at build (imports use `.js` extensions because of NodeNext ESM).
- **Auth**: every protected handler calls `authenticate(c)` (`lib/utils.ts`), which validates the opaque session token from the `Authorization: Bearer` header (`lib/session.ts` `validateSessionToken`) and returns the session (`session.userId`). Sessions are issued on OTP / magic-link login. There is no auth middleware — it's called explicitly per-route.
- **DB**: `lib/db.ts` exports `connect()` (idempotent Mongoose connection) and the Mongoose models. Call `connect()` at the start of any handler that touches the DB. Models live in `models/`; schemas are typed against the shared `@birdplan/shared` types via `Record<keyof ...>`.
- Errors: throw `HTTPException(status, { message })`; the global `onError` in `index.ts` serializes them to JSON.
- External services: eBird API (proxied via `routes/ebird-proxy.ts`), Mapbox (region images uploaded to R2), Resend (email), DeepL (translation).

### Frontend

- **Entry / routing**: `main.tsx` mounts `<RouterProvider>` inside `ErrorBoundary` → `QueryClientProvider`, and configures the React Query client (persisted to IndexedDB via `idb-keyval` for offline cache; bump `QUERY_CACHE_BUSTER` to invalidate persisted cache). `router.tsx` defines routes with `createBrowserRouter`, all nested under `RootLayout`. Route components live in `pages/` (file names like `pages/[tripId]/targets.tsx` are conventional; route paths use `:param` syntax). `RootLayout.tsx` renders the provider stack (order matters): `SpeciesImagesProvider` → `UserProvider` → `ProfileProvider` → `TripProvider` → `ModalProvider` → `<Outlet />`.
- **Data fetching**: React Query with a global `queryFn` keyed by URL — `useQuery({ queryKey: ["/trips/123"] })` automatically GETs `import.meta.env.VITE_API_URL + /trips/123` with the session token attached. `lib/http.ts` (`get`/`mutate`) handles auth headers and error normalization.
- **Mutations**: `hooks/useMutation.ts` for general mutations; `hooks/useTripMutation.ts` for optimistic trip updates — pass an `updateCache(old, input)` reducer; it handles optimistic `setQueryData`, rollback on error, and invalidation of the `/trips/:id` key.
- **Trip state**: `providers/trip.tsx` owns the current trip (from the `tripId` route param), participants, `canEdit`/`isOwner`, and transient map UI state (selected species, halo, satellite toggle).
- Modals live in `modals/` and are orchestrated via `providers/modals.tsx` / `ModalProvider`.
- **UI primitives**: shadcn components in `components/ui/` use the `base-nova` style (see `components.json`), so they're built on **Base UI** (`@base-ui/react`), not Radix — there is no `@radix-ui/*` dependency. Icons via `lucide-react`.

### Life lists (domain core)

Life lists are the central domain concept. The model:

- **World**: `Profile.lifelist` (a user's world life list, array of species codes) plus `Profile.exceptions` (codes to subtract).
- **Per-trip**: a `Participant` roster (`models/Participant.ts`). Each participant has a `listMode` (`world` | `custom`) and an optional per-trip `lifelist`. This replaced the older Invites + intersection-list model.
- **Resolution**: computed server-side in `backend/lib/participants.ts` (`resolveTripLifelist`), which returns an `isGroup` boolean plus, for a group trip, both a `groupLifelist` (the intersection of all participants' effective lists) and a `unionLifelist` (their union); a `tripLifelist` (the list a public/unauthenticated viewer sees — the solo owner's effective list, or the group intersection); the viewer's own `viewerLifelist`; and a `viewer` descriptor (`participantId`, `listMode`, `listUpdatedAt`). These are serialized onto the trip (in `routes/trips/[tripId]/index.ts`) as `isGroupTrip`, plus — conditionally — `unionLifelist` and `groupLifelist` (only on group trips), `viewer` (when the requester is a participant), and `viewerLifelist` (only when the viewer's `listMode` is `custom`). `participantEffectiveList` applies a participant's `listMode` and the profile's `exceptions`. The frontend mirror is `hooks/useTripLifelist.ts`.
- **UI**: `components/LifelistEditor.tsx` is the reusable World/Custom editor, embedded on `/[tripId]/lifelist` (create-wizard + invite-accept flows) and in the `ManageLifelist` modal (trip menu + `/participants`).

## Deployment

Vercel (region `pdx1`), MongoDB Atlas. Backend builds to `dist/` and runs with `node`; frontend is a Vite static build to `dist/` (`frontend/vercel.json` sets `framework: vite` with an SPA rewrite to `index.html`). Env vars are read from `.env` files in `backend/` and `frontend/` (frontend vars exposed to the client are prefixed `VITE_`, e.g. `VITE_API_URL`).
