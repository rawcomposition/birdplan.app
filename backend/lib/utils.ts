import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "lib/betterAuth.js";
import { customAlphabet } from "nanoid";
import type { Trip, TargetList, Hotspot } from "@birdplan/shared";

export const nanoId = (length: number = 16) => {
  return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();
};

export async function authenticate(c: Context) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    return {
      uid: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  } catch (error) {
    console.error("Better Auth error:", error);
    throw new HTTPException(401, { message: "Unauthorized" });
  }
}

export const getBounds = async (regionString: string) => {
  const regions = regionString.split(",");
  const boundsPromises = regions.map((region) =>
    fetch(`https://api.ebird.org/v2/ref/region/info/${region}?key=${process.env.EBIRD_API_KEY}`).then((res) =>
      res.json()
    )
  );
  const boundsResults = await Promise.all(boundsPromises);
  const combinedBounds = boundsResults.reduce(
    (acc, bounds) => {
      return {
        minX: Math.min(acc.minX, bounds.bounds.minX),
        maxX: Math.max(acc.maxX, bounds.bounds.maxX),
        minY: Math.min(acc.minY, bounds.bounds.minY),
        maxY: Math.max(acc.maxY, bounds.bounds.maxY),
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  return combinedBounds;
};

export function getGooglePlaceUrl(lat: number, lng: number, placeId?: string) {
  return placeId
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function sanitizeFileName(fileName: string): string {
  let sanitized = fileName.replace(/[^a-zA-Z0-9_-]/g, " ");
  sanitized = sanitized.replace(/\s+/g, " ");
  return sanitized.trim();
}

const targetsToHtml = (targets: TargetList[], id?: string) => {
  const items = targets.find((it) => it._id === id)?.items;
  if (!items?.length) {
    return "";
  }
  let html = "<b>Targets</b><br/>";
  items.forEach((it) => {
    html += `<b>${it.name}</b> (${it.percentYr}%)<br/>`;
    const percent = it.percentYr;
    const numBlocks = Math.round(percent / 10) * 1;
    const blocks = "🟩".repeat(numBlocks) + "⬜".repeat(10 - numBlocks);
    html += `<a href='merlinbirdid://species/${it.code}' style="text-decoration:none">${blocks} ℹ️</a><br/><br/>`;
  });
  return html;
};

const favsToHtml = (favs: Hotspot["favs"]) => {
  if (!favs?.length) {
    return "";
  }
  let html = "<b>Favorites</b><br/>";
  favs.forEach((it) => {
    const percent = it.percent > 1 ? Math.round(it.percent) : it.percent;
    html += `<b>${it.name}</b> (${percent}% ${it.range})<br/>`;
    const numBlocks = Math.round(percent / 10) * 1;
    const blocks = "🟩".repeat(numBlocks) + "⬜".repeat(10 - numBlocks);
    html += `<a href='merlinbirdid://species/${it.code}' style="text-decoration:none">${blocks} ℹ️</a><br/><br/>`;
  });
  return html + "<br/><br/>";
};

export const tripToGeoJson = (trip: Trip, targets: TargetList[]) => {
  const hotspots = trip?.hotspots || [];
  const markers = trip?.markers || [];

  const geojson = {
    type: "FeatureCollection",
    features: [
      ...hotspots.map((it) => ({
        type: "Feature",
        properties: {
          name: it.name,
          description: `<b>Links</b><br/><a href=${getGooglePlaceUrl(
            it.lat,
            it.lng
          )}>Directions</a> • <a href='https://ebird.org/targets?r1=${
            it.id
          }&bmo=1&emo=12&r2=world&t2=life'>Targets</a><br/><br/><b>Notes</b><br/>${
            it.notes || "None"
          }<br/><br/>${favsToHtml(it.favs)}${targetsToHtml(targets, it.targetsId)}<br/><br/>`,
        },
        geometry: {
          type: "Point",
          coordinates: [it.lng, it.lat],
        },
      })),
      ...markers.map((it) => ({
        type: "Feature",
        properties: {
          name: it.name,
          description: `<b>Links</b><br/><a href=${getGooglePlaceUrl(
            it.lat,
            it.lng
          )}>Directions</a><br/><br/><b>Notes</b><br/>${it.notes || "None"}`,
        },
        geometry: {
          type: "Point",
          coordinates: [it.lng, it.lat],
        },
      })),
    ],
  };
  return geojson;
};

export const mostFrequentValue = (arr: any[]) => {
  const filteredArr = arr.filter(Boolean);
  if (!filteredArr.length) return null;
  const counts: any = {};
  filteredArr.forEach((it) => {
    counts[it] = counts[it] ? counts[it] + 1 : 1;
  });
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  return sorted[0];
};
