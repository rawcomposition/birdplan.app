import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as fs from "firebase/firestore";
import { Profile, Hotspot, Trip, TripInput } from "lib/types";

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
export const db = fs.getFirestore(app);

export const fetchProfile = async (): Promise<Profile | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await fs.getDoc(fs.doc(db, "profile", user.uid));
  if (snapshot.exists()) {
    return snapshot.data() as Profile;
  }
  return null;
};

export const setProfileValue = async (key: string, value: Profile[keyof Profile]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "profile", user.uid),
    {
      [key]: value,
    },
    { merge: true }
  );
};

export const appendProfileLifelist = async (speciesCode: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "profile", user.uid),
    {
      lifelist: fs.arrayUnion(speciesCode),
    },
    { merge: true }
  );
};

export const removeProfileLifelist = async (speciesCode: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "profile", user.uid),
    {
      lifelist: fs.arrayRemove(speciesCode),
    },
    { merge: true }
  );
};

export const updateHotspots = async (tripId: string, hotspots: Hotspot[]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "trip", tripId), { hotspots }, { merge: true });
};

export const getTrip = async (id: string): Promise<Trip | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await fs.getDoc(fs.doc(db, "trip", id));
  if (snapshot.exists()) {
    return snapshot.data() as Trip;
  }
  return null;
};

export const getTrips = async (): Promise<Trip[]> => {
  const user = auth.currentUser;
  if (!user) return [];
  const q = fs.query(fs.collection(db, "trip"), fs.where("userId", "==", user.uid));
  const snapshot = await fs.getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Trip));
};

export const createTrip = async (trip: TripInput): Promise<Trip | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const doc = await fs.addDoc(fs.collection(db, "trip"), { ...trip, userId: user.uid });
  return { ...trip, id: doc.id, userId: user.uid };
};

export const deleteTrip = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.deleteDoc(fs.doc(db, "trip", id));
};
