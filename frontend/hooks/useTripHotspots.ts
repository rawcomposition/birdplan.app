import { eBirdHotspot, OpenBirdingRegionHotspotsResponse } from "@birdplan/shared";
import { useQuery } from "@tanstack/react-query";
import { useTrip } from "hooks/useTrip";
import { OPENBIRDING_API_URL } from "lib/config";

export default function useTripHotspots(enabled = true) {
  const { trip } = useTrip();
  const region = trip?.region;

  return useQuery<OpenBirdingRegionHotspotsResponse, Error, eBirdHotspot[]>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/hotspots/region/${region}`],
    enabled: !!region && enabled,
    select: (data) => data.items,
    meta: {
      errorMessage: "Failed to load hotspots",
      showLoading: true,
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
