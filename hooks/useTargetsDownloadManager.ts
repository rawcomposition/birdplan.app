import { useEffect, useRef, useState } from "react";
import { TargetList } from "lib/types";
import { addTargets, updateHotspots } from "lib/firebase";
import { useTrip } from "providers/trip";
import { useWindowActive } from "hooks/useWindowActive";
import { LocationType } from "lib/types";

const CUTOFF = "5"; // Percent
const RETRY_LIMIT = 1;

export default function useTargetsDownloadManager() {
  const { trip, locations, canEdit } = useTrip();
  const hotspots = locations.filter((it) => it.type === LocationType.hotspot);
  const [downloadingLocId, setDownloadingLocId] = useState<string | null>(null);

  const processedHotspotsRef = useRef(new Set<string>());
  const pendingHotspotsRef = useRef(new Set<string>());
  const failedAttemptsRef = useRef(new Map<string, number>());
  const downloadingRef = useRef(false);

  const windowIsFocused = useWindowActive({
    onFocus: () => {
      processedHotspotsRef.current.clear();
      pendingHotspotsRef.current.clear();
      failedAttemptsRef.current.clear();
    },
  });
  const isPaused = !windowIsFocused;

  const retryDownload = (locId: string) => {
    if (!canEdit) return;
    pendingHotspotsRef.current.add(locId);
    failedAttemptsRef.current.set(locId, 0);
    downloadPendingTargets();
  };

  const fetchTargetsForHotspot = async (ebirdLocationId: string): Promise<TargetList> => {
    const url = `https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get?startMonth=${trip?.startMonth}&endMonth=${trip?.endMonth}&region=${ebirdLocationId}&cutoff=${CUTOFF}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    if (!data.items?.length) throw new Error("No targets found");
    return data;
  };

  const handleAddTargets = async (ebirdLocationId: string, data: TargetList) => {
    if (!trip) return;
    const targetsId = await addTargets({ ...data, tripId: trip?._id, hotspotId: ebirdLocationId });
    if (targetsId && ebirdLocationId) {
      const newHotspots = hotspots.map((it) => {
        if (it.ebirdId === ebirdLocationId) return { ...it, targetsId };
        return it;
      });
      await updateHotspots(trip._id, newHotspots);
    }
  };

  const downloadPendingTargets = async () => {
    if (downloadingRef.current || isPaused) return;
    downloadingRef.current = true;

    while (pendingHotspotsRef.current.size > 0) {
      const ebirdLocationId = pendingHotspotsRef.current.values().next().value;
      if (!ebirdLocationId) break;

      setDownloadingLocId(ebirdLocationId);
      pendingHotspotsRef.current.delete(ebirdLocationId);

      try {
        const targets: TargetList = await fetchTargetsForHotspot(ebirdLocationId);
        if (targets) {
          await handleAddTargets(ebirdLocationId, targets);
          processedHotspotsRef.current.add(ebirdLocationId);
          failedAttemptsRef.current.delete(ebirdLocationId);
        }
      } catch (error) {
        console.error(`Failed to download targets for ${ebirdLocationId}:`, error);
        const attempts = failedAttemptsRef.current.get(ebirdLocationId) || 0;
        if (attempts < RETRY_LIMIT) {
          pendingHotspotsRef.current.add(ebirdLocationId);
          failedAttemptsRef.current.set(ebirdLocationId, attempts + 1);
        }
      }
    }

    setDownloadingLocId(null);
    downloadingRef.current = false;
  };

  useEffect(() => {
    if (!hotspots || !canEdit) return;

    hotspots
      .filter(
        (it) =>
          it.ebirdId &&
          !it.targetsId &&
          !processedHotspotsRef.current.has(it.ebirdId) &&
          !pendingHotspotsRef.current.has(it.ebirdId)
      )
      .forEach((it) => pendingHotspotsRef.current.add(it.ebirdId as string));

    if (!downloadingRef.current && !isPaused) {
      downloadPendingTargets();
    }
  }, [hotspots, isPaused, canEdit]);

  const pendingLocIds = Array.from(pendingHotspotsRef.current);
  if (downloadingLocId) pendingLocIds.push(downloadingLocId);

  const failedLocIds = Array.from(failedAttemptsRef.current.entries())
    .filter(([_, attempts]) => attempts >= RETRY_LIMIT)
    .map(([locId]) => locId);

  return { pendingLocIds, failedLocIds, downloadingLocId, retryDownload };
}
