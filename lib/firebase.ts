import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setDoc, getDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Profile } from "lib/types";

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

export const fetchProfile = async (): Promise<Profile | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await getDoc(doc(db, "profile", user.uid));
  if (snapshot.exists()) {
    return snapshot.data() as Profile;
  }
  return null;
};

export const setProfileValue = async (key: string, value: Profile[keyof Profile]) => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(
    doc(db, "profile", user.uid),
    {
      [key]: value,
    },
    { merge: true }
  );
};

export const appendProfileLifelist = async (speciesCode: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(
    doc(db, "profile", user.uid),
    {
      lifelist: arrayUnion(speciesCode),
    },
    { merge: true }
  );
};

export const removeProfileLifelist = async (speciesCode: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(
    doc(db, "profile", user.uid),
    {
      lifelist: arrayRemove(speciesCode),
    },
    { merge: true }
  );
};
