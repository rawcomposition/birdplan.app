import { APIError } from "lib/api";
import axios from "axios";
import dayjs from "dayjs";

type Params = { params: Promise<{ id: string; hotspotId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const { searchParams } = new URL(request.url);
    const speciesCode = searchParams.get("speciesCode");

    const year = dayjs().year();
    const url = `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${hotspotId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=${year}&yr=all&bmo=1&emo=12`;

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

    const oneHour = 60 * 60;

    const headers = new Headers({
      "Cache-Control": `public, max-age=${oneHour}, s-maxage=${oneHour}`,
    });

    return new Response(JSON.stringify(formatted), { status: 200, headers });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
  }
}
