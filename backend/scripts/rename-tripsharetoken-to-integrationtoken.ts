// One-time migration: rename the `tripsharetokens` collection to `integrationtokens`
// (model TripShareToken → IntegrationToken). Pure rename — fields and indexes are unchanged
// and travel with the collection.
//
// Defaults to a DRY RUN (reports only). Pass --execute to write.
//   npx tsx backend/scripts/rename-tripsharetoken-to-integrationtoken.ts            # dry run
//   npx tsx backend/scripts/rename-tripsharetoken-to-integrationtoken.ts --execute  # apply
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
const mode = EXECUTE ? "EXECUTE" : "DRY RUN";
const did = EXECUTE ? "" : "would ";

async function migrate() {
  await mongoose.connect(MONGO_URI!);
  const db = mongoose.connection.db!;
  console.log(`Connected to MongoDB — ${mode}\n`);

  const source = db.collection("tripsharetokens");
  const target = db.collection("integrationtokens");

  const sourceExists = (await db.listCollections({ name: "tripsharetokens" }).toArray()).length > 0;
  if (!sourceExists) {
    throw new Error("No `tripsharetokens` collection found — nothing to rename. Has this already run?");
  }

  // An empty `integrationtokens` collection is auto-created the moment the IntegrationToken model
  // registers against this DB, and it silently blocks the rename ("target namespace exists"). Drop
  // it if empty; a populated `integrationtokens` means the migration already ran, which is a real abort.
  const targetExists = (await db.listCollections({ name: "integrationtokens" }).toArray()).length > 0;
  if (targetExists && (await target.countDocuments({})) > 0) {
    throw new Error("A non-empty `integrationtokens` collection already exists — has this migration already run? Aborting.");
  }
  if (targetExists) {
    console.log(`${did}drop the empty auto-created \`integrationtokens\` collection before renaming`);
  }

  const count = await source.countDocuments({});
  console.log(`tripsharetokens: ${count} doc(s) to carry over`);

  if (EXECUTE) {
    if (targetExists) await target.drop();
    await source.rename("integrationtokens");
  }
  console.log(`${did}rename collection tripsharetokens → integrationtokens`);

  console.log(`\nDone (${mode}).`);
  if (!EXECUTE) console.log("No changes were written. Re-run with --execute to apply.");

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
