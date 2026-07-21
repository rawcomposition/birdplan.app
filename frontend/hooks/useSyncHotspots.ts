import React from "react";
import { useTrip } from "hooks/useTrip";
import useTripHotspots from "hooks/useTripHotspots";
import useTripMutation from "hooks/useTripMutation";

type SyncUpdate = { id: string; species: number; checklists: number; lat: number; lng: number; name?: string };

export default function useSyncHotspots() {
  const { trip, canEdit } = useTrip();
  const { data } = useTripHotspots();
  const hotspots = data || [];
  const hasFetched = hotspots.length > 0;

  const syncMutation = useTripMutation<{ updates: SyncUpdate[] }>({
    url: `/trips/${trip?._id}/hotspots/sync`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((h) => {
        const u = input.updates.find((it) => it.id === h.id);
        if (!u) return h;
        return {
          ...h,
          species: u.species,
          checklists: u.checklists,
          lat: u.lat,
          lng: u.lng,
          ...(u.name !== undefined ? { name: u.name } : {}),
        };
      }),
    }),
  });

  React.useEffect(() => {
    if (!canEdit || !hasFetched || !trip?._id || !trip.hotspots?.length) return;
    const updates: SyncUpdate[] = [];
    for (const saved of trip.hotspots) {
      const live = hotspots.find((h) => h.id === saved.id);
      if (!live) continue;
      if (
        !Number.isFinite(live.species) ||
        !Number.isFinite(live.checklists) ||
        !Number.isFinite(live.lat) ||
        !Number.isFinite(live.lng)
      )
        continue;
      const shouldSyncName = !saved.originalName && saved.name !== live.name;
      const shouldSyncCounts = saved.species !== live.species || saved.checklists !== live.checklists;
      const shouldSyncCoords = saved.lat !== live.lat || saved.lng !== live.lng;
      if (!shouldSyncName && !shouldSyncCounts && !shouldSyncCoords) continue;
      updates.push({
        id: saved.id,
        species: live.species,
        checklists: live.checklists,
        lat: live.lat,
        lng: live.lng,
        ...(shouldSyncName ? { name: live.name } : {}),
      });
    }
    if (updates.length === 0) return;
    syncMutation.mutate({ updates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, hasFetched, trip?._id, trip?.hotspots, hotspots]);
}
