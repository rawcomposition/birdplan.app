import { FastifyInstance, FastifyPluginAsync } from "fastify";
import v1Routes from "@/routes/v1";

const routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(v1Routes, { prefix: "/v1" });
};

export default routes;
