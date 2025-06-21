import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
    authDomain: "bird-planner.firebaseapp.com",
    projectId: "bird-planner",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: "bird-planner.appspot.com",
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
