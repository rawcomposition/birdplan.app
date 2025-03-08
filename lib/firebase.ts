import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as fs from "firebase/firestore";
import { Profile } from "lib/types";
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

export const subscribeToProfiles = (ids: string[], callback: (profiles: Profile[]) => void): (() => void) => {
  return fs.onSnapshot(fs.query(fs.collection(db, "profile"), fs.where(fs.documentId(), "in", ids)), (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id } as Profile)));
  });
};
