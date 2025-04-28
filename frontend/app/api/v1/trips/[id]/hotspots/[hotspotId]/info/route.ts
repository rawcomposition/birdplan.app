import { APIError } from "lib/api";

type Params = { params: Promise<{ id: string; hotspotId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;

    const response = await fetch(`https://ebird.org/mapServices/getHsInfo.do?fmt=json&hs=${hotspotId}&yr=all&m=`);
    const json = await response.json();

    const thirtyDays = 2592000;

    const headers = new Headers({
      "Cache-Control": `public, max-age=${thirtyDays}, s-maxage=${thirtyDays}`,
    });

    return new Response(JSON.stringify(json), { status: 200, headers });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
  }
}
