import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { locId, speciesCode } = req.query;

    const response = await fetch(
      `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${locId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=2023&yr=all&bmo=1&emo=12`,
      {
        headers: {
          Cookie: `EBIRD_SESSIONID=${process.env.EBIRD_SESSIONID}`,
        },
      }
    );

    const json = await response.json();

    const formatted = json.infoList.map((info: any) => {
      return {
        checklistId: info.subID,
        count: info.howMany,
        date: info.obsDt,
        evidence: info.evidence && info.evidence !== "N",
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting observation list" });
  }
}
