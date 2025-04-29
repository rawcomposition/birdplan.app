import { FastifyInstance, FastifyPluginAsync } from "fastify";

const debugRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get("/", async (request, reply) => {
    reply.send({ message: "Hola amigo!" });
  });
};

export default debugRoutes;
