import { HTTPException } from "hono/http-exception";
import { isHotspotInRegion } from "@birdplan/shared";
import type { OpenBirdingHotspot, OpenBirdingHotspotLookupResponse } from "@birdplan/shared";
import { OPENBIRDING_API_URL } from "lib/config.js";

export const fetchHotspotsInRegion = async (ids: string[], region: string): Promise<OpenBirdingHotspot[]> => {
  if (ids.length === 0) return [];
  if (!OPENBIRDING_API_URL) throw new HTTPException(500, { message: "OpenBirding API is not configured" });
  const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new HTTPException(502, { message: "Failed to look up hotspots" });
  const data = (await res.json()) as OpenBirdingHotspotLookupResponse;
  return data.items.filter((it) => isHotspotInRegion(it.regionCode, region));
};
