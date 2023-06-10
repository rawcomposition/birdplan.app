import firebase from "firebase-admin";

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: "bird-planner",
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const admin = firebase;
export const auth = firebase.auth();
export const db = firebase.firestore();
