import { APIError } from "lib/api";
import { eBirdTaxonomy } from "lib/types";

export async function GET(request: Request) {
  try {
    const response = await fetch(
      `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );

    if (!response.ok) {
      return APIError(`Failed to fetch taxonomy: ${response.statusText}`, response.status);
    }

    const data: eBirdTaxonomy[] = await response.json();

    const simplifiedData = data.map((item) => ({
      name: item.comName,
      code: item.speciesCode,
    }));

    return Response.json(simplifiedData);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading eBird taxonomy", 500);
  }
}
