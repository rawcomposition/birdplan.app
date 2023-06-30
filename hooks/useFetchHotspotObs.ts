import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspotObs(locId: string, speciesCode?: string) {
  const { data, isLoading, error } = useQuery<Observation[]>({
    queryKey: ["/api/hotspot-obs", { locId, speciesCode }],
    enabled: !!locId && !!speciesCode,
  });

  return { data, isLoading, error };
}
