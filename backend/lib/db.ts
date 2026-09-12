import Trip from "models/Trip.js";
import User from "models/User.js";
import Participant from "models/Participant.js";
import IntegrationToken from "models/IntegrationToken.js";
import Session from "models/Session.js";
import OtpCode from "models/OtpCode.js";
import MagicLink from "models/MagicLink.js";
import RateLimit from "models/RateLimit.js";
import Log from "models/Log.js";
import SavedHotspot from "models/SavedHotspot.js";
import HotspotList from "models/HotspotList.js";
import Label from "models/Label.js";
import mongoose from "mongoose";

let connectPromise: Promise<mongoose.Connection> | null = null;

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export async function connect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI");
  }

  const connectStartTime = Date.now();

  connectPromise = mongoose
    .connect(process.env.MONGO_URI, { maxPoolSize: 50 })
    .then(() => {
      console.log(`---Connected to MongoDB in ${Date.now() - connectStartTime} ms`);
      return mongoose.connection;
    })
    .catch((error) => {
      console.error("Error connecting to database:", error);
      throw new Error("Error connecting to database");
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}

export { Trip, User, Participant, IntegrationToken, Session, OtpCode, MagicLink, RateLimit, Log, SavedHotspot, HotspotList, Label };
