import { betterAuth } from "better-auth";
import { connect } from "lib/db.js";
import { BETTER_AUTH_CONFIG } from "lib/config.js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

async function initializeAuth() {
  await connect();

  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection not established");
  }

  return betterAuth({
    secret: BETTER_AUTH_CONFIG.secret,
    baseUrl: BETTER_AUTH_CONFIG.baseUrl,
    trustedOrigins: BETTER_AUTH_CONFIG.trustedOrigins,
    database: mongodbAdapter(mongoose.connection.db),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: BETTER_AUTH_CONFIG.sessionExpiry,
    },
    email: {
      from: "BirdPlan.app <support@birdplan.app>",
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY,
    },
  });
}

export const auth = await initializeAuth();
