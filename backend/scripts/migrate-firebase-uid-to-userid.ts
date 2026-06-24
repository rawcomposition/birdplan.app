// One-time migration: collapse the redundant Firebase `uid` onto the app's own `_id`.
//
// Pre-OTP prod schema (the only schema this targets — the OTP branch is not deployed):
//   profiles:     _id (nanoId/ObjectId-string), uid (28-char Firebase uid)
//   trips:        ownerId = Firebase uid
//   invites:      ownerId = Firebase uid, uid = Firebase uid (when accepted)
//   participants: uid = Firebase uid (when registered)
//
// After:
//   users (renamed from profiles):  _id stays canonical, `uid` field + its index dropped
//   trips.ownerId / invites.ownerId / invites.userId / participants.userId  all hold a User._id
//
// Defaults to a DRY RUN (reports only). Pass --execute to write.
//   npx tsx backend/scripts/migrate-firebase-uid-to-userid.ts            # dry run
//   npx tsx backend/scripts/migrate-firebase-uid-to-userid.ts --execute  # apply
//   add --force to proceed even if orphan foreign keys are found
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

const EXECUTE = process.argv.includes("--execute");
const FORCE = process.argv.includes("--force");
const mode = EXECUTE ? "EXECUTE" : "DRY RUN";
const did = EXECUTE ? "" : "would ";

