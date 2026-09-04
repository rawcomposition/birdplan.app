import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { Trip, eBirdHotspot, OpenBirdingHotspotBBoxResponse } from "@birdplan/shared";
import { HotspotFilters } from "hooks/useTrip";

export const EXPLORE_MIN_ZOOM = 6;

type Bounds = Trip["bounds"];

const GRID = 0.25;
const snapDown = (value: number) => Math.floor(value / GRID) * GRID;
const snapUp = (value: number) => Math.ceil(value / GRID) * GRID;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toBBoxParam = (bounds: Bounds) =>
  [
    clamp(snapDown(bounds.minX), -180, 180),
    clamp(snapDown(bounds.minY), -90, 90),
    clamp(snapUp(bounds.maxX), -180, 180),
    clamp(snapUp(bounds.maxY), -90, 90),
  ].join(",");

export default function useExploreHotspots(bounds: Bounds | null, zoom: number, filters: HotspotFilters) {
  const bbox = bounds && zoom >= EXPLORE_MIN_ZOOM ? toBBoxParam(bounds) : null;
  const params = new URLSearchParams({ bbox: bbox ?? "" });
  if (filters.minChecklists > 0) params.set("minChecklists", String(filters.minChecklists));
  if (filters.minSpecies > 0) params.set("minSpecies", String(filters.minSpecies));

  const query = useQuery<OpenBirdingHotspotBBoxResponse>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/hotspots?${params}`],
    enabled: !!bbox && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: (prev) => prev,
  });

  const hotspots: eBirdHotspot[] = (query.data?.items || []).map(([id, lat, lng, species]) => ({
    id,
    name: "",
    lat,
    lng,
    species: species ?? 0,
    checklists: 0,
  }));

  return { hotspots, isLoading: query.isLoading, isError: query.isError, error: query.error, isZoomedOut: !bbox };
}
