import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { eBirdTaxonomy } from "@birdplan/shared";

const taxonomy = new Hono();

taxonomy.get("/", async (c) => {
  const response = await fetch(
    `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species&key=${process.env.EBIRD_API_KEY}`
  );

  if (!response.ok) {
    throw new HTTPException((response.status as any) || 500, {
      message: `Failed to fetch taxonomy: ${response.statusText}`,
    });
  }

  const data: eBirdTaxonomy[] = await response.json();

  const simplifiedData = data.map((item) => ({
    name: item.comName,
    code: item.speciesCode,
  }));

  return c.json(simplifiedData);
});

export default taxonomy;
