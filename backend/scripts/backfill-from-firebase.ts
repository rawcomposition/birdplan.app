// One-off pre-migration fix, sourcing identity from Firebase Auth by uid. Two parts:
//   1. Early users only got a `profiles` doc once they uploaded a life list — so users who
//      authenticated and created trips without a list have trips but no profile. Create them.
//   2. Some existing profiles predate the email/name fields and are missing them. Fill them in.
//
// Run this BEFORE migrate-firebase-uid-to-userid.ts, against the pre-OTP schema.
// Defaults to a DRY RUN. Pass --execute to write.
//   npx tsx backend/scripts/backfill-from-firebase.ts            # dry run
//   npx tsx backend/scripts/backfill-from-firebase.ts --execute  # apply
import mongoose from "mongoose";
import firebase from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { customAlphabet } from "nanoid";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("Missing FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL — needed to read from Firebase Auth");
  process.exit(1);
}

const EXECUTE = process.argv.includes("--execute");
const did = EXECUTE ? "" : "would ";
const nanoId = (length = 16) =>
  customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: "bird-planner",
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const isBlank = (v: any) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

async function run() {
  await mongoose.connect(MONGO_URI!);
  const db = mongoose.connection.db!;
  console.log(`Connected — ${EXECUTE ? "EXECUTE" : "DRY RUN"}\n`);

  const profiles = db.collection("profiles");
  const trips = db.collection("trips");
  const participants = db.collection("participants");
  const invites = db.collection("invites");
  const now = new Date();

  const profileDocs = (await profiles.find({}, { projection: { _id: 1, uid: 1, email: 1, name: 1 } }).toArray()) as any[];
  const knownUid = new Set(profileDocs.map((p) => p.uid).filter(Boolean));
  const emailToProfile = new Map<string, { _id: string; uid: string }>();
  for (const p of profileDocs) if (p.email && p.uid) emailToProfile.set(String(p.email).toLowerCase(), { _id: p._id, uid: p.uid });

  // --- Find orphan uids (referenced by a foreign key but with no profile) + a fallback name/date.
  const orphans = new Map<string, { name?: string; lastActiveAt?: Date }>();
  const addOrphan = (uid: any, name?: any, date?: any) => {
    if (!uid || knownUid.has(uid)) return;
    const e = orphans.get(uid) || {};
    if (!e.name && name) e.name = name;
    const d = date ? new Date(date) : undefined;
    if (d && (!e.lastActiveAt || d > e.lastActiveAt)) e.lastActiveAt = d;
    orphans.set(uid, e);
  };
  for (const t of (await trips.find({}, { projection: { ownerId: 1, ownerName: 1, updatedAt: 1 } }).toArray()) as any[]) addOrphan(t.ownerId, t.ownerName, t.updatedAt);
  for (const p of (await participants.find({ uid: { $exists: true } }, { projection: { uid: 1, name: 1, updatedAt: 1 } }).toArray()) as any[]) addOrphan(p.uid, p.name, p.updatedAt);
  for (const i of (await invites.find({ uid: { $exists: true } }, { projection: { uid: 1, name: 1, updatedAt: 1 } }).toArray()) as any[]) addOrphan(i.uid, i.name, i.updatedAt);

  // --- Existing profiles missing name and/or email.
  const incomplete = profileDocs.filter((p) => p.uid && (isBlank(p.email) || isBlank(p.name)));

  const orphanUids = [...orphans.keys()];
  console.log(`Orphan uids without a profile: ${orphanUids.length}`);
  console.log(`Existing profiles missing name/email: ${incomplete.length}\n`);

  // --- One batched Firebase lookup for everything we need.
  const lookupUids = [...new Set([...orphanUids, ...incomplete.map((p) => p.uid)])];
  const fbByUid = new Map<string, firebase.auth.UserRecord>();
  for (let i = 0; i < lookupUids.length; i += 100) {
    const res = await getAuth().getUsers(lookupUids.slice(i, i + 100).map((uid) => ({ uid })));
    res.users.forEach((u) => fbByUid.set(u.uid, u));
  }
  console.log(`Firebase Auth: ${fbByUid.size}/${lookupUids.length} found\n`);

  // === Part 1: create profiles for orphans (or merge if their email already has a profile). ===
  const toInsert: any[] = [];
  const merges: string[] = [];
  const orphanNoEmail: string[] = [];

  const mergeRepoint = async (fromUid: string, toUid: string) => {
    if (!EXECUTE) return;
    await trips.updateMany({ ownerId: fromUid }, { $set: { ownerId: toUid } });
    await participants.updateMany({ uid: fromUid }, { $set: { uid: toUid } });
    await invites.updateMany({ uid: fromUid }, { $set: { uid: toUid } });
    await invites.updateMany({ ownerId: fromUid }, { $set: { ownerId: toUid } });
  };

  for (const uid of orphanUids) {
    const fb = fbByUid.get(uid);
    const fallback = orphans.get(uid)!;
    const email = fb?.email?.toLowerCase();
    const name = fb?.displayName || fallback.name || undefined;
    if (!email) {
      orphanNoEmail.push(`${uid} (${name ?? "?"})`);
      continue;
    }
    const existing = emailToProfile.get(email);
    if (existing) {
      merges.push(`${uid} (${name ?? "?"}) → existing profile ${existing._id} <${email}>`);
      await mergeRepoint(uid, existing.uid);
      continue;
    }
    const created = fb?.metadata?.creationTime ? new Date(fb.metadata.creationTime) : undefined;
    const lastSignIn = fb?.metadata?.lastSignInTime ? new Date(fb.metadata.lastSignInTime) : undefined;
    const doc = {
      _id: nanoId(),
      uid,
      name: name ?? null,
      email,
      lifelist: [],
      exceptions: [],
      lastActiveAt: lastSignIn ?? fallback.lastActiveAt ?? now,
      lastAuthenticatedAt: lastSignIn ?? null,
      isAdmin: false,
      createdAt: created ?? fallback.lastActiveAt ?? now,
      updatedAt: now,
    };
    toInsert.push(doc);
    emailToProfile.set(email, { _id: doc._id, uid });
  }

  // === Part 2: fill missing name/email on existing profiles. ===
  const fieldOps: any[] = [];
  const fieldReport: string[] = [];
  const fieldCollisions: string[] = [];
  const fieldNoData: string[] = [];

  for (const p of incomplete) {
    const fb = fbByUid.get(p.uid);
    if (!fb) {
      fieldNoData.push(`${p._id} uid=${p.uid} (not in Firebase)`);
      continue;
    }
    const set: any = {};
    if (isBlank(p.name) && fb.displayName) set.name = fb.displayName;
    if (isBlank(p.email) && fb.email) {
      const email = fb.email.toLowerCase();
      const owner = emailToProfile.get(email);
      if (owner && owner._id !== p._id) {
        fieldCollisions.push(`${p._id} uid=${p.uid}: Firebase email <${email}> already on profile ${owner._id}`);
      } else {
        set.email = email;
        emailToProfile.set(email, { _id: p._id, uid: p.uid });
      }
    }
    if (Object.keys(set).length) {
      fieldOps.push({ updateOne: { filter: { _id: p._id }, update: { $set: { ...set, updatedAt: now } } } });
      fieldReport.push(`${p._id} uid=${p.uid} += ${JSON.stringify(set)}`);
    } else if (!fieldCollisions.some((c) => c.startsWith(p._id))) {
      fieldNoData.push(`${p._id} uid=${p.uid} (Firebase has no matching field)`);
    }
  }

  // --- Report + write.
  console.log(`${did}create ${toInsert.length} profile(s):`);
  toInsert.forEach((d) => console.log(`   _id=${d._id} uid=${d.uid} <${d.email}> "${d.name ?? "?"}"`));
  if (merges.length) {
    console.log(`\n${did}merge ${merges.length} orphan(s) into an existing profile (same email):`);
    merges.forEach((m) => console.log(`   ${m}`));
  }
  if (orphanNoEmail.length) {
    console.log(`\n⚠️  ${orphanNoEmail.length} orphan(s) have NO email in Firebase — left as-is:`);
    orphanNoEmail.forEach((n) => console.log(`   ${n}`));
  }

  console.log(`\n${did}backfill fields on ${fieldOps.length} existing profile(s):`);
  fieldReport.forEach((r) => console.log(`   ${r}`));
  if (fieldCollisions.length) {
    console.log(`\n⚠️  ${fieldCollisions.length} profile(s) skipped — Firebase email collides with another profile:`);
    fieldCollisions.forEach((c) => console.log(`   ${c}`));
  }
  if (fieldNoData.length) {
    console.log(`\n⚠️  ${fieldNoData.length} incomplete profile(s) had nothing to fill from Firebase:`);
    fieldNoData.forEach((n) => console.log(`   ${n}`));
  }

  // Safety assertion: after this runs, email is the OTP login key — no user should be left without one.
  const willHaveEmail = (p: any) => !isBlank(p.email) || fieldOps.some((o) => o.updateOne.filter._id === p._id && o.updateOne.update.$set.email);
  const stillNoEmail = profileDocs.filter((p) => !willHaveEmail(p) && !merges.some((m) => m.includes(p.uid)));
  console.log(`\nUsers that would STILL lack an email (can't OTP-login): ${stillNoEmail.length}`);
  stillNoEmail.forEach((p) => console.log(`   ${p._id} uid=${p.uid} name=${p.name ?? "?"}`));

  if (EXECUTE) {
    if (toInsert.length) await profiles.insertMany(toInsert);
    if (fieldOps.length) await profiles.bulkWrite(fieldOps);
  }

  console.log(`\nDone (${EXECUTE ? "EXECUTE" : "DRY RUN"}).`);
  if (!EXECUTE) console.log("No changes written. Re-run with --execute, then run migrate-firebase-uid-to-userid.ts.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("\nBackfill failed:", err);
  process.exit(1);
});
