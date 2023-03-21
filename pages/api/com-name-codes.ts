import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const comNames = req.body;
    const response = await fetch(`https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species`);
    const taxonomy = await response.json();

    const withCodes = comNames
      .map((it: any) => {
        const code = taxonomy.find((taxon: any) => taxon.comName === it.name)?.speciesCode;
        return { ...it, code };
      })
      .filter(({ code }: any) => !!code);

    res.status(200).json(withCodes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
