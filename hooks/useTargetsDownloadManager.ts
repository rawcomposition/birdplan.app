import { useEffect, useRef, useState } from "react";
import { Targets } from "lib/types";
import { addTargets } from "lib/firebase";
import { useTrip } from "providers/trip";

const CUTOFF = "5%";

export default function useTargetsDownloadManager() {
  const { trip, setHotspotTargetsId } = useTrip();
  const [isDownloading, setIsDownloading] = useState(false);

  const processedHotspotsRef = useRef(new Set<string>());
  const pendingHotspotsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!trip?.hotspots) return;

    trip.hotspots
      .filter((it) => !it.targetsId && !processedHotspotsRef.current.has(it.id))
      .forEach((it) => pendingHotspotsRef.current.add(it.id));

    if (!isDownloading) downloadPendingTargets();
  }, [trip]);

  const downloadPendingTargets = async () => {
    setIsDownloading(true);

    while (pendingHotspotsRef.current.size > 0) {
      const locId = pendingHotspotsRef.current.values().next().value;
      if (!locId) break;

      pendingHotspotsRef.current.delete(locId);

      try {
        const targets: Targets = await fetchTargetsForHotspot(locId);

        if (targets && !!targets.items?.length) {
          await handleAddTargets(locId, targets);
          processedHotspotsRef.current.add(locId);
        }
      } catch (error) {
        console.error(`Failed to download targets for ${locId}:`, error);
        // TODO: Only retry once
        pendingHotspotsRef.current.add(locId);
      }
    }

    setIsDownloading(false);
  };

  const handleAddTargets = async (locId: string, data: Targets) => {
    const id = await addTargets(data);
    if (id && locId) {
      setHotspotTargetsId(locId, id.id);
    }
  };

  const fetchTargetsForHotspot = async (locId: string): Promise<Targets> => {
    const url = `https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get?startMonth=${trip?.startMonth}&endMonth=${trip?.endMonth}&region=${locId}&cutoff=${CUTOFF}`;
    const response = await fetch(url);
    return response.json();
  };

  return {};
}
