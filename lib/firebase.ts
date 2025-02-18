import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as fs from "firebase/firestore";
import { Profile, Hotspot, Trip, TripInput, Targets, CustomMarker, Invite, Day } from "lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: "bird-planner.firebaseapp.com",
  projectId: "bird-planner",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: "bird-planner.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true });

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

export async function uploadFile(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "";
  const id = uuidv4();
  const storage = getStorage();
  const name = `${id}.${ext}`;
  const storageRef = ref(storage, name);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

export const updateHotspots = async (tripId: string, hotspots: Hotspot[]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "trip", tripId), { hotspots }, { merge: true });
};

export const updateItinerary = async (tripId: string, itinerary: Day[]) => {
  const user = auth.currentUser;
  if (!user) return;
  const updatedTrip = await fs.setDoc(fs.doc(db, "trip", tripId), { itinerary }, { merge: true });
};

export const updateTargets = async (id: string, data: Targets, shouldTimestamp?: boolean) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "targets", id), {
    ...data,
    ...(shouldTimestamp ? { updatedAt: fs.serverTimestamp() } : {}),
  });
};

export const addTargets = async (data: Targets): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const res = await fs.addDoc(fs.collection(db, "targets"), {
    ...data,
    updatedAt: fs.serverTimestamp(),
  });
  return res.id;
};

export const deleteTargets = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.deleteDoc(fs.doc(db, "targets", id));
};

export const getTargets = async (id: string): Promise<Targets | null> => {
  const doc = await fs.getDoc(fs.doc(db, "targets", id));
  if (doc.exists()) {
    return doc.data() as Targets;
  } else {
  }
  return null;
};

export const updateMarkers = async (tripId: string, markers: CustomMarker[]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "trip", tripId), { markers }, { merge: true });
};

export const createTrip = async (trip: TripInput): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const doc = await fs.addDoc(fs.collection(db, "trip"), {
    ...trip,
    userIds: [user.uid],
    ownerId: user.uid,
    ownerName: user.displayName,
  });
  return doc.id;
};

type TripUpdateT = {
  tripId: string;
  name: string;
  startMonth: number;
  endMonth: number;
};

export const updateTrip = async ({ tripId, name, startMonth, endMonth }: TripUpdateT): Promise<boolean | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  await fs.setDoc(fs.doc(db, "trip", tripId), { name, startMonth, endMonth }, { merge: true });
  return true;
};

export const deleteTrip = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.deleteDoc(fs.doc(db, "trip", id));
};

export const removeUserFromTrip = async (tripId: string, userId: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "trip", tripId),
    {
      userIds: fs.arrayRemove(userId),
    },
    { merge: true }
  );
};

export const addTargetStarToTrip = async (tripId: string, code: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "trip", tripId),
    {
      targetStars: fs.arrayUnion(code),
    },
    { merge: true }
  );
};

export const removeTargetStarFromTrip = async (tripId: string, code: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(
    fs.doc(db, "trip", tripId),
    {
      targetStars: fs.arrayRemove(code),
    },
    { merge: true }
  );
};

export const setTargetNotesOnTrip = async (tripId: string, code: string, notes: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.updateDoc(fs.doc(db, "trip", tripId), { [`targetNotes.${code}`]: notes });
};

export const setTripStartDate = async (tripId: string, startDate: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.setDoc(fs.doc(db, "trip", tripId), { startDate }, { merge: true });
};

export const deleteInvite = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.deleteDoc(fs.doc(db, "invite", id));
};

export const subscribeToTrip = (id: string, callback: (trip: Trip) => void, on404: () => void): (() => void) => {
  return fs.onSnapshot(fs.doc(db, "trip", id), (doc) => {
    if (doc.exists()) {
      callback({ ...doc.data(), id: doc.id } as Trip);
    } else {
      on404();
    }
  });
};

export const subscribeToTripTargets = (tripId: string, callback: (data: Targets) => void): (() => void) => {
  return fs.onSnapshot(fs.doc(db, "targets", tripId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Targets);
    }
  });
};

export const subscribeToTrips = (callback: (trips: Trip[]) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  const q = fs.query(
    fs.collection(db, "trip"),
    fs.where("userIds", "array-contains", user.uid),
    fs.orderBy("createdAt", "desc")
  );
  return fs.onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Trip)));
  });
};

export const subscribeToProfile = (callback: (profile: Profile) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  return fs.onSnapshot(fs.doc(db, "profile", user.uid), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Profile);
    }
  });
};

export const subscribeToProfiles = (ids: string[], callback: (profiles: Profile[]) => void): (() => void) => {
  return fs.onSnapshot(fs.query(fs.collection(db, "profile"), fs.where(fs.documentId(), "in", ids)), (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id } as Profile)));
  });
};

export const subscribeToTripInvites = (id: string, callback: (invites: Invite[]) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  return fs.onSnapshot(
    fs.query(fs.collection(db, "invite"), fs.where("tripId", "==", id), fs.where("ownerId", "==", user.uid)),
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Invite)));
    }
  );
};

export const subscribeToHotspotTargets = (tripId: string, callback: (targets: Targets[]) => void): (() => void) => {
  return fs.onSnapshot(
    fs.query(fs.collection(db, "targets"), fs.where("tripId", "==", tripId), fs.orderBy("updatedAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Targets)));
    }
  );
};
