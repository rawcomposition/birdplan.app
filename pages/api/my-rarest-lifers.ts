import type { NextApiRequest, NextApiResponse } from "next";
import PhotoTotals from "../../photo-totals.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sciNames = req.body;
    const response = await fetch(`https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species`);
    const taxonomy = await response.json();

    const codes = sciNames
      .map((name: string) => {
        return taxonomy.find((taxon: any) => taxon.sciName === name)?.speciesCode;
      })
      .filter((code: string) => code);

    const fitleredTotals = PhotoTotals.filter(({ code }) => codes.includes(code))
      .sort((a, b) => b.count - a.count)
      .reverse()
      .slice(0, 100);

    res.status(200).json(fitleredTotals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
