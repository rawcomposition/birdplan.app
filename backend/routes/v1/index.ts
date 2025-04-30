import { FastifyInstance, FastifyPluginAsync } from "fastify";
import regionRoutes from "./region/index.js";
import debugRoutes from "./debug/index.js";

const v1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(regionRoutes, { prefix: "/region" });
  fastify.register(debugRoutes, { prefix: "/debug" });
};

export default v1Routes;
