import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import type { OpenBirdingLocationResponse } from "@birdplan/shared";

export default function useLocationTargets(locationId?: string) {
  return useQuery<OpenBirdingLocationResponse>({
    queryKey: ["openbirding-location-targets", locationId],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/targets/location/${locationId}`);
      if (!res.ok) throw new Error("Failed to fetch location targets");
      return res.json();
    },
    enabled: !!locationId && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
