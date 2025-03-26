import type { NextApiRequest, NextApiResponse } from "next";
import { find } from "geo-tz";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;

    const tz = find(Number(lat), Number(lng));
    res.status(200).json({ tz });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
