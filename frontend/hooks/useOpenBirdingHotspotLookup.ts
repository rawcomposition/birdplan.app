import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import type { OpenBirdingHotspotLookupResponse } from "@birdplan/shared";

export default function useOpenBirdingHotspotLookup(ids: string[]) {
  const sortedIds = [...ids].sort();

  return useQuery<OpenBirdingHotspotLookupResponse>({
    queryKey: ["openbirding-hotspot-lookup", sortedIds],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: sortedIds }),
      });
      if (!res.ok) throw new Error("Failed to look up hotspots");
      return res.json();
    },
    enabled: sortedIds.length > 0 && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
