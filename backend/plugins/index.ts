import { FastifyInstance, FastifyPluginAsync } from "fastify";
import apiUtils from "./api-utils.js";

const plugins: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(apiUtils);
};

export default plugins;
