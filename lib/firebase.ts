import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as fs from "firebase/firestore";
import { Profile, Hotspot, Trip, TripInput, Target } from "lib/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: "bird-planner.firebaseapp.com",
  projectId: "bird-planner",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = fs.getFirestore(app);

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

export const updateTargets = async (tripId: string, targets: Target[]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "trip", tripId), { targets }, { merge: true });
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

export const subscribeToTrip = (id: string, callback: (trip: Trip) => void): (() => void) => {
  return fs.onSnapshot(fs.doc(db, "trip", id), (doc) => {
    if (doc.exists()) {
      callback({ ...doc.data(), id: doc.id } as Trip);
    }
  });
};

export const subscribeToTrips = (callback: (trips: Trip[]) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  const q = fs.query(fs.collection(db, "trip"), fs.where("userId", "==", user.uid));
  return fs.onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Trip)));
  });
};

export const subscribeToProfile = (callback: (profile: Profile) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  return fs.onSnapshot(fs.doc(db, "profile", user.uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Profile);
    }
  });
};
