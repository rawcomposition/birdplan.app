import { useQuery } from "@tanstack/react-query";

type Info = {
  numChecklists: number;
  numSpecies: number;
};

export default function useFetchHotspotInfo(locId: string) {
  const { data, isLoading, error } = useQuery<Info>({
    queryKey: ["/api/hotspot-info", { id: locId }],
    enabled: !!locId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error };
}
