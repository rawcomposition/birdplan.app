import Trip from "models/Trip.js";
import Profile from "models/Profile.js";
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

export { Trip, Profile };
