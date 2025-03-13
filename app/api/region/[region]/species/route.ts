import { APIError } from "lib/api";

type Params = { params: Promise<{ region: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { region } = await params;

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

    const tenMinutes = 600;
    const headers = new Headers({
      "Cache-Control": `public, max-age=${tenMinutes}, s-maxage=${tenMinutes}`,
    });

    return new Response(JSON.stringify(formatted), { status: 200, headers });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
  }
}
