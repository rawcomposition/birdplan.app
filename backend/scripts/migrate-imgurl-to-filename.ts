import mongoose from "mongoose";
import { connect, Trip } from "lib/db.js";

const WRITE = process.argv.includes("--write");

const fileNameFromUrl = (url: string) => {
  const last = new URL(url).pathname.split("/").pop();
  return last ? decodeURIComponent(last) : "";
};

async function main() {
  await connect();

  const trips = await Trip.find({ imgUrl: { $regex: "^https?://" } }).lean<{ _id: string; imgUrl: string }[]>();
  console.log(`Found ${trips.length} trips with a full-URL imgUrl`);

  const ops: mongoose.AnyBulkWriteOperation[] = [];
  const failures: { id: string; imgUrl: string }[] = [];

  for (const trip of trips) {
    const fileName = fileNameFromUrl(trip.imgUrl);
    if (!fileName) {
      failures.push({ id: trip._id, imgUrl: trip.imgUrl });
      continue;
    }
    ops.push({ updateOne: { filter: { _id: trip._id }, update: { $set: { imgUrl: fileName } } } });
  }

  if (WRITE && ops.length) await Trip.bulkWrite(ops, { ordered: false });

  console.log("\n========== MIGRATION REPORT ==========");
  console.log(`Mode: ${WRITE ? "WRITE (changes applied)" : "DRY RUN (no changes — pass --write to apply)"}`);
  console.log(`Trips ${WRITE ? "updated" : "to update"}: ${ops.length}`);
  console.log(`Failures (unparseable URL, left unchanged): ${failures.length}`);
  for (const f of failures) console.log(`  ${f.id}: ${f.imgUrl}`);
  console.log("======================================\n");

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
