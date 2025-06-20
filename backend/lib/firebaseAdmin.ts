import firebase from "firebase-admin";
import { nanoId } from "lib/utils.js";
import { getStorage } from "firebase-admin/storage";

const hasFirebaseConfig = !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);

if (hasFirebaseConfig && !firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: "bird-planner",
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: "bird-planner.appspot.com",
  });
}

export const admin = firebase;
export const auth = hasFirebaseConfig ? firebase.auth() : null;

export async function uploadMapboxImageToStorage(mapboxImageUrl: string): Promise<string | null> {
  if (!hasFirebaseConfig) {
    console.warn("Firebase not configured, skipping image upload");
    return null;
  }

  const id = nanoId();
  const res = await fetch(mapboxImageUrl);

  if (!res.ok) {
    console.error("Failed to load Mapbox image", res.statusText, mapboxImageUrl);
    return null; // No error thrown since some regions (e.g. Antarctica) don't have a Mapbox image.
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${id}.png`;

  const storage = getStorage().bucket();
  const file = storage.file(fileName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/png",
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", async () => {
      try {
        await file.makePublic();
        const url = `https://storage.googleapis.com/${storage.name}/${fileName}`;
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });

    stream.end(buffer);
  });
}
