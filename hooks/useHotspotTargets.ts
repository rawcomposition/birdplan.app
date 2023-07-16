import { Targets } from "lib/types";
import { useQuery } from "@tanstack/react-query";
import { addTargets, getTargets } from "lib/firebase";
import { useTrip } from "providers/trip";

export default function useHotspotTargets(locId?: string) {
  const { trip, setHotspotTargetsId } = useTrip();
  const hotspot = trip?.hotspots.find((it) => it.id === locId);
  const targetsId = hotspot?.targetsId;

  const { data, isLoading, isFetching, error } = useQuery<Targets | null>(
    [`targets/${targetsId}`],
    async () => getTargets(targetsId || ""),
    {
      enabled: !!locId && !!targetsId,
      meta: {
        errorMessage: "Failed to load hotspot targets",
      },
    }
  );

  const handleAddTargets = async (data: Targets) => {
    const id = await addTargets(data);
    if (id && locId) {
      setHotspotTargetsId(locId, id.id);
    }
  };

  return {
    isLoading: isFetching && isLoading,
    error,
    addTargets: handleAddTargets,
    items: data?.items || [],
    N: data?.N || 0,
    yrN: data?.yrN || 0,
  };
}
