import { DecodedIdToken } from "firebase-admin/auth";

export type EBirdHotspotResult = {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
};

export type EBirdHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species?: number;
};

export type EBirdTaxonomy = {
  sciName: string;
  comName: string;
  speciesCode: string;
  category: string;
  taxonOrder: number;
  bandingCodes: string[];
  comNameCodes: string[];
  sciNameCodes: string[];
  order: string;
  familyCode: string;
  familyComName: string;
  familySciName: string;
};

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
