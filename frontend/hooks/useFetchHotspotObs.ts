import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspotObs(hotspotId: string, speciesCode?: string) {
  const { data, isLoading, error, refetch } = useQuery<Observation[]>({
    queryKey: [`/hotspots/${hotspotId}/obs`, { speciesCode }],
    enabled: !!hotspotId && !!speciesCode,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error, refetch };
}
