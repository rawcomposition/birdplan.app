import React from "react";
import { useQuery } from "@tanstack/react-query";
import { EBIRD_BASE_URL } from "lib/config";
import { TargetList } from "@birdplan/shared";

type Obs = {
  id: string;
  lat: number;
  lng: number;
  name: string; // Hotspot name
  isPersonal: boolean;
};

// Raw observation from eBird API
type RawObs = {
  locId: string;
  locName: string;
  lat: number;
  lng: number;
  howMany?: number;
  obsDt: string;
  locationPrivate: boolean;
};

// Aggregated sighting data for a hotspot
type SightingStats = {
  reportCount: number; // Number of times species was reported
  totalCount: number; // Total individuals seen
  mostRecentDate: string; // Most recent observation date
  daysAgo: number; // Days since most recent sighting
};

type Props = {
  region?: string;
  code?: string;
  allTargets?: TargetList[];
  showPersonalLocations?: boolean;
};

/**
 * Get a color index (3-9) based on frequency percentage.
 * Higher percentages = higher index = warmer colors.
 * Minimum colorIndex is 3 to ensure all hotspots are visually distinct.
 */
function getFrequencyColorIndex(percent: number): number {
  if (percent >= 50) return 9;
  if (percent >= 40) return 8;
  if (percent >= 30) return 7;
  if (percent >= 20) return 6;
  if (percent >= 15) return 5;
  if (percent >= 10) return 4;
  if (percent >= 5) return 3;
  // Minimum colorIndex 3 for any hotspot with data
  return 3;
}

/**
 * Get a color index based on recency for unsaved hotspots.
 *
 * Since the eBird API only returns one entry per location (most recent observation),
 * we can't calculate true sighting frequency. Instead, we color by recency:
 * - More recent sightings = warmer colors
 * - Older sightings = cooler colors
 */
function getSightingColorIndex(stats: SightingStats): number {
  // Color by recency: today = warm, 30 days ago = cool
  if (stats.daysAgo <= 1) return 7;   // orange - seen today/yesterday
  if (stats.daysAgo <= 3) return 6;   // yellow-orange - seen in last 3 days
  if (stats.daysAgo <= 7) return 5;   // yellow - seen in last week
  if (stats.daysAgo <= 14) return 4;  // yellow-green - seen in last 2 weeks
  return 3; // light blue - seen in last month
}

export default function useFetchSpeciesObs({ region, code, allTargets, showPersonalLocations = false }: Props) {
  const { data: rawData } = useQuery<RawObs[]>({
    queryKey: [`${EBIRD_BASE_URL}/data/obs/${region}/recent/${code}`, { back: 30, includeProvisional: true }],
    enabled: !!region && !!code,
    meta: {
      errorMessage: "Failed to load observations",
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Aggregate sighting stats per hotspot from raw observations
  const { uniqueObs, sightingStatsMap } = React.useMemo(() => {
    if (!rawData) return { uniqueObs: [], sightingStatsMap: new Map<string, SightingStats>() };

    const statsMap = new Map<string, SightingStats>();
    const seenIds = new Set<string>();
    const unique: Obs[] = [];
    const now = new Date();

    for (const raw of rawData) {
      // Skip personal locations if toggle is off
      if (!showPersonalLocations && raw.locationPrivate) continue;

      const id = raw.locId;

      // Calculate days ago for this observation
      const obsDate = new Date(raw.obsDt);
      const daysAgo = Math.floor((now.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24));

      // Aggregate stats
      const existing = statsMap.get(id);
      if (existing) {
        existing.reportCount += 1;
        existing.totalCount += raw.howMany || 1;
        if (raw.obsDt > existing.mostRecentDate) {
          existing.mostRecentDate = raw.obsDt;
          existing.daysAgo = daysAgo;
        }
      } else {
        statsMap.set(id, {
          reportCount: 1,
          totalCount: raw.howMany || 1,
          mostRecentDate: raw.obsDt,
          daysAgo,
        });
      }

      // Build unique observation list (first occurrence of each location)
      if (!seenIds.has(id)) {
        seenIds.add(id);
        unique.push({
          id,
          lat: raw.lat,
          lng: raw.lng,
          name: raw.locName,
          isPersonal: raw.locationPrivate,
        });
      }
    }

    return { uniqueObs: unique, sightingStatsMap: statsMap };
  }, [rawData, showPersonalLocations]);

  const obsRef = React.useRef<Obs[]>([]);
  obsRef.current = uniqueObs;
  const hasFetched = uniqueObs.length > 0;

  // Build a map of hotspot ID -> frequency percentage for saved hotspots
  const frequencyMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (!allTargets || !code) return map;

    for (const target of allTargets) {
      if (!target.hotspotId) continue;
      const speciesItem = target.items.find((item) => item.code === code);
      if (speciesItem) {
        // Use percent (trip date range) rather than percentYr (all year)
        map.set(target.hotspotId, speciesItem.percent);
      }
    }
    return map;
  }, [allTargets, code]);

  const hasFrequencyData = frequencyMap.size > 0;

  const layer = hasFetched
    ? {
        type: "FeatureCollection",
        features: [
          ...obsRef.current.map((it) => {
            const hasSavedData = frequencyMap.has(it.id);
            const frequency = frequencyMap.get(it.id) || 0;
            const sightingStats = sightingStatsMap.get(it.id);

            // Use saved frequency data if available, otherwise use recency-based color
            let colorIndex: number;
            if (hasSavedData) {
              colorIndex = getFrequencyColorIndex(frequency);
            } else if (sightingStats) {
              colorIndex = getSightingColorIndex(sightingStats);
            } else {
              // Fallback: minimum colorIndex 3 to avoid gray
              colorIndex = 3;
            }

            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [it.lng, it.lat],
              },
              properties: {
                id: it.id,
                isPersonal: it.isPersonal ? "true" : "false",
                frequency,
                colorIndex,
                hasSavedData: hasSavedData ? "true" : "false",
                reportCount: sightingStats?.reportCount || 0,
                daysAgo: sightingStats?.daysAgo || 0,
              },
            };
          }),
        ],
      }
    : null;

  return { obs: uniqueObs, obsLayer: layer, hasFrequencyData };
}
