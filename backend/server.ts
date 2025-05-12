import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import routes from "./routes/index.js";
import { configureEnv, EnvConfig } from "./config/env.js";
import plugins from "./plugins/index.js";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  },
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

    await fastify.register(plugins);
    await fastify.register(routes);

    const port = fastify.config.PORT || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
