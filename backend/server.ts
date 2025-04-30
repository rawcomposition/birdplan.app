import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import routes from "./routes/index.js";
import { configureEnv, EnvConfig } from "./config/env.js";
import plugins from "./plugins/index.js";

const fastify = Fastify({
  logger: true,
});

declare module "fastify" {
  interface FastifyInstance {
    config: EnvConfig;
  }
}

async function startServer() {
  try {
    await configureEnv(fastify);
    await fastify.register(cors);
    await fastify.register(sensible);

    fastify.register(routes);
    fastify.register(plugins);
    const port = fastify.config.PORT || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