async function migrate() {
  await mongoose.connect(MONGO_URI!);
  const db = mongoose.connection.db!;
  console.log(`Connected to MongoDB — ${mode}\n`);

  const profiles = db.collection("profiles");
  const usersTarget = db.collection("users");
  const trips = db.collection("trips");
  const invites = db.collection("invites");
  const participants = db.collection("participants");

  // An empty `users` collection is auto-created the moment the User model registers against
  // this DB, and it silently blocks the final rename ("target namespace exists"). Drop it if
  // empty; only a populated `users` means the migration already ran, which is a real abort.
  const usersExists = (await db.listCollections({ name: "users" }).toArray()).length > 0;
  if (usersExists && (await usersTarget.countDocuments({})) > 0) {
    throw new Error("A non-empty `users` collection already exists — has this migration already run? Aborting.");
  }
  if (usersExists) {
    console.log(`${did}drop the empty auto-created \`users\` collection before renaming`);
  }

  // 1. Build firebaseUid -> _id map and sanity-check the canonical ids.
  const profileDocs = (await profiles.find({}, { projection: { _id: 1, uid: 1 } }).toArray()) as unknown as {
    _id: string;
    uid?: string;
  }[];
  const uidToId = new Map<string, string>();
  let missingUid = 0;
  let badId = 0;
  for (const p of profileDocs) {
    if (typeof p._id !== "string" || p._id.length < 16) badId++;
    if (!p.uid) {
      missingUid++;
      continue;
    }
    uidToId.set(p.uid, p._id);
  }
  console.log(`profiles: ${profileDocs.length} total, ${uidToId.size} with a uid`);
  if (missingUid) console.warn(`  ⚠️  ${missingUid} profile(s) have no uid (will keep _id, nothing to map)`);
  if (badId) console.warn(`  ⚠️  ${badId} profile(s) have a non-string/short _id — review before keeping _id as canonical`);

  // 2. Pre-flight: find foreign keys that don't resolve to a profile.
  const resolves = (v?: string | null) => !v || uidToId.has(v);
  const orphans: string[] = [];

  const tripOwners = (await trips.distinct("ownerId")) as string[];
  const orphanTripOwners = tripOwners.filter((v) => !resolves(v));
  if (orphanTripOwners.length) orphans.push(`trips.ownerId: ${orphanTripOwners.length} unmatched (${orphanTripOwners.slice(0, 5).join(", ")}${orphanTripOwners.length > 5 ? ", …" : ""})`);

  const partUids = ((await participants.distinct("uid")) as string[]).filter(Boolean);
  const orphanPartUids = partUids.filter((v) => !resolves(v));
  if (orphanPartUids.length) orphans.push(`participants.uid: ${orphanPartUids.length} unmatched`);

  const inviteOwners = (await invites.distinct("ownerId")) as string[];
  const orphanInviteOwners = inviteOwners.filter((v) => !resolves(v));
  if (orphanInviteOwners.length) orphans.push(`invites.ownerId: ${orphanInviteOwners.length} unmatched`);

  const inviteUids = ((await invites.distinct("uid")) as string[]).filter(Boolean);
  const orphanInviteUids = inviteUids.filter((v) => !resolves(v));
  if (orphanInviteUids.length) orphans.push(`invites.uid: ${orphanInviteUids.length} unmatched`);

  if (orphans.length) {
    console.warn(`\n⚠️  Orphan foreign keys (no matching profile) — these will be LEFT UNCHANGED:`);
    orphans.forEach((o) => console.warn(`  - ${o}`));
    if (!FORCE && EXECUTE) {
      throw new Error("Orphan foreign keys found. Re-run with --force to proceed (orphans are left as-is).");
    }
  } else {
    console.log("Pre-flight: every foreign key resolves to a profile. ✅");
  }

  // Repoint a collection's field from Firebase uid -> _id. `rename` also $unsets the old field name.
  const repoint = async (
    coll: typeof trips,
    fromField: string,
    toField: string,
    label: string
  ) => {
    const docs = (await coll.find({ [fromField]: { $exists: true, $ne: null } }, { projection: { [fromField]: 1 } }).toArray()) as Record<string, any>[];
    const ops = [];
    for (const d of docs) {
      const oldVal = d[fromField];
      const newVal = uidToId.get(oldVal);
      if (!newVal) continue; // orphan — leave unchanged
      const update: Record<string, any> = { $set: { [toField]: newVal } };
      if (fromField !== toField) update.$unset = { [fromField]: "" };
      ops.push({ updateOne: { filter: { _id: d._id }, update } });
    }
    console.log(`${label}: ${docs.length} doc(s) with ${fromField}, ${ops.length} to repoint${fromField !== toField ? ` (rename ${fromField}→${toField})` : ""}`);
    if (EXECUTE && ops.length) await coll.bulkWrite(ops);
  };

  console.log("");
  await repoint(trips, "ownerId", "ownerId", "trips.ownerId");
  await repoint(invites, "ownerId", "ownerId", "invites.ownerId");
  await repoint(invites, "uid", "userId", "invites.uid");
  await repoint(participants, "uid", "userId", "participants.userId");

  // Orphan foreign keys (uid with no matching profile) are skipped above and keep a stale `uid`.
  // Drop it so no `uid` survives anywhere — those rows simply become name-only participants.
  const keys = [...uidToId.keys()];
  const stalePart = await participants.countDocuments({ uid: { $exists: true, $nin: keys } });
  const staleInvite = await invites.countDocuments({ uid: { $exists: true, $nin: keys } });
  if (EXECUTE) {
    await participants.updateMany({ uid: { $exists: true, $nin: keys } }, { $unset: { uid: "" } });
    await invites.updateMany({ uid: { $exists: true, $nin: keys } }, { $unset: { uid: "" } });
  }
  console.log(`${did}drop stale orphan uid on ${stalePart} participant(s), ${staleInvite} invite(s)`);

  // 3. Drop the `uid` field + its unique index from profiles, then rename profiles -> users.
  const dropIndex = async (coll: typeof profiles, name: string) => {
    try {
      if (EXECUTE) await coll.dropIndex(name);
      console.log(`  ${did}drop index ${name} on ${coll.collectionName}`);
    } catch {
      console.log(`  index ${name} on ${coll.collectionName} not present (skipped)`);
    }
  };

  console.log("\nUsers collection:");
  await dropIndex(profiles, "uid_1");
  if (EXECUTE) await profiles.updateMany({}, { $unset: { uid: "" } });
  console.log(`  ${did}$unset uid on ${profileDocs.length} profile(s)`);
  if (EXECUTE) {
    if (usersExists) await usersTarget.drop();
    await profiles.rename("users");
  }
  console.log(`  ${did}rename collection profiles → users`);

  // 4. Replace stale uid-based indexes on participants/invites with userId-based ones.
  console.log("\nIndexes:");
  await dropIndex(participants, "uid_1");
  await dropIndex(participants, "tripId_1_uid_1");
  await dropIndex(invites, "tripId_1_uid_1");
  if (EXECUTE) {
    await participants.createIndex({ userId: 1 });
    await participants.createIndex({ tripId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
    await invites.createIndex({ tripId: 1, userId: 1 });
  }
  console.log(`  ${did}create userId-based indexes on participants/invites`);

  console.log(`\nDone (${mode}).`);
  if (!EXECUTE) console.log("No changes were written. Re-run with --execute to apply.");

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
