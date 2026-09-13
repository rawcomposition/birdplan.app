import React from "react";
import { HotspotSyncInput, HotspotSyncUpdate } from "@birdplan/shared";
import { useTrip } from "hooks/useTrip";
import useOpenBirdingHotspotLookup from "hooks/useOpenBirdingHotspotLookup";
import useTripMutation from "hooks/useTripMutation";

export default function useSyncHotspots() {
  const { trip, canEdit } = useTrip();
  const savedIds = (trip?.hotspots || []).map((it) => it.id);
  const { data } = useOpenBirdingHotspotLookup(canEdit ? savedIds : []);
  const hasSynced = React.useRef<string | undefined>(undefined);

  const syncMutation = useTripMutation<HotspotSyncInput>({
    url: `/trips/${trip?._id}/hotspots/sync`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((h) => {
        const u = input.updates.find((it) => it.id === h.id);
        if (!u) return h;
        return {
          ...h,
          ...(u.species !== undefined ? { species: u.species } : {}),
          ...(u.checklists !== undefined ? { checklists: u.checklists } : {}),
          ...(u.lat !== undefined ? { lat: u.lat } : {}),
          ...(u.lng !== undefined ? { lng: u.lng } : {}),
          ...(u.name !== undefined ? { name: u.name } : {}),
          deletedAt: u.deleted ? h.deletedAt || new Date() : undefined,
        };
      }),
    }),
  });

  React.useEffect(() => {
    if (!canEdit || !data || !trip?._id || !trip.hotspots?.length) return;
    const syncKey = `${trip._id}:${trip.hotspots.map((it) => it.id).sort().join(",")}`;
    if (hasSynced.current === syncKey) return;
    hasSynced.current = syncKey;

    const liveById = new Map(data.items.map((it) => [it.id, it]));
    const updates: HotspotSyncUpdate[] = trip.hotspots.flatMap((saved) => {
      const live = liveById.get(saved.id);
      if (!live) return saved.deletedAt ? [] : [{ id: saved.id, deleted: true }];
      const changes: Partial<HotspotSyncUpdate> = {};
      if (!saved.originalName && live.name && live.name !== saved.name) changes.name = live.name;
      if (live.numSpecies != null && live.numSpecies !== saved.species) changes.species = live.numSpecies;
      if (live.numChecklists != null && live.numChecklists !== saved.checklists) changes.checklists = live.numChecklists;
      if (Number.isFinite(live.lat) && live.lat !== saved.lat) changes.lat = live.lat;
      if (Number.isFinite(live.lng) && live.lng !== saved.lng) changes.lng = live.lng;
      const hasChanges = Object.keys(changes).length > 0 || !!saved.deletedAt;
      return hasChanges ? [{ id: saved.id, deleted: false, ...changes }] : [];
    });
    if (updates.length === 0) return;
    syncMutation.mutate({ updates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, data, trip?._id, trip?.hotspots]);
}
