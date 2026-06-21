/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OPENBIRDING_API_URL: string;
  readonly VITE_URL: string;
  readonly VITE_MAPBOX_KEY: string;
  readonly VITE_GOOGLE_MAPS_KEY: string;
  readonly VITE_FIREBASE_KEY: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_SENDER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
