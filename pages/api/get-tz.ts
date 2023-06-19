import type { NextApiRequest, NextApiResponse } from "next";
import { find } from "geo-tz";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { lat, lng } = req.query;
    const timezones = find(Number(lat), Number(lng));

    res.status(200).json({ timezone: timezones[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error getting timezone" });
  }
}
