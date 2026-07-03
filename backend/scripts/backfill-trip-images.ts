import { connect, Trip } from "../lib/db.js";
import { buildTripImageUrl, uploadMapboxImageToStorage, deleteFromStorage } from "../lib/storage.js";

const isDryRun = !process.argv.includes("--apply");

await connect();
const trips = await Trip.find({ "bounds.minX": { $exists: true } })
  .select("name bounds imgUrl")
  .lean();

console.log(`${trips.length} trips with bounds${isDryRun ? " (dry run — pass --apply to write)" : ""}`);

let updated = 0;
let failed = 0;

for (const trip of trips) {
  const label = `${trip._id} (${trip.name})`;
  if (isDryRun) {
    console.log(`would regenerate ${label}`);
    continue;
  }

  const newKey = await uploadMapboxImageToStorage(buildTripImageUrl(trip.bounds));
  if (!newKey) {
    failed++;
    console.error(`failed ${label}`);
    continue;
  }

  await Trip.updateOne({ _id: trip._id }, { imgUrl: newKey });
  if (trip.imgUrl) {
    await deleteFromStorage(trip.imgUrl).catch((error) => console.error(`old image cleanup failed ${label}`, error));
  }
  updated++;
  console.log(`regenerated ${label}`);
}

console.log(isDryRun ? "dry run complete" : `done: ${updated} updated, ${failed} failed`);
process.exit(0);
