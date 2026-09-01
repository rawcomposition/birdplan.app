import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { getMonthRange } from "lib/targets";
import { useTrip } from "hooks/useTrip";
import type { OpenBirdingHotspotRankingResponse } from "@birdplan/shared";

const HOTSPOT_LIMIT = 500;

export default function useSpeciesHotspotRankings(code?: string, locationIds?: string[]) {
  const { trip } = useTrip();
  const months = trip ? getMonthRange(trip.startMonth, trip.endMonth) : [];
  const scope = locationIds ? locationIds.join(",") : trip?.region;

  const { data } = useQuery<OpenBirdingHotspotRankingResponse>({
    queryKey: ["openbirding-trip-hotspots", code, scope, months.join(",")],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/species/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(locationIds ? { locationIds } : { region: trip?.region, limit: HOTSPOT_LIMIT }),
          months,
          sortBy: "frequency",
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch hotspot rankings");
      return res.json();
    },
    enabled: !!code && !!OPENBIRDING_API_URL && (locationIds ? locationIds.length > 0 : !!trip?.region),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return data?.items ?? [];
}
