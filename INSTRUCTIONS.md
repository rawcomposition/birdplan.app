# Instructions

Your job is to refactor the /frontend/app/api (in nextjs) into Fastify in the /backend folder. The API route URLs should remain the same.

The current Nextjs API uses following technologies:

- Firebase for Auth (using the admin SDK)
- Mongoose/MongoDB
- TypeScript
- Resend for transactional email
- Axios only for certain external API calls (e.g. eBird) that need the extra customization

## Folder checklist - mark each folder as complete

- [ ] account
- [ ] ebird-proxy
- [ ] forgot-password
- [ ] generate-quiz
- [ ] invites
- [ ] my-profile
- [ ] piper
- [x] region
- [ ] reset-password
- [ ] support
- [ ] taxonomy
- [ ] trips
- [ ] verify-reset-token

### When performing each task above, make sure you do the following:

- Follow fastify best practices, especially around error handling, type-safety, structure/organization, plugins, etc.
- Create controller files for each route (if applicable)
- Use the controller/user.ts naming style for controller files
- Always use typescript and .ts file extensions
- Ensure the code is type-safe
- Use types instead of interfaces
- Put types that are shared between the frontend and backend in the root `@shared` folder and import like `import { User } from "@shared/types"`
- If you have any recommendations on how to make the code more organized in the context of Fastify, mention it.
- Mark the folder as complete when you are done
- Use MINIMAL code comments, if at all
- Do not use relative import paths, use the `@` alias
- Do not write any tests yet
- Note that you do not have permission to access the .env file. See below for an example of what's available

## Environment variables

RESEND_API_KEY=re_NiB...
MAPBOX_SERVER_KEY=pk.eyJ1I...
MONGO_URI=mongodb+srv://rawcomposition:...
PIPER_KEY=bcbf...
FRONTEND_URL=https://localhost:3000
DEEPL_KEY=a2bfa...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...
EBIRD_API_KEY=1gcdgl2ihetr

### Breaking changes - list any breaking changes below

- ...

## Full Nextjs folder tree (for reference)

├── app
│   └── api
│   └── v1
│   ├── account
│   │   ├── route.ts
│   │   └── update-email
│   │   └── route.ts
│   ├── ebird-proxy
│   │   └── [...path]
│   │   └── route.ts
│   ├── forgot-password
│   │   └── route.ts
│   ├── generate-quiz
│   │   └── route.ts
│   ├── invites
│   │   ├── [id]
│   │   │   ├── accept
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── my-profile
│   │   ├── add-to-lifelist
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── piper
│   │   ├── get-cookiejar
│   │   │   └── route.ts
│   │   └── set-cookiejar
│   │   └── route.ts
│   ├── region
│   │   └── [region]
│   │   ├── hotspots
│   │   │   └── route.ts
│   │   └── species
│   │   └── route.ts
│   ├── reset-password
│   │   └── route.ts
│   ├── support
│   │   └── route.ts
│   ├── taxonomy
│   │   └── route.ts
│   ├── trips
│   │   ├── [id]
│   │   │   ├── all-hotspot-targets
│   │   │   │   └── route.ts
│   │   │   ├── editors
│   │   │   │   └── route.ts
│   │   │   ├── export
│   │   │   │   └── route.ts
│   │   │   ├── hotspots
│   │   │   │   ├── [hotspotId]
│   │   │   │   │   ├── add-species-fav
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── info
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── notes
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── obs
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── remove-species-fav
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── reset-name
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── reset-targets
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── targets
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── translate-name
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── invites
│   │   │   │   └── route.ts
│   │   │   ├── itinerary
│   │   │   │   ├── [dayId]
│   │   │   │   │   ├── add-location
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── calc-travel-time
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── move-location
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── notes
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── remove-location
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── remove-travel-time
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── set-notes
│   │   │   │   │   └── route.ts
│   │   │   │ └── route.ts
│   │   │   ├── markers
│   │   │   │ ├── [markerId]
│   │   │   │ │ ├── notes
│   │   │   │ │ │ └── route.ts
│   │   │   │ │ └── route.ts
│   │   │   │ └── route.ts
│   │   │   ├── route.ts
│   │   │   ├── set-start-date
│   │   │   │ └── route.ts
│   │   │   └── targets
│   │   │ ├── add-star
│   │   │ │ └── route.ts
│   │   │ ├── remove-star
│   │   │ │ └── route.ts
│   │   │ ├── route.ts
│   │   │ └── set-notes
│   │   │ └── route.ts
│   │   └── route.ts
│   └── verify-reset-token
│   └── route.ts
├── lib
│   ├── api.ts
│   ├── config.ts
│   ├── db.ts
│   ├── email.ts
│   ├── firebase.ts
│   ├── firebaseAdmin.ts
│   ├── helpers.ts
│   ├── icons.ts
│   ├── itinerary.ts
│   ├── mapbox.ts
│   └── types.ts
├── modals
│   ├── AddHotspot.tsx
│   ├── AddItineraryLocation.tsx
│   ├── AddMarker.tsx
│   ├── AddPlace.tsx
│   ├── DeleteAccount.tsx
│   ├── Hotspot.tsx
│   ├── PersonalLocation.tsx
│   ├── Share.tsx
│   └── ViewMarker.tsx
├── models
│   ├── Invite.ts
│   ├── Profile.ts
│   ├── QuizImages.ts
│   ├── TargetList.ts
│   ├── Trip.ts
│   └── Vault.ts
├── next-env.d.ts
├── next.config.js
├── og-banner.afphoto
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── scripts
│   └── get-avicommons.ts
├── tailwind.config.js
├── tsconfig.json
