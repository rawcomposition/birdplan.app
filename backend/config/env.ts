import { FastifyInstance } from "fastify";
import fastifyEnv from "@fastify/env";

export interface EnvConfig {
  BASE_URL: string;
  PORT: number;
  NODE_ENV: string;
  RESEND_API_KEY: string;
  MAPBOX_SERVER_KEY: string;
  MONGO_URI: string;
  PIPER_KEY: string;
  FRONTEND_URL: string;
  DEEPL_KEY: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  EBIRD_API_KEY: string;
}

export const configSchema = {
  type: "object",
  required: ["BASE_URL", "MONGO_URI", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL"],
  properties: {
    BASE_URL: {
      type: "string",
      default: "http://localhost:3000",
    },
    PORT: {
      type: "number",
      default: 3000,
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    RESEND_API_KEY: {
      type: "string",
    },
    MAPBOX_SERVER_KEY: {
      type: "string",
    },
    MONGO_URI: {
      type: "string",
    },
    PIPER_KEY: {
      type: "string",
    },
    FRONTEND_URL: {
      type: "string",
      default: "https://localhost:3000",
    },
    DEEPL_KEY: {
      type: "string",
    },
    FIREBASE_PRIVATE_KEY: {
      type: "string",
    },
    FIREBASE_CLIENT_EMAIL: {
      type: "string",
    },
    EBIRD_API_KEY: {
      type: "string",
    },
  },
};

export const configOptions = {
  confKey: "config",
  schema: configSchema,
  dotenv: true,
};

export async function configureEnv(server: FastifyInstance): Promise<void> {
  await server.register(fastifyEnv, configOptions);

  server.log.info("Environment configuration loaded");
}
