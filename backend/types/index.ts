import { DecodedIdToken } from "firebase-admin/auth";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<DecodedIdToken | null>;
    APIError: (message: string, statusCode?: number) => Error;
    connect: () => Promise<any>;
    db: {
      Trip: any;
      TargetList: any;
      Invite: any;
      Profile: any;
      QuizImages: any;
      Vault: any;
    };
  }
}
