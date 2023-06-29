import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { locId, speciesCode } = req.query;

    const url = `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${locId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=2023&yr=all&bmo=1&emo=12`;

    const json = await axios.get(url, {
      headers: {
        // This user agent seems to be allowed by eBird
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      maxRedirects: 2,
    });

    const formatted = json.data.infoList.map((info: any) => {
      return {
        checklistId: info.subID,
        count: info.howMany,
        date: info.obsDt,
        evidence: info.evidence,
      };
    });

    // Set cache to 1 hour
    res.setHeader("Cache-Control", "s-maxage=3600");

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting observation list" });
  }
}
