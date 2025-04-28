import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";

const schema = {
  type: "object",
  required: ["MONGO_URI", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL", "EBIRD_API_KEY"],
  properties: {
    MONGO_URI: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
    EBIRD_API_KEY: { type: "string" },
    RESEND_API_KEY: { type: "string" },
    MAPBOX_SERVER_KEY: { type: "string" },
    PIPER_KEY: { type: "string" },
    FRONTEND_URL: { type: "string" },
    DEEPL_KEY: { type: "string" },
    PORT: { type: "string", default: "3000" },
    NODE_ENV: { type: "string", default: "development" },
  },
};

const environmentPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  });
};

export default fp(environmentPlugin, {
  name: "env",
});
