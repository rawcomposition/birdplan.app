import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import apiUtils from "./api-utils.js";

const plugins: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(apiUtils);
};

export default fp(plugins, {
  name: "aggregate-plugins",
});
