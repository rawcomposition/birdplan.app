import { FastifyInstance, FastifyPluginAsync } from "fastify";
import regionRoutes from "./region/index.js";

const v1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(regionRoutes, { prefix: "/region" });
};

export default v1Routes;
