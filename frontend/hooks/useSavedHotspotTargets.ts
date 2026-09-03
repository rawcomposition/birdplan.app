import { useQueries } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import { useTrip } from "hooks/useTrip";
import type { HotspotTargetCounts } from "lib/targets";
import type { OpenBirdingLocationResponse } from "@birdplan/shared";

export default function useSavedHotspotTargets(enabled: boolean) {
  const { trip } = useTrip();
  const hotspotIds = trip?.hotspots.map((it) => it.id) ?? [];

  const results = useQueries({
    queries: hotspotIds.map((id) => ({
      queryKey: [`${OPENBIRDING_API_URL}/api/v1/targets/location/${id}`],
      enabled: enabled && !!OPENBIRDING_API_URL,
      staleTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  const responses = results.map(({ data }) => data as OpenBirdingLocationResponse | undefined);

  const hotspots: HotspotTargetCounts[] = responses.every((it) => !!it)
    ? hotspotIds.map((hotspotId, index) => {
        const response = responses[index] as OpenBirdingLocationResponse;
        return {
          hotspotId,
          samples: response.samples,
          obsByCode: new Map(response.items.map((it) => [it.code, it.obs])),
        };
      })
    : [];

  return { hotspots, isLoading: results.some((it) => it.isLoading) };
}
