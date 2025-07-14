import { connect, Profile } from "../lib/db.js";

async function migrateUsers() {
  try {
    await connect();
    console.log("Connected to database");

    const profiles = await Profile.find({}).lean();
    console.log(`Found ${profiles.length} profiles to migrate`);

    for (const profile of profiles) {
      try {
        console.log(`Checking user: ${profile.email || profile.uid}`);

        // For now, just log that users will need to reset their passwords
        // since we can't migrate passwords from Firebase to Better Auth
        console.log(`User ${profile.email || profile.uid} will need to reset password`);
      } catch (error) {
        console.error(`Error checking user ${profile.email || profile.uid}:`, error);
      }
    }

    console.log("Migration check completed");
    console.log("Note: Users will need to use 'Forgot Password' to reset their passwords");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrateUsers();
