import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const response = await fetch(`https://ebird.org/mapServices/getHsInfo.do?fmt=json&hs=${id}&yr=all&m=`);
    const json = await response.json();

    res.status(200).json(json);
  } catch (error) {
    res.status(500).json({ error: "Error getting checklist count" });
  }
}
