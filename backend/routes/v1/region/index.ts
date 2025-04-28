import { FastifyInstance, FastifyPluginAsync } from "fastify";
import * as regionController from "../../../controllers/region/index.js";

const regionRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get("/:region/hotspots", regionController.getHotspots);
  fastify.get("/:region/species", regionController.getSpecies);
};

export default regionRoutes;
