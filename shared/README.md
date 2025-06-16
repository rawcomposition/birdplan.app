# @birdplan/shared

This package contains shared TypeScript types and interfaces used across the BirdPlan frontend and backend applications.

## Usage

### In Frontend (Next.js)

```typescript
import { Trip, Hotspot, Profile } from "@birdplan/shared";

const trip: Trip = {};
```

### In Backend (Hono)

```typescript
import { Trip, TripInput, Profile } from "@birdplan/shared";

const createTrip = (input: TripInput): Trip => {};
```

## Development

To build the package:

```bash
npm run build
```

To watch for changes during development:

```bash
npm run dev
```

## Building

The package is automatically built when running the root `dev` script. Make sure to build the shared package before starting the frontend or backend in development mode.
