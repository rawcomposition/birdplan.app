import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { getMonthRange } from "lib/targets";
import type { OpenBirdingRegionResponse } from "@birdplan/shared";

type PropsT = {
  region?: string;
  startMonth?: number;
  endMonth?: number;
  enabled: boolean;
};

export default function useDownloadTargets({ region, startMonth, endMonth, enabled }: PropsT) {
  const months = getMonthRange(startMonth || 1, endMonth || 12).join(",");

  const { data, isLoading, isRefetching, isFetching, error, refetch } = useQuery<OpenBirdingRegionResponse>({
    queryKey: ["openbirding-region-targets", region, months],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/targets/region/${region}?months=${months}`);
      if (!res.ok) throw new Error("Failed to fetch region targets");
      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!region && !!OPENBIRDING_API_URL && enabled,
  });

  return { data, isLoading, error, isRefetching, isFetching, refetch };
}
