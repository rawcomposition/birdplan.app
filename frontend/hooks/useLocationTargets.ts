import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import type { OpenBirdingLocationResponse } from "@birdplan/shared";

export default function useLocationTargets(locationId?: string) {
  return useQuery<OpenBirdingLocationResponse>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/targets/location/${locationId}`],
    enabled: !!locationId && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
