import { useEffect, useRef, useState } from "react";
import { Targets } from "lib/types";
import { addTargets, updateHotspots } from "lib/firebase";
import { useTrip } from "providers/trip";
import { useWindowActive } from "hooks/useWindowActive";

const CUTOFF = "5%";
const RETRY_LIMIT = 1;

export default function useTargetsDownloadManager() {
  const { trip } = useTrip();
  const [downloadingLocId, setDownloadingLocId] = useState<string | null>(null);
  const isDownloading = !!downloadingLocId;

  const processedHotspotsRef = useRef(new Set<string>());
  const pendingHotspotsRef = useRef(new Set<string>());
  const failedAttemptsRef = useRef(new Map<string, number>());

  const windowIsFocused = useWindowActive({
    onFocus: () => {
      processedHotspotsRef.current.clear();
      pendingHotspotsRef.current.clear();
      failedAttemptsRef.current.clear();
    },
  });
  const isPaused = !windowIsFocused;

  const retryDownload = (locId: string) => {
    pendingHotspotsRef.current.add(locId);
    failedAttemptsRef.current.set(locId, 0);
  };

  useEffect(() => {
    if (!trip?.hotspots) return;

    trip.hotspots
      .filter((it) => !it.targetsId && !processedHotspotsRef.current.has(it.id))
      .forEach((it) => pendingHotspotsRef.current.add(it.id));

    if (!isDownloading && !isPaused) downloadPendingTargets();
  }, [trip, isPaused, isDownloading]);

  const downloadPendingTargets = async () => {
    while (pendingHotspotsRef.current.size > 0) {
      const locId = pendingHotspotsRef.current.values().next().value;
      if (!locId) break;
      setDownloadingLocId(locId);

      pendingHotspotsRef.current.delete(locId);

      try {
        const targets: Targets = await fetchTargetsForHotspot(locId);

        if (targets) {
          await handleAddTargets(locId, targets);
          processedHotspotsRef.current.add(locId);
          failedAttemptsRef.current.delete(locId);
        }
      } catch (error) {
        console.error(`Failed to download targets for ${locId}:`, error);
        const attempts = failedAttemptsRef.current.get(locId) || 0;
        if (attempts < RETRY_LIMIT) {
          pendingHotspotsRef.current.add(locId);
          failedAttemptsRef.current.set(locId, attempts + 1);
        }
      }
    }

    setDownloadingLocId(null);
  };

  const handleAddTargets = async (locId: string, data: Targets) => {
    const targetsId = await addTargets(data);
    if (targetsId && locId) {
      if (!trip) return;
      const newHotspots = trip.hotspots.map((it) => {
        if (it.id === locId) return { ...it, targetsId };
        return it;
      });
      await updateHotspots(trip.id, newHotspots);
    }
  };

  const fetchTargetsForHotspot = async (locId: string): Promise<Targets> => {
    const url = `https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get?startMonth=${trip?.startMonth}&endMonth=${trip?.endMonth}&region=${locId}&cutoff=${CUTOFF}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    if (!data.items?.length) throw new Error("No targets found");
    return data;
  };

  const pendingLocIds = Array.from(pendingHotspotsRef.current);
  if (downloadingLocId) pendingLocIds.push(downloadingLocId);

  const failedLocIds = Array.from(failedAttemptsRef.current.entries())
    .filter(([_, attempts]) => attempts >= RETRY_LIMIT)
    .map(([locId]) => locId);

  return { pendingLocIds, failedLocIds, downloadingLocId, isDownloading, retryDownload };
}
