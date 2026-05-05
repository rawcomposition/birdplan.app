import { useQuery } from "@tanstack/react-query";

type Info = {
  numChecklists: number;
  numSpecies: number;
};

export default function useFetchHotspotInfo(tripId: string, hotspotId: string) {
  const { data, isLoading, error } = useQuery<Info>({
    queryKey: [`/trips/${tripId}/hotspots/${hotspotId}/info`],
    enabled: !!hotspotId && !!tripId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return { data, isLoading, error };
}
