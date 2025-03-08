import Trip from "models/Trip";
import TargetList from "models/TargetList";
import Invite from "models/Invite";
import Profile from "models/Profile";

import mongoose from "mongoose";

declare global {
  var mongoose: any;
}

//https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.ts
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  const connectStartTime = Date.now();

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      cached.promise = mongoose.connect(process.env.MONGO_URI || "", opts).then((mongoose) => {
        console.log(`---Connected to MongoDB in ${Date.now() - connectStartTime} ms`);
        return mongoose;
      });
    } catch (e) {
      throw new Error("Error connecting to database");
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { Trip, TargetList, Invite, Profile };
