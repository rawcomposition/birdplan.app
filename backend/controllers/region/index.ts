import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { EBirdHotspot, EBirdHotspotResult } from "../../types/index.js";

type Params = {
  region: string;
};

export async function getHotspots(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<void> {
  try {
    const { region } = req.params;

    const response = await axios.get<EBirdHotspotResult[]>(`https://api.ebird.org/v2/ref/hotspot/${region}`, {
      params: {
        fmt: "json",
        key: process.env.EBIRD_API_KEY,
      },
    });

    const json = response.data;

    const formatted: EBirdHotspot[] = json.map((it) => ({
      id: it.locId,
      name: it.locName,
      lat: it.lat,
      lng: it.lng,
      species: it.numSpeciesAllTime,
    }));

    // Cache for 7 days
    reply.header("Cache-Control", "public, max-age=604800, s-maxage=604800").send(formatted);
  } catch (error: any) {
    req.log.error(error);
    throw req.server.APIError(error.message || "Error loading hotspots", error.response?.status || 500);
  }
}

export async function getSpecies(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<void> {
  try {
    const { region } = req.params;

    const response = await axios.get(`https://api.ebird.org/v2/data/obs/${region}/recent`, {
      params: {
        fmt: "json",
        cat: "species",
        includeProvisional: true,
        back: 30,
        key: process.env.EBIRD_API_KEY,
      },
    });

    if (!response.data) {
      throw req.server.APIError(`Unable to load recent species`, response.status || 500);
    }

    const json = response.data;

    const formatted = json.reduce((acc: any[], it: any) => {
      const code = it.speciesCode;
      if (!acc.some((item) => item.code === code)) {
        acc.push({
          code: code,
          name: it.comName,
          date: it.obsDt,
          checklistId: it.subId,
          count: it.howMany,
        });
      }
      return acc;
    }, []);

    // Cache for 10 minutes
    reply.header("Cache-Control", "public, max-age=600, s-maxage=600").send(formatted);
  } catch (error: any) {
    req.log.error(error);
    throw req.server.APIError(error.message || "Error loading species", error.response?.status || 500);
  }
}
