import { Hono } from "hono";
import type { eBirdHotspot, SpeciesObservation } from "@birdplan/shared";

const region = new Hono();

type eBirdHotspotResult = {
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

region.get("/:region/hotspots", async (c) => {
  const region: string = c.req.param("region");

  const response = await fetch(
    `https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json&key=${process.env.EBIRD_API_KEY}`
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

  return c.json(formatted, 200, {
    "Cache-Control": `public, max-age=${sevenDays}, s-maxage=${sevenDays}`,
  });
});

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
