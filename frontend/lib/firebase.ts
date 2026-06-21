import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, Auth } from "firebase/auth";

const hasFirebaseConfig = !!(
  import.meta.env.VITE_FIREBASE_KEY &&
  import.meta.env.VITE_FIREBASE_SENDER_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

let auth: Auth | null = null;
let authReady: Promise<void> = Promise.resolve();

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_KEY,
    authDomain: "bird-planner.firebaseapp.com",
    projectId: "bird-planner",
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: "bird-planner.appspot.com",
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  authReady = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, () => {
      unsubscribe();
      resolve();
    });
  });
}

export { auth, authReady };
