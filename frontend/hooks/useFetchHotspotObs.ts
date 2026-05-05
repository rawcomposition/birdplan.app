import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspotObs(tripId: string, hotspotId: string, speciesCode?: string) {
  const { data, isLoading, error, refetch } = useQuery<Observation[]>({
    queryKey: [`/trips/${tripId}/hotspots/${hotspotId}/obs`, { speciesCode }],
    enabled: !!tripId && !!hotspotId && !!speciesCode,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error, refetch };
}
