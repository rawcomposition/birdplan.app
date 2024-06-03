import type { NextApiRequest, NextApiResponse } from "next";
import { EbirdHotspot } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { region } = req.query;

    const response = await fetch(
      `https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    const json: EbirdHotspot[] = await response.json();

    const formatted = json.map((it) => ({
      id: it.locId,
      name: it.locName,
      lat: it.lat,
      lng: it.lng,
      species: it.numSpeciesAllTime,
    }));

    const sevenDays = 604800;
    res.setHeader("Cache-Control", `public, max-age=${sevenDays}, s-maxage=${sevenDays}`);

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error });
  }
}
