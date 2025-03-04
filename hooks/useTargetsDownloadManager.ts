import { useEffect, useRef, useState } from "react";
import { TargetList, TargetListInput } from "lib/types";
import { addTargets, auth, updateHotspots } from "lib/firebase";
import { useTrip } from "providers/trip";
import { useWindowActive } from "hooks/useWindowActive";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

const CUTOFF = "5"; // Percent
const RETRY_LIMIT = 1;

export default function useTargetsDownloadManager() {
  const { trip, canEdit } = useTrip();
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

  const queryClient = useQueryClient();

  const retryDownload = (locId: string) => {
    if (!canEdit) return;
    pendingHotspotsRef.current.add(locId);
    failedAttemptsRef.current.set(locId, 0);
    downloadPendingTargets();
  };

  const fetchTargetsForHotspot = async (locId: string): Promise<TargetList> => {
    const url = `https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get?startMonth=${trip?.startMonth}&endMonth=${trip?.endMonth}&region=${locId}&cutoff=${CUTOFF}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    if (!data.items?.length) throw new Error("No targets found");
    return data;
  };

  const handleAddTargets = async (locId: string, data: TargetList) => {
    if (!trip) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const input: TargetListInput = { ...data, hotspotId: locId };
      await fetch(`/api/trips/${trip?._id}/hotspots/${locId}/targets`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(input),
      });
    } catch (error) {
      console.error(`Failed to upload targets for ${locId}:`, error);
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}/hotspots/${locId}/targets`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}/all-hotspot-targets`] }),
    ]);
  };

  const downloadPendingTargets = async () => {
    if (downloadingRef.current || isPaused) return;
    downloadingRef.current = true;

    while (pendingHotspotsRef.current.size > 0) {
      const locId = pendingHotspotsRef.current.values().next().value;
      if (!locId) break;

      setDownloadingLocId(locId);
      pendingHotspotsRef.current.delete(locId);

      try {
        const targets: TargetList = await fetchTargetsForHotspot(locId);
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
    downloadingRef.current = false;
  };

  useEffect(() => {
    if (!trip?.hotspots || !canEdit) return;

    trip.hotspots
      .filter(
        (it) => !it.targetsId && !processedHotspotsRef.current.has(it.id) && !pendingHotspotsRef.current.has(it.id)
      )
      .forEach((it) => pendingHotspotsRef.current.add(it.id));

    if (!downloadingRef.current && !isPaused) {
      downloadPendingTargets();
    }
  }, [trip?.hotspots, isPaused, canEdit]);

  const pendingLocIds = Array.from(pendingHotspotsRef.current);
  if (downloadingLocId) pendingLocIds.push(downloadingLocId);

  const failedLocIds = Array.from(failedAttemptsRef.current.entries())
    .filter(([_, attempts]) => attempts >= RETRY_LIMIT)
    .map(([locId]) => locId);

  return { pendingLocIds, failedLocIds, downloadingLocId, retryDownload };
}
