import { FastifyInstance, FastifyPluginAsync } from "fastify";

const debugRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get("/", async (request, reply) => {
    const user = await fastify.authenticate(request);
    reply.send({ message: "Hola amigo!", user });
  });
};

export default debugRoutes;
