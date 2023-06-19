import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { region } = req.query;

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/${region}/recent?fmt=json&cat=species&includeProvisional=true&back=30&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    const json = await response.json();
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

    res.setHeader("Cache-Control", "max-age=0, s-maxage=600"); //Cache for 10 minutes

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error });
  }
}
