import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspotObs(locId: string, speciesCode?: string) {
  const { data, isLoading, error } = useQuery<Observation[]>({
    queryKey: ["/api/hotspot-obs", { locId, speciesCode }],
    enabled: !!locId && !!speciesCode,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error };
}
