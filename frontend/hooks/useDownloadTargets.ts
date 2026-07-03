import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { getMonthRange } from "lib/targets";
import type { OpenBirdingRegionResponse, TripCustomArea } from "@birdplan/shared";

type PropsT = {
  region?: string;
  customArea?: TripCustomArea | null;
  startMonth?: number;
  endMonth?: number;
  enabled: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function useDownloadTargets({ region, customArea, startMonth, endMonth, enabled }: PropsT) {
  const months = getMonthRange(startMonth || 1, endMonth || 12);
  const cells = customArea?.cells;

  const regionQuery = useQuery<OpenBirdingRegionResponse>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/targets/region/${region}?months=${months.join(",")}`],
    refetchOnWindowFocus: false,
    staleTime: DAY_MS,
    enabled: !!region && !!OPENBIRDING_API_URL && !cells?.length && enabled,
  });

  const h3Query = useQuery<OpenBirdingRegionResponse>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/targets/h3`, { months, cells }],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/targets/h3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cells, months }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Failed to load custom area targets");
      }
      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: DAY_MS,
    enabled: !!cells?.length && !!OPENBIRDING_API_URL && enabled,
  });

  const query = cells?.length ? h3Query : regionQuery;
  const { data, isLoading, isRefetching, isFetching, error, refetch } = query;

  return { data, isLoading, error, isRefetching, isFetching, refetch };
}
