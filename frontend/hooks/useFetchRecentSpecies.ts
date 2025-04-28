import { useProfile } from "providers/profile";
import { RecentSpecies } from "lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFetchRecentSpecies(region?: string) {
  const { lifelist } = useProfile();

  const { data, isLoading, error, refetch } = useQuery<RecentSpecies[]>({
    queryKey: [`/api/v1/region/${region}/species`],
    enabled: !!region,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const filtered = data?.filter((it) => !lifelist.includes(it.code)) || [];

  return { recentSpecies: filtered, isLoading, error, refetch };
}
