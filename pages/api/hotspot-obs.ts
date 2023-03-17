import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { locId, speciesCode } = req.query;

    const url = `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${locId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=2023&yr=all&bmo=1&emo=12`;

    // Get cookie
    const res1 = await fetch(url, { redirect: "manual" });
    // Get response cookies
    const cookies = res1.headers.get("set-cookie");
    const cookie = cookies?.split(";")[0];

    if (!cookie) throw new Error("Error fetching observations");

    const res2 = await fetch(url, {
      headers: { cookie },
    });
    const json = await res2.json();

    const formatted = json.infoList.map((info: any) => {
      return {
        checklistId: info.subID,
        count: info.howMany,
        date: info.obsDt,
        evidence: info.evidence && info.evidence !== "N",
      };
    });

    // Set cache to 1 day
    res.setHeader("Cache-Control", "s-maxage=86400");

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting observation list" });
  }
}
