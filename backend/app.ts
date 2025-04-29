import path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {};

const app: FastifyPluginAsync = async (fastify: FastifyInstance, opts: any): Promise<void> => {
  // Register env plugin first to load environment variables
  await fastify.register(import("@/plugins/env"));

  // Register sensible for error handling and utility decorators
  await fastify.register(sensible);

  // Register CORS
  await fastify.register(cors, {
    origin: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
  });

  // Register API utilities
  await fastify.register(import("@/plugins/api-utils"));

  // Register Mongoose
  await fastify.register(import("@/plugins/mongoose"));

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
    ignorePattern: /^(api-utils|env|mongoose)\.(js|ts)$/,
  });

  // Register the API routes
  await fastify.register(import("@/routes"), { prefix: "/api" });
};

export default app;
export { app, options };
