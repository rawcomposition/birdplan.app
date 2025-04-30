import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import * as admin from "firebase-admin";

/*let firebaseApp: admin.app.App;
if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "bird-planner",
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as admin.ServiceAccount),
    storageBucket: "bird-planner.appspot.com",
  });
} else {
  firebaseApp = admin.app();
}

async function authenticate(request: FastifyRequest): Promise<admin.auth.DecodedIdToken | null> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    request.log.error("Missing or invalid authorization header");
    return null;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await firebaseApp.auth().verifyIdToken(token);
  } catch (error) {
    request.log.error({ error }, "Firebase auth error");
    return null;
  }
}*/

const apiUtils: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  //fastify.decorate("authenticate", authenticate);
};

export default fp(apiUtils, {
  name: "api-utils",
});
