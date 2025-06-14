import { Target } from "shared/types";
import { useQuery } from "@tanstack/react-query";

type PropsT = {
  region?: string;
  startMonth?: number;
  endMonth?: number;
  enabled: boolean;
  cutoff?: string;
};

export default function useDownloadTargets({ region, startMonth, endMonth, enabled, cutoff }: PropsT) {
  const { data, isLoading, isRefetching, isFetching, error, refetch } = useQuery<{
    items: Target[];
    N: number;
    yrN: number;
  }>({
    queryKey: [
      "https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get",
      { startMonth: startMonth || 1, endMonth: endMonth || 12, region, ...(cutoff ? { cutoff } : {}) },
    ],
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!region && enabled,
  });

  return { data, isLoading, error, isRefetching, isFetching, refetch };
}
