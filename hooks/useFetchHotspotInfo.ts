import { Observation } from "lib/types";
import { useQuery } from "@tanstack/react-query";

type Info = {
  numChecklists: number;
  numSpecies: number;
};

export default function useFetchHotspotInfo(locId: string) {
  const { data, isLoading, error } = useQuery<Info>({
    queryKey: ["/api/hotspot-info", { id: locId }],
    enabled: !!locId,
  });

  return { data, isLoading, error };
}
