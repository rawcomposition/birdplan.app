import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setDoc, getDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: "rare-birds.firebaseapp.com",
  projectId: "rare-birds",
  storageBucket: "rare-birds.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const saveSeenSpecies = async (seenSpecies: string[]) => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }
  await setDoc(doc(db, "seenSpecies", user.uid), {
    species_ids: seenSpecies,
  });
};

export const uploadSeenSpeciesFromLocalStorage = async () => {
  try {
    const seen = window.localStorage.getItem("seen");
    if (seen) {
      const seenArray = JSON.parse(seen);
      if (Array.isArray(seenArray) && seenArray.length > 0) {
        saveSeenSpecies(seenArray);
      }
    }
  } catch (error) {}
};

export const fetchSeenSpecies = async () => {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }
  const snapshot = await getDoc(doc(db, "seenSpecies", user.uid));
  if (snapshot.exists()) {
    return snapshot.data()?.species_ids;
  }
  return [];
};
