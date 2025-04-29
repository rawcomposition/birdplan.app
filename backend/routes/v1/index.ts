import { FastifyInstance, FastifyPluginAsync } from "fastify";
import regionRoutes from "@/routes/v1/region";
import debugRoutes from "@/routes/v1/debug";

const v1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(regionRoutes, { prefix: "/region" });
  fastify.register(debugRoutes, { prefix: "/debug" });
};

export default v1Routes;
