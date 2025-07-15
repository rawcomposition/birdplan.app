import { betterAuth } from "better-auth";
import { connect } from "lib/db.js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

async function initializeAuth() {
  await connect();

  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection not established");
  }

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseUrl: process.env.BETTER_AUTH_BASE_URL,
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(","),
    database: mongodbAdapter(mongoose.connection.db),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 90,
    },
    email: {
      from: "BirdPlan.app <support@birdplan.app>",
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY,
    },
  });
}

export const auth = await initializeAuth();
