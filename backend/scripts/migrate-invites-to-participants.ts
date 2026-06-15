/**
 * One-time migration: Invites + trip.userIds → the unified Participant collection.
 *
 * Per trip:
 *   1. Creates the owner's participant row (isOwner, active, World mode).
 *   2. Converts each Invite into a participant, reusing the invite's _id:
 *        - accepted (invite.uid set) → active participant, World mode (skipped if it's the owner)
 *        - pending                   → pending participant (no uid yet), World mode, empty list
 *   3. Verifies the resulting active-uid set equals the trip's old `userIds`, logging any diff.
 *
 * The custom/shared life-list feature (customLifelist / intersectionLists) is unlaunched, so
 * there is no production list data to migrate — only Invites.
 *
 * Idempotent: re-runnable (owner upserted by {tripId, uid}; invites upserted by their _id).
 * Does NOT delete invites or unset old Trip fields — that's a separate cleanup follow-up.
 *
 * Run manually: npx tsx backend/scripts/migrate-invites-to-participants.ts
 */
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

const nanoId = (length = 16) =>
  customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();

async function migrate() {
  await mongoose.connect(MONGO_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const trips = db.collection("trips");
  const invites = db.collection("invites");
  const participants = db.collection("participants");

  const allTrips = (await trips.find({}).toArray()) as any[];
  console.log(`Found ${allTrips.length} trips`);

  let ownerCount = 0;
  let inviteCount = 0;
  const mismatches: { tripId: string; expected: string[]; actual: string[] }[] = [];

  for (const trip of allTrips) {
    const now = new Date();
    const tripId = trip._id;

    // 1. Owner participant (active, World). Keyed on {tripId, uid} so re-runs don't duplicate.
    await participants.updateOne(
      { tripId, uid: trip.ownerId },
      {
        $set: { status: "active", listMode: "world", isOwner: true, name: trip.ownerName ?? null, updatedAt: now },
        $setOnInsert: { _id: nanoId(), tripId, uid: trip.ownerId, lifelist: [], createdAt: trip.createdAt ?? now },
      },
      { upsert: true }
    );
    ownerCount++;

    // 2. Each Invite → participant, reusing the invite's _id.
    const tripInvites = (await invites.find({ tripId }).toArray()) as any[];
    for (const invite of tripInvites) {
      if (invite.uid && invite.uid === trip.ownerId) continue; // owner already represented

      const isAccepted = !!invite.uid;
      await participants.updateOne(
        { _id: invite._id },
        {
          $set: {
            tripId,
            email: invite.email ?? null,
            name: invite.name ?? null,
            status: isAccepted ? "active" : "pending",
            ...(isAccepted ? { uid: invite.uid } : {}),
            listMode: "world",
            isOwner: false,
            updatedAt: now,
          },
          $setOnInsert: { lifelist: [], createdAt: invite.createdAt ?? now },
        },
        { upsert: true }
      );
      inviteCount++;
    }

    // 3. Verify membership parity with the old userIds array.
    const activeRows = (await participants.find({ tripId, status: "active" }).toArray()) as any[];
    const actual = activeRows.map((p) => p.uid).filter(Boolean).sort();
    const expected = [...(trip.userIds ?? [])].sort();
    const equal = actual.length === expected.length && actual.every((u, i) => u === expected[i]);
    if (!equal) {
      mismatches.push({ tripId, expected, actual });
      console.warn(`⚠️  Membership mismatch for trip ${tripId}`);
      console.warn(`    expected (userIds): ${JSON.stringify(expected)}`);
      console.warn(`    actual   (active) : ${JSON.stringify(actual)}`);
    }
  }

  console.log(`\nDone. Owner participants: ${ownerCount}, invite participants: ${inviteCount}.`);
  if (mismatches.length) {
    console.warn(`\n${mismatches.length} trip(s) had a membership mismatch — review before cleanup.`);
  } else {
    console.log("All trips' active-uid sets match their old userIds. ✅");
  }

  await mongoose.disconnect();
  console.log("Disconnected");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
