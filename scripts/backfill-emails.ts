import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../backend/.env") });

import mongoose from "mongoose";
import firebase from "firebase-admin";

const WRITE = process.argv.includes("--write");

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";

const ProfileSchema = new mongoose.Schema(
  {
    _id: String,
    uid: String,
    email: String,
  },
  { strict: false }
);
const Profile = mongoose.model("Profile", ProfileSchema);

type FirebaseUserInfo = { email: string; providers: string[] };

async function listAllFirebaseUsers(auth: firebase.auth.Auth) {
  const byUid = new Map<string, FirebaseUserInfo>();
  let pageToken: string | undefined;
  do {
    const result = await auth.listUsers(1000, pageToken);
    for (const user of result.users) {
      byUid.set(user.uid, {
        email: normalizeEmail(user.email),
        providers: user.providerData.map((p) => p.providerId),
      });
    }
    pageToken = result.pageToken;
  } while (pageToken);
  return byUid;
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("Missing Firebase credentials");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  if (!firebase.apps.length) {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: "bird-planner",
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  const auth = firebase.auth();

  const firebaseUsers = await listAllFirebaseUsers(auth);
  console.log(`Fetched ${firebaseUsers.size} Firebase users`);

  const profiles = await Profile.find({}).lean<{ _id: string; uid: string; email?: string }[]>();
  console.log(`Found ${profiles.length} profiles`);

  let backfilled = 0;
  const noFirebaseMatch: string[] = [];
  const noEmail: string[] = [];

  for (const profile of profiles) {
    const existingEmail = normalizeEmail(profile.email);
    if (existingEmail) {
      if (WRITE && existingEmail !== profile.email) {
        await Profile.updateOne({ _id: profile._id }, { $set: { email: existingEmail } });
      }
      continue;
    }

    const fb = firebaseUsers.get(profile.uid);
    if (!fb) {
      noFirebaseMatch.push(profile.uid);
      noEmail.push(profile.uid);
      continue;
    }
    if (!fb.email) {
      noEmail.push(profile.uid);
      continue;
    }

    if (WRITE) {
      await Profile.updateOne({ _id: profile._id }, { $set: { email: fb.email } });
    }
    backfilled++;
  }

  const refreshed = await Profile.find({}).select("uid email").lean<{ uid: string; email?: string }[]>();
  const emailCounts = new Map<string, string[]>();
  for (const profile of refreshed) {
    const email = normalizeEmail(profile.email);
    if (!email) continue;
    const list = emailCounts.get(email) ?? [];
    list.push(profile.uid);
    emailCounts.set(email, list);
  }
  const duplicates = [...emailCounts.entries()].filter(([, uids]) => uids.length > 1);

  console.log("\n========== AUDIT REPORT ==========");
  console.log(`Mode: ${WRITE ? "WRITE (changes applied)" : "DRY RUN (no changes — pass --write to apply)"}`);
  console.log(`Profiles ${WRITE ? "backfilled" : "to backfill"}: ${backfilled}`);
  console.log(`Profiles with no Firebase match: ${noFirebaseMatch.length}`);
  if (noFirebaseMatch.length) console.log(`  uids: ${noFirebaseMatch.join(", ")}`);
  console.log(`Profiles still missing an email (manual resolution needed): ${noEmail.length}`);
  if (noEmail.length) console.log(`  uids: ${noEmail.join(", ")}`);
  console.log(`Duplicate emails across profiles (de-dupe before unique index): ${duplicates.length}`);
  for (const [email, uids] of duplicates) {
    console.log(`  ${email}: ${uids.join(", ")}`);
  }
  console.log("\nAfter this report is clean (no missing emails, no duplicates),");
  console.log("add the unique index manually: db.profiles.createIndex({ email: 1 }, { unique: true })");
  console.log("==================================\n");

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
