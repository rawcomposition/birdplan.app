import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { region } = req.query;

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/${region}/recent?fmt=json&cat=species&includeProvisional=true&back=30&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    const json = await response.json();
    const formatted = json.map((it: any) => ({
      code: it.speciesCode,
      name: it.comName,
      date: it.obsDt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error });
  }
}
