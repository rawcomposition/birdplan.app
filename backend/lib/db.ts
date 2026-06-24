import Trip from "models/Trip.js";
import User from "models/User.js";
import Invite from "models/Invite.js";
import Participant from "models/Participant.js";
import IntegrationToken from "models/IntegrationToken.js";
import Session from "models/Session.js";
import OtpCode from "models/OtpCode.js";
import MagicLink from "models/MagicLink.js";
import RateLimit from "models/RateLimit.js";
import Log from "models/Log.js";
import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connectStartTime = Date.now();

  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
    });

    isConnected = true;
    console.log(`---Connected to MongoDB in ${Date.now() - connectStartTime} ms`);

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error("Error connecting to database:", error);
    isConnected = false;
    throw new Error("Error connecting to database");
  }
}

export { Trip, User, Invite, Participant, IntegrationToken, Session, OtpCode, MagicLink, RateLimit, Log };
