import type { NextApiRequest, NextApiResponse } from "next";
import { find } from "geo-tz";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;

    if (!lat || !lng) {
      res.status(400).json({ error: "Missing lat or lng" });
      return;
    }

    const tz = find(Number(lat), Number(lng))?.[0] || null;
    res.status(200).json({ tz });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
