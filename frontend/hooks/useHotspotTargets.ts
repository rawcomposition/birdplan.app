import { useQueries } from "@tanstack/react-query";
import { OPENBIRDING_API_URL } from "lib/config";
import type { HotspotTargetCounts } from "lib/targets";
import type { OpenBirdingLocationResponse } from "@birdplan/shared";

export default function useHotspotTargets(hotspotIds: string[], enabled: boolean) {
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

  const namesByCode = new Map(
    responses.flatMap((response) => (response ? response.items.map((it) => [it.code, it.name] as const) : []))
  );

  return { hotspots, namesByCode, isLoading: results.some((it) => it.isLoading) };
}
