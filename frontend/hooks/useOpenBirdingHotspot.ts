import { useQuery } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import type { OpenBirdingHotspot } from "@birdplan/shared";

export default function useOpenBirdingHotspot(hotspotId?: string) {
  return useQuery<OpenBirdingHotspot>({
    queryKey: [`${OPENBIRDING_API_URL}/api/v1/hotspots/location/${hotspotId}`],
    enabled: !!hotspotId && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
