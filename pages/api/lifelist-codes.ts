import type { NextApiRequest, NextApiResponse } from "next";

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

    res.status(200).json(codes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
