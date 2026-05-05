import { useProfile } from "providers/profile";
import { RecentSpecies } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchRecentSpecies(region?: string) {
  const { lifelist } = useProfile();

  const { data, isLoading, error, refetch } = useQuery<RecentSpecies[]>({
    queryKey: [`/region/${region}/species`],
    enabled: !!region,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const filtered = data?.filter((it) => !lifelist.includes(it.code)) || [];

  return { recentSpecies: filtered, allSpecies: data, isLoading, error, refetch };
}
