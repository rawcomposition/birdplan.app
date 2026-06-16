# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code style

Code should be self-explanatory — **do not write code comments**. Comments are reserved for extraordinary cases only: hacks for upstream bugs, non-obvious regex, or undocumented workarounds that could save a developer hours of debugging. Match the conventions, naming, and idioms of surrounding code.

In React (frontend), prefer derivation, lazy initialization, and custom hooks over `useEffect` and `useMemo`.

## Commands

All commands run from the repo root (npm workspaces). Node >= 22.

```bash
npm run dev              # run frontend (5100 backend + Next.js) concurrently
npm run dev:frontend     # Next.js dev server (turbopack)
npm run dev:backend      # Hono server with tsx watch on :5100
npm run lint             # ESLint (frontend only)
npm run typecheck        # builds backend + frontend, typechecks scripts + shared
npm run build            # production build of frontend + backend
```

There is no test suite. `typecheck` is the primary correctness gate — run it after changes that span workspaces, since `@birdplan/shared` types flow into both frontend and backend.

Utility scripts: `npm run get-avicommons` (fetch bird image data), `npm run tz-sync-regions` (sync region timezones).

## Architecture

Monorepo with four npm workspaces:

- **`shared/`** — `@birdplan/shared`: shared TypeScript types only (`types.ts`). The single source of truth for domain models (`Trip`, `Hotspot`, `Profile`, `Participant`, etc.). Imported by both frontend and backend via the `@birdplan/shared` alias. Changing a type here affects both sides — re-run `typecheck`.
- **`backend/`** — Hono API server (ESM, `type: module`). Connects to MongoDB via Mongoose, uses Firebase Admin for auth verification and Storage.
- **`frontend/`** — Next.js 15 **pages router** (not app router; no `src/` dir). React 19, Tailwind 3, React Query, Zustand, Mapbox.
- **`scripts/`** — standalone `tsx` utility scripts.

### Backend

- Entry `backend/index.ts` mounts route modules under `/v1/*` (e.g. `/v1/trips`, `/v1/profile`). Routes nest as Hono sub-apps; `routes/trips/index.ts` mounts `routes/trips/[tripId]/index.ts`, which in turn mounts `targets`, `markers`, `hotspots`, `itinerary`, `participants`.
- Path aliases (`lib/*`, `models/*`, `routes/*`, `shared/*`) resolve via tsconfig + `tsc-alias` at build (imports use `.js` extensions because of NodeNext ESM).
- **Auth**: every protected handler calls `authenticate(c)` (`lib/utils.ts`), which verifies the Firebase ID token from the `Authorization: Bearer` header and returns the decoded session (`session.uid`). There is no auth middleware — it's called explicitly per-route.
- **DB**: `lib/db.ts` exports `connect()` (idempotent Mongoose connection) and the Mongoose models. Call `connect()` at the start of any handler that touches the DB. Models live in `models/`; schemas are typed against the shared `@birdplan/shared` types via `Record<keyof ...>`.
- Errors: throw `HTTPException(status, { message })`; the global `onError` in `index.ts` serializes them to JSON.
- External services: eBird API (proxied via `routes/ebird-proxy.ts`), Mapbox (region images uploaded to Firebase Storage), Resend (email), DeepL (translation).

### Frontend

- `pages/_app.tsx` sets up the provider stack (order matters): `QueryClientProvider` → `SpeciesImagesProvider` → `UserProvider` → `ProfileProvider` → `TripProvider` → `ModalProvider`. The React Query client is persisted to IndexedDB (`idb-keyval`) for offline cache; bump `QUERY_CACHE_BUSTER` to invalidate persisted cache.
- **Data fetching**: React Query with a global `queryFn` keyed by URL — `useQuery({ queryKey: ["/trips/123"] })` automatically GETs `NEXT_PUBLIC_API_URL + /trips/123` with the Firebase token attached. `lib/http.ts` (`get`/`mutate`) handles auth headers and error normalization.
- **Mutations**: `hooks/useMutation.ts` for general mutations; `hooks/useTripMutation.ts` for optimistic trip updates — pass an `updateCache(old, input)` reducer; it handles optimistic `setQueryData`, rollback on error, and invalidation of the `/trips/:id` key.
- **Trip state**: `providers/trip.tsx` owns the current trip (from the `tripId` route param), participants, `canEdit`/`isOwner`, and transient map UI state (selected species, halo, satellite toggle).
- Modals live in `modals/` and are orchestrated via `providers/modals.tsx` / `ModalProvider`.

### Life lists (domain core)

Life lists are the central domain concept. The model:

- **World**: `Profile.lifelist` (a user's world life list, array of species codes) plus `Profile.exceptions` (codes to subtract).
- **Per-trip**: a `Participant` roster (`models/Participant.ts`). Each participant has a `listMode` (`world` | `custom`) and an optional per-trip `lifelist`. This replaced the older Invites + intersection-list model.
- **Resolution**: computed server-side in `backend/lib/participants.ts` (`resolveTripLifelist`), which returns an `isGroup` boolean plus a `groupLifelist` (for a group trip, the intersection of all participants' effective lists; for a solo trip, that single participant's list) and the viewer's own `viewerLifelist`. These are serialized onto the trip as `isGroupTrip`, `groupLifelist`, and `viewerLifelist`. `participantEffectiveList` applies a participant's `listMode` and the profile's `exceptions`. The frontend mirror is `hooks/useTripLifelist.ts`.
- **UI**: `components/LifelistEditor.tsx` is the reusable World/Custom editor, embedded on `/[tripId]/lifelist` (create-wizard + invite-accept flows) and in the `ManageLifelist` modal (trip menu + `/participants`).

## Deployment

Vercel (region `pdx1`), MongoDB Atlas. Backend builds to `dist/` and runs with `node`; frontend uses Next.js `output: "standalone"`. Env vars are read from `.env` files in `backend/` and `frontend/` (frontend public vars prefixed `NEXT_PUBLIC_`).
