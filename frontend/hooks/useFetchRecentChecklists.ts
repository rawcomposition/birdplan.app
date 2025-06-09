import React from "react";
import { RecentChecklist } from "lib/types";
import { nanoId } from "lib/helpers";
import { useQuery } from "@tanstack/react-query";

export default function useFetchRecentChecklists(region?: string) {
  const { data, isLoading, error, refetch } = useQuery<RecentChecklist[]>({
    // Proxy required for this particular eBird endpoint to avoid CORS error
    queryKey: [
      `/api/v1/ebird-proxy/product/lists/${region}`,
      { maxResults: 40, key: process.env.NEXT_PUBLIC_EBIRD_KEY },
    ],
    enabled: !!region,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const groupedChecklists = React.useMemo(() => {
    if (!data) return [];
    const grouped = data.reduce((acc, item) => {
      const key = `${item.obsDt}-${item.obsTime || nanoId(5)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as { [key: string]: RecentChecklist[] });
    return Object.values(grouped);
  }, [data]);

  return { checklists: data, groupedChecklists, isLoading, error, refetch };
}
