const fp = require("fastify-plugin");
const mongoose = require("mongoose");

let cached = {
  conn: null,
  promise: null,
};

async function mongoosePlugin(fastify, options) {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable not set");
  }

  fastify.decorate("mongoose", mongoose);

  fastify.addHook("onClose", async (instance) => {
    if (cached.conn) {
      await cached.conn.disconnect();
      cached.conn = null;
      cached.promise = null;
    }
  });

  async function connect() {
    if (cached.conn) {
      return cached.conn;
    }

    const connectStartTime = Date.now();

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      try {
        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
          fastify.log.info(`Connected to MongoDB in ${Date.now() - connectStartTime} ms`);
          return mongoose;
        });
      } catch (e) {
        cached.promise = null;
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

  fastify.decorate("connect", connect);

  // Models
  const Trip = require("../models/Trip");
  const TargetList = require("../models/TargetList");
  const Invite = require("../models/Invite");
  const Profile = require("../models/Profile");
  const QuizImages = require("../models/QuizImages");
  const Vault = require("../models/Vault");

  // Decorate fastify with models
  fastify.decorate("db", {
    Trip,
    TargetList,
    Invite,
    Profile,
    QuizImages,
    Vault,
  });
}

module.exports = fp(mongoosePlugin, {
  name: "mongoose",
  dependencies: ["env"],
});
