import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspotObs(tripId: string, hotspotId: string, speciesCode?: string) {
  const { data, isLoading, error } = useQuery<Observation[]>({
    queryKey: [`/api/v1/trips/${tripId}/hotspots/${hotspotId}/obs`, { speciesCode }],
    enabled: !!tripId && !!hotspotId && !!speciesCode,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error };
}
