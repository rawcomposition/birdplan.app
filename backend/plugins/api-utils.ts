import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import admin from "firebase-admin";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<admin.auth.DecodedIdToken | null>;
  }
}

const apiUtils: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "bird-planner",
        privateKey: fastify.config.FIREBASE_PRIVATE_KEY,
        clientEmail: fastify.config.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: "bird-planner.appspot.com",
    });

    const auth = admin.auth();

    async function authenticate(request: FastifyRequest): Promise<admin.auth.DecodedIdToken | null> {
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        request.log.error("Missing or invalid authorization header");
        return null;
      }

      const token = authHeader.split("Bearer ")[1];

      try {
        return await auth.verifyIdToken(token);
      } catch (error) {
        request.log.error({ error }, "Firebase auth error");
        return null;
      }
    }

    fastify.decorate("authenticate", authenticate);
  }
};

export default fp(apiUtils, {
  name: "api-utils",
});
