import { Trip } from "@birdplan/shared";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTzByRegion } from "lib/tz";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fullMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "Novermber",
  "December",
];

export const englishCountries = [
  "US",
  "CA",
  "AU",
  "GB",
  "NZ",
  "IE",
  "GH",
  "SG",
  "BZ",
  "ZA",
  "IN",
  "DM",
  "MT",
  "AG",
  "KE",
  "JM",
  "GD",
  "GY",
  "BW",
  "LR",
  "BB",
  "CM",
  "NG",
  "GM",
  "TT",
  "BS",
];

export const isRegionEnglish = (region: string) => {
  const regionCode = region.split(",")[0];
  const countryCode = regionCode.split("-")[0];
  return englishCountries.includes(countryCode);
};

export function truncate(string: string, length: number): string {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

export const markerColors = [
  "#bcbcbc",
  "#8f9ca0",
  "#9bc4cf",
  "#aaddeb",
  "#c7e466",
  "#eaeb1f",
  "#fac500",
  "#e57701",
  "#ce0d02",
  "#ad0002",
];

export const getMarkerColor = (count: number) => {
  if (count === 0) return markerColors[0];
  if (count <= 15) return markerColors[1];
  if (count <= 50) return markerColors[2];
  if (count <= 100) return markerColors[3];
  if (count <= 150) return markerColors[4];
  if (count <= 200) return markerColors[5];
  if (count <= 250) return markerColors[6];
  if (count <= 300) return markerColors[7];
  if (count <= 400) return markerColors[8];
  if (count <= 1000) return markerColors[9];
  return markerColors[0];
};

export const getMarkerColorIndex = (count: number) => {
  const color = getMarkerColor(count);
  return markerColors.indexOf(color);
};

export const radiusOptions = [
  { label: "20 mi", value: 20 },
  { label: "50 mi", value: 50 },
  { label: "100 mi", value: 100 },
  { label: "200 mi", value: 200 },
  { label: "300 mi", value: 300 },
  { label: "400 mi", value: 400 },
  { label: "500 mi", value: 500 },
];

export const getLatLngFromBounds = (bounds?: Trip["bounds"]) => {
  if (!bounds) return { lat: null, lng: null };
  const { minX, minY, maxX, maxY } = bounds;
  const lat = (minY + maxY) / 2;
  const lng = (minX + maxX) / 2;
  return { lat, lng };
};

export const nanoId = (length: number = 16) => {
  return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();
};

export const dateTimeToRelative = (date: string, regionCode: string, includeAgo?: boolean) => {
  const timezone = getTzByRegion(regionCode);
  if (!regionCode || !date) return "";

  const today = dayjs().tz(timezone).format("YYYY-MM-DD");
  const yesterday = dayjs().tz(timezone).subtract(1, "day").format("YYYY-MM-DD");
  const tomorrow = dayjs().tz(timezone).add(1, "day").format("YYYY-MM-DD");
  const dateFormatted = dayjs(date).tz(timezone).format("YYYY-MM-DD");
  if (dateFormatted === today || dateFormatted === tomorrow) return "Today";
  if (dateFormatted === yesterday) return "Yesterday";
  const result = dayjs
    .tz(date, timezone)
    .fromNow()
    .replace(includeAgo ? "" : " ago", "")
    .replace("an ", "1 ")
    .replace("a ", "1 ");

  return result;
};

//https://decipher.dev/30-seconds-of-typescript/docs/debounce/
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const formatTime = (time: number) => {
  const rounded = Math.round(time);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

export const formatDistance = (meters: number, metric: boolean) => {
  const distance = metric ? meters / 1000 : meters / 1609;
  const units = metric ? "km" : "mi";
  const rounded =
    distance > 10
      ? Math.round(distance)
      : distance > 1
      ? Math.round(distance * 10) / 10
      : Math.round(distance * 100) / 100;
  return `${rounded} ${units}`;
};

export function getRandomItemsFromArray(arr: any[], count: number): any[] {
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    result.push(arr[randomIndex]);
  }

  return result;
}

export function getGooglePlaceUrl(lat: number, lng: number, placeId?: string) {
  return placeId
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Google Maps allows up to 9 waypoints (11 stops total). Returns null if fewer than 2 points. */
export function getGoogleMapsFullDayRouteUrl(
  points: { lat: number; lng: number }[]
): string | null {
  if (points.length < 2) return null;
  const capped = points.slice(0, 11);
  const origin = `${capped[0].lat},${capped[0].lng}`;
  const destination = `${capped[capped.length - 1].lat},${capped[capped.length - 1].lng}`;
  const waypoints =
    capped.length > 2
      ? capped
          .slice(1, -1)
          .map((p) => `${p.lat},${p.lng}`)
          .join("|")
      : undefined;
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export type SpeciesCoverage = {
  code: string;
  maxPercent: number;
  maxPercentYr: number;
  maxObservations: number;
  maxObservationsYr: number;
  bestHotspotId: string | undefined;
  weightedAvgPercent: number;
  totalChecklists: number;
  hotspotCount: number;
};

type TargetItem = {
  code: string;
  name: string;
  percent: number;
  percentYr: number;
};

type HotspotTargetData = {
  hotspotId?: string;
  items: TargetItem[];
  N: number;
  yrN: number;
};

/**
 * Calculate the best hotspot coverage for each species across all saved hotspots.
 * Returns a map of species code to their coverage stats.
 *
 * @param allTargets - Array of hotspot target data
 * @param topN - Number of top hotspots to use for weighted average (default: 5)
 */
export function calculateSpeciesCoverage(
  allTargets: HotspotTargetData[],
  topN: number = 5
): Map<string, SpeciesCoverage> {
  // First pass: collect all hotspot data for each species
  const speciesHotspots = new Map<string, Array<{ percent: number; N: number; hotspotId: string }>>();

  for (const target of allTargets) {
    if (!target.hotspotId) continue;

    for (const item of target.items) {
      if (!speciesHotspots.has(item.code)) {
        speciesHotspots.set(item.code, []);
      }
      speciesHotspots.get(item.code)!.push({
        percent: item.percent,
        N: target.N,
        hotspotId: target.hotspotId,
      });
    }
  }

  // Second pass: calculate stats for each species
  const coverageMap = new Map<string, SpeciesCoverage>();

  for (const [code, hotspots] of speciesHotspots) {
    // Sort by percentage descending to get top hotspots
    const sortedHotspots = hotspots.sort((a, b) => b.percent - a.percent);
    const topHotspots = sortedHotspots.slice(0, topN);

    // Calculate weighted average using number of checklists as weight
    let totalWeightedPercent = 0;
    let totalChecklists = 0;

    for (const hs of topHotspots) {
      totalWeightedPercent += hs.percent * hs.N;
      totalChecklists += hs.N;
    }

    const weightedAvgPercent = totalChecklists > 0 ? totalWeightedPercent / totalChecklists : 0;

    // Find max values from all hotspots (not just top N)
    const best = sortedHotspots[0];
    let maxObservations = 0;
    let maxObservationsYr = 0;
    let maxPercentYr = 0;

    // Re-scan for year-based stats
    for (const target of allTargets) {
      if (!target.hotspotId) continue;
      const item = target.items.find((it) => it.code === code);
      if (item) {
        const obsYr = (item.percentYr * target.yrN) / 100;
        if (obsYr > maxObservationsYr) maxObservationsYr = obsYr;
        if (item.percentYr > maxPercentYr) maxPercentYr = item.percentYr;
        const obs = (item.percent * target.N) / 100;
        if (obs > maxObservations) maxObservations = obs;
      }
    }

    coverageMap.set(code, {
      code,
      maxPercent: best?.percent || 0,
      maxPercentYr,
      maxObservations,
      maxObservationsYr,
      bestHotspotId: best?.hotspotId,
      weightedAvgPercent: Math.round(weightedAvgPercent * 10) / 10, // Round to 1 decimal
      totalChecklists,
      hotspotCount: topHotspots.length,
    });
  }

  return coverageMap;
}

/**
 * Check if a species has low coverage (hard to find) at all saved hotspots.
 * @param coverage - The coverage stats for the species
 * @param percentThreshold - Max percentage threshold (default 15%)
 * @param observationsThreshold - Max observations threshold (default 10)
 */
export function isLowCoverageSpecies(
  coverage: SpeciesCoverage | undefined,
  percentThreshold: number = 15,
  observationsThreshold: number = 10
): boolean {
  if (!coverage) return true; // Species not found at any hotspot
  return coverage.maxPercent < percentThreshold || coverage.maxObservations < observationsThreshold;
}

export type HotspotSpeciesImportance = {
  isBestAtThisHotspot: boolean;
  isCritical: boolean;
};

/**
 * For a given hotspot, which target species are "important" there (trip dates only).
 * Best = this hotspot is the best place for that species; Critical = hard to see at other saved hotspots.
 */
export function getHotspotSpeciesImportance(
  allTargets: HotspotTargetData[],
  hotspotId: string
): Map<string, HotspotSpeciesImportance> {
  const coverage = calculateSpeciesCoverage(allTargets);
  const hotspotTarget = allTargets.find((t) => t.hotspotId === hotspotId);
  const result = new Map<string, HotspotSpeciesImportance>();

  if (!hotspotTarget?.items?.length) return result;

  for (const item of hotspotTarget.items) {
    const cov = coverage.get(item.code);
    result.set(item.code, {
      isBestAtThisHotspot: cov?.bestHotspotId === hotspotId,
      isCritical: isLowCoverageSpecies(cov),
    });
  }

  return result;
}

export type BestHotspotRow = {
  hotspotId: string;
  hotspotName: string;
  percent: number;
  N: number;
};

const HOTSPOT_TARGET_CUTOFF_PERCENT = 5; // match lib/config HOTSPOT_TARGET_CUTOFF

/**
 * Best saved hotspots for a species (trip dates only).
 * Returns ranked list of hotspots where species is >= cutoff, sorted by percent descending.
 */
export function getBestHotspotsForSpecies(
  speciesCode: string,
  allTargets: HotspotTargetData[],
  locationIds: string[],
  hotspots: { id: string; name: string }[]
): BestHotspotRow[] {
  return allTargets
    .filter(
      (t) =>
        t.hotspotId &&
        locationIds.includes(t.hotspotId) &&
        (t.items.find((it) => it.code === speciesCode)?.percent ?? 0) >= HOTSPOT_TARGET_CUTOFF_PERCENT
    )
    .map((t) => {
      const item = t.items.find((it) => it.code === speciesCode);
      const hotspot = hotspots.find((h) => h.id === t.hotspotId);
      return {
        hotspotId: t.hotspotId!,
        hotspotName: hotspot?.name ?? "Hotspot",
        percent: item?.percent ?? 0,
        N: t.N,
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

/**
 * All saved hotspots where a species appears (trip dates only), any frequency.
 * Used for hover fallback when species is below 5% at every hotspot.
 */
export function getAllHotspotsForSpecies(
  speciesCode: string,
  allTargets: HotspotTargetData[],
  locationIds: string[],
  hotspots: { id: string; name: string }[]
): BestHotspotRow[] {
  return allTargets
    .filter(
      (t) =>
        t.hotspotId &&
        locationIds.includes(t.hotspotId) &&
        (t.items.find((it) => it.code === speciesCode)?.percent ?? 0) > 0
    )
    .map((t) => {
      const item = t.items.find((it) => it.code === speciesCode);
      const hotspot = hotspots.find((h) => h.id === t.hotspotId);
      return {
        hotspotId: t.hotspotId!,
        hotspotName: hotspot?.name ?? "Hotspot",
        percent: item?.percent ?? 0,
        N: t.N,
      };
    })
    .sort((a, b) => b.percent - a.percent);
}
