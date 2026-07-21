import { eBirdHotspot } from "@birdplan/shared";
import { useQuery } from "@tanstack/react-query";
import { useTrip } from "hooks/useTrip";

export default function useTripHotspots(enabled = true) {
  const { trip } = useTrip();
  const region = trip?.region;

  return useQuery<eBirdHotspot[]>({
    queryKey: [`/region/${region}/hotspots`],
    enabled: !!region && enabled,
    meta: {
      errorMessage: "Failed to load hotspots",
      showLoading: true,
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
