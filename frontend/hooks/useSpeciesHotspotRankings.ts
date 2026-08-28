import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { getMonthRange } from "lib/targets";
import { useTrip } from "hooks/useTrip";
import type { OpenBirdingHotspotRankingResponse } from "@birdplan/shared";

const HOTSPOT_LIMIT = 500;

export default function useSpeciesHotspotRankings(code?: string) {
  const { trip } = useTrip();
  const months = trip ? getMonthRange(trip.startMonth, trip.endMonth) : [];

  const { data, isLoading } = useQuery<OpenBirdingHotspotRankingResponse>({
    queryKey: ["openbirding-trip-hotspots", code, trip?.region, months.join(",")],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/species/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: trip?.region, limit: HOTSPOT_LIMIT, months, sortBy: "frequency" }),
      });
      if (!res.ok) throw new Error("Failed to fetch hotspot rankings");
      return res.json();
    },
    enabled: !!code && !!OPENBIRDING_API_URL && !!trip?.region,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { hotspots: data?.items ?? [], isLoading };
}
