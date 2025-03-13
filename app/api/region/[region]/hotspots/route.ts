import { APIError } from "lib/api";
import { eBirdHotspot } from "lib/types";

type Params = { params: Promise<{ region: string }> };

export type eBirdHotspotResult = {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { region } = await params;

    const response = await fetch(
      `https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    const json: eBirdHotspotResult[] = await response.json();

    const formatted: eBirdHotspot[] = json.map((it) => ({
      id: it.locId,
      name: it.locName,
      lat: it.lat,
      lng: it.lng,
      species: it.numSpeciesAllTime,
    }));

    const sevenDays = 604800;
    const headers = new Headers({
      "Cache-Control": `public, max-age=${sevenDays}, s-maxage=${sevenDays}`,
    });

    return new Response(JSON.stringify(formatted), { status: 200, headers });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
  }
}
