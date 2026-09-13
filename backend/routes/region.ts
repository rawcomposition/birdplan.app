import { Hono } from "hono";
import type { SpeciesObservation } from "@birdplan/shared";

const region = new Hono();

region.get("/:region/species", async (c) => {
  const region: string = c.req.param("region");

  const response = await fetch(
    `https://api.ebird.org/v2/data/obs/${region}/recent?fmt=json&cat=species&includeProvisional=true&back=30&key=${process.env.EBIRD_API_KEY}`
  );

  if (!response.ok) {
    return c.json({ error: `Unable to load recent species: ${response.statusText}` }, 500);
  }

  const json = await response.json();
  const formatted: SpeciesObservation[] = json.reduce((acc: SpeciesObservation[], it: any) => {
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

  return c.json(formatted, 200, {
    "Cache-Control": `public, max-age=${tenMinutes}, s-maxage=${tenMinutes}`,
  });
});

export default region;
