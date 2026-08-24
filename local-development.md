# Local development

How to get BirdPlan running on a development machine, and which features are unavailable without third-party credentials.

## Prerequisites

- **Node 22 or newer.** `.nvmrc` pins 22 and CI runs 22.x; newer versions work.
- **`npm ci` from the repo root.** This is an npm workspaces monorepo (`frontend`, `backend`, `shared`) — installing inside a workspace directory will not resolve correctly.
- **MongoDB.** Mongoose creates the collections and indexes on first write, so an empty database is all that's needed:
  ```bash
  docker run -d --name mongo -p 27017:27017 mongo:7
  ```

## Environment variables

There is no `.env.example`. Both files are gitignored.

### `backend/.env`

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | Database connection |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins. If unset, the CORS middleware is skipped entirely and every browser request fails |
| `RESEND_API_KEY` | Yes, to boot | See [Rough edges](#rough-edges) — a placeholder is enough in development |
| `EBIRD_API_KEY` | For most features | Hotspot search, recent species and checklists, taxonomy, and region bounds. Free and instant from [ebird.org/api/keygen](https://ebird.org/api/keygen) |
| `OPENBIRDING_API_URL` | For target species | Base URL of the OpenBirding API. Not recorded in the repo — ask the maintainer |
| `MAPBOX_SERVER_KEY` | For travel times | Directions between itinerary stops, and trip region images |
| `FRONTEND_URL` | For magic links | Base URL used in emailed sign-in links |
| `DEEPL_KEY` | No | Hotspot name translation |
| `NTFY_TOPIC` | No | Ops alerts |
| `S3_*` | No | Cloudflare R2 image storage. Guarded by `hasS3Config`; uploads are skipped when absent |

A working development file:

```bash
MONGO_URI=mongodb://localhost:27017/birdplan-dev
CORS_ORIGINS=http://localhost:5280
FRONTEND_URL=http://localhost:5280
RESEND_API_KEY=re_dev_placeholder
EBIRD_API_KEY=your_key
MAPBOX_SERVER_KEY=your_token
OPENBIRDING_API_URL=https://…
```

Leave `NODE_ENV` unset. `IS_DEV` is `NODE_ENV !== "production"`, and it controls the email fallback described below.

### `frontend/.env`

`frontend/vite-env.d.ts` is the authoritative list — four variables:

```bash
VITE_API_URL=http://localhost:5100/v1
VITE_URL=http://localhost:5280
VITE_MAPBOX_KEY=pk.your_public_token
VITE_OPENBIRDING_API_URL=https://…
```

`VITE_API_URL` is concatenated onto URL-shaped React Query keys (`useQuery({ queryKey: ["/trips/123"] })` becomes `VITE_API_URL + "/trips/123"`), so it needs the `/v1` suffix and no trailing slash.

`VITE_OPENBIRDING_API_URL` **must be non-empty** even if you have no OpenBirding access — see [Rough edges](#rough-edges). Any non-matching URL works as a placeholder.

## Running

```bash
npm run dev            # frontend on :5280, backend on :5100
npm run dev:frontend
npm run dev:backend
npm run lint           # ESLint, frontend only
npm run typecheck      # builds backend, typechecks frontend + shared
```

Vite uses `strictPort: true`, so it fails rather than picking another port if 5280 is busy.

There is no test suite. `npm run typecheck` is the primary correctness gate, and both it and `lint` run in CI on every push. Run `typecheck` after any change that touches `shared/`, since those types flow into both the frontend and the backend.

## Signing in locally

Authentication is email OTP with opaque session tokens, but **no email provider is needed in development**. `sendEmail` short-circuits when `IS_DEV` and prints the message to the backend's stdout:

1. Go to `http://localhost:5280/signup` and enter any email address.
2. Read the six-digit code out of the backend console:
   ```
   📧 [dev] email not sent
     to: you@example.com
     subject: 123456 is your BirdPlan.app sign-in code
     body: …
   ```
3. Enter it.

Rate limits apply in development too: 2 code requests per 30 seconds and 5 per hour per email address, and 5 incorrect attempts before that code locks. Use a different address if you lock yourself out.

The same flow works over HTTP if you need a token for scripting:

```bash
curl -s -X POST localhost:5100/v1/auth/request-code \
  -H 'Content-Type: application/json' -d '{"email":"dev@example.com"}'
# read the code from the backend log
curl -s -X POST localhost:5100/v1/auth/verify-code \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@example.com","code":"123456"}'   # → {"token":"…"}
```

The **admin dashboard** at `/admin` is gated on `User.isAdmin`, which has no UI. Set it directly:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })
```

## Rough edges

Two things behave in ways that are hard to diagnose from the outside. Both may be fixed by the time you read this.

**The backend won't start without `RESEND_API_KEY`.** `backend/lib/email.ts` runs `new Resend(process.env.RESEND_API_KEY)` at module load, outside the `IS_DEV` guard, and the Resend constructor throws on a falsy key. The development console fallback covers *sending*, not *construction*, so the module cannot load at all. Any non-empty string works as a placeholder.

**Every query silently breaks if `VITE_OPENBIRDING_API_URL` is unset or empty.** The global `queryFn` in `frontend/main.tsx` decides whether to prefix a query key with the API base URL:

```js
const isApiRoute = url.startsWith("/") && !url.startsWith(import.meta.env.VITE_OPENBIRDING_API_URL || "");
```

With the variable unset this falls back to `""`, and `url.startsWith("")` is always true — so `isApiRoute` is always false, no query gets the `VITE_API_URL` prefix, and requests resolve against the Vite dev server, returning `index.html`. The symptom is misleading: signing in works, because `lib/http.ts` prefixes unconditionally, but no data loads anywhere and no error points at the cause. Set the variable to any non-empty value.

Note that a non-empty placeholder also makes the OpenBirding hooks *enabled* — `useLocationTargets` and `useDownloadTargets` gate on `!!OPENBIRDING_API_URL` — so they will fire requests that fail. That is contained to the target species pages.

## Working without third-party credentials

| Available | Needs credentials |
|---|---|
| Trip CRUD, regions, dates, settings | Target species list — `OPENBIRDING_API_URL` |
| Itinerary: days, stops, reordering, notes, print view | Species detail page and monthly frequency charts — `OPENBIRDING_API_URL` |
| Life lists, participants, invites, sharing | Top hotspots rankings — `OPENBIRDING_API_URL` |
| Saved hotspots and custom markers | Map tiles — `VITE_MAPBOX_KEY` |
| Auth, account, admin | Travel times between stops — `MAPBOX_SERVER_KEY` |
| | Hotspot search, recent species/checklists, taxonomy — `EBIRD_API_KEY` |

**Creating a trip requires `EBIRD_API_KEY`** even though most of what you can then do with it does not: `POST /v1/trips` calls `getBounds()` against the eBird region API and fails without it.

To get usable data with no third-party keys at all, sign in over HTTP as above and insert documents directly. You need a `trips` document and a matching `participants` document (`status: "active"`, `isOwner: true`, `listMode: "world"`). Shapes follow `backend/models/`. For the itinerary, each location past the first in a day carries `travel: { time, distance, method, locationId }`, where `locationId` is the location it departs *from* — writing those by hand exercises the travel-time UI without a Mapbox key.

## Nothing to seed

These look like setup steps but aren't:

- **Species images** — `frontend/public/avicommons.json` is committed. `npm run get-avicommons` only refreshes it.
- **Taxonomy** — proxied live from eBird; needs only `EBIRD_API_KEY`.
- **Timezones** — `frontend/timezones.json` and `timezones-flat.json` are committed. `npm run tz-sync-regions` only refreshes them.
- **eBird requests from the browser** — routed through `/v1/ebird-proxy`, which injects the key server-side.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Backend exits at startup with "Missing API key" | `RESEND_API_KEY` unset — see [Rough edges](#rough-edges) |
| Sign-in works but no data loads anywhere | `VITE_OPENBIRDING_API_URL` unset or empty — see [Rough edges](#rough-edges) |
| Every request fails with a CORS error | `CORS_ORIGINS` unset, or not matching the origin you're browsing from |
| Requests 404, or return HTML | `VITE_API_URL` missing the `/v1` suffix, or has a trailing slash |
| No sign-in code appears in the console | `NODE_ENV=production` is set locally, which disables the console fallback |
| "Too many requests" when signing in | OTP rate limits; use a different email address |
| Map area is blank | `VITE_MAPBOX_KEY` missing, or not a public `pk.…` token |
| Hotspots and recent species empty | `EBIRD_API_KEY` missing; check the backend console for proxy errors |
| Trip creation fails | `EBIRD_API_KEY` missing — region bounds are fetched from eBird |
| Target species pages empty | `OPENBIRDING_API_URL` not configured |
| Itinerary shows no days | The trip has no `startDate`/`endDate`; days are derived from the date range |
| Vite exits immediately | Port 5280 in use; `strictPort` means no fallback |
