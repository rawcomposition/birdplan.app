/**
 * One-time migration script for the OpenBirding API migration.
 *
 * What it does:
 * 1. Deletes ALL TargetList documents (no longer used)
 * 2. Removes targetsId from all Trip.hotspots subdocuments
 *
 * Run manually: npx tsx backend/scripts/migrate-targets.ts
 */

import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const targetLists = db.collection("targetlists");
  const trips = db.collection("trips");

  // 1. Delete all TargetList documents
  const deleteResult = await targetLists.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} TargetList documents`);

  // 2. Remove targetsId from all Trip.hotspots subdocuments
  const tripsResult = await trips.updateMany({ "hotspots.targetsId": { $exists: true } }, [
    {
      $set: {
        hotspots: {
          $map: {
            input: "$hotspots",
            as: "h",
            in: {
              $arrayToObject: {
                $filter: {
                  input: { $objectToArray: "$$h" },
                  cond: { $ne: ["$$this.k", "targetsId"] },
                },
              },
            },
          },
        },
      },
    },
  ]);
  console.log(`Updated ${tripsResult.modifiedCount} Trip documents (removed targetsId from hotspots)`);

  await mongoose.disconnect();
  console.log("Migration complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
