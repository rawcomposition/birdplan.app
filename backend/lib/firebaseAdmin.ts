import firebase from "firebase-admin";
import { nanoId } from "lib/utils.js";
import { getStorage } from "firebase-admin/storage";

const hasFirebaseConfig = !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_APP_NAME);

// Determine storage bucket: use env var if provided, otherwise derive from project ID
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ||
  (process.env.FIREBASE_APP_NAME ? `${process.env.FIREBASE_APP_NAME}.appspot.com` : undefined);

if (hasFirebaseConfig && !firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process.env.FIREBASE_APP_NAME,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    ...(storageBucket && { storageBucket }),
  });
}

export const admin = firebase;
export const auth = hasFirebaseConfig ? firebase.auth() : null;

export async function uploadMapboxImageToStorage(mapboxImageUrl: string): Promise<string | null> {
  if (!hasFirebaseConfig) {
    console.warn("Firebase not configured, skipping image upload");
    return null;
  }

  if (!storageBucket) {
    console.warn("Firebase storage bucket not configured, skipping image upload");
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

  try {
    const storage = getStorage().bucket();
    const file = storage.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: "image/png",
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        console.error("Failed to upload image to storage", error);
        // Don't reject - return null to allow trip creation to continue without image
        resolve(null);
      });
      stream.on("finish", async () => {
        try {
          await file.makePublic();
          const url = `https://storage.googleapis.com/${storage.name}/${fileName}`;
          resolve(url);
        } catch (error) {
          console.error("Failed to make file public", error);
          // Don't reject - return null to allow trip creation to continue without image
          resolve(null);
        }
      });

      stream.end(buffer);
    });
  } catch (error) {
    console.error("Storage bucket error", error);
    return null; // Allow trip creation to continue without image
  }
}
