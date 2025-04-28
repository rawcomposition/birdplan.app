import { FastifyInstance, FastifyPluginAsync } from "fastify";
import v1Routes from "./v1/index.js";

const routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(v1Routes, { prefix: "/v1" });
};

export default routes;
