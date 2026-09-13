import React from "react";
import { HotspotSyncInput, HotspotSyncUpdate } from "@birdplan/shared";
import useSavedHotspots from "hooks/useSavedHotspots";
import useSavedHotspotMutation from "hooks/useSavedHotspotMutation";
import useOpenBirdingHotspotLookup from "hooks/useOpenBirdingHotspotLookup";

export default function useSyncSavedHotspots() {
  const { savedHotspots } = useSavedHotspots();
  const ids = savedHotspots.map((it) => it.hotspotId);
  const { data } = useOpenBirdingHotspotLookup(ids);
  const hasSynced = React.useRef(false);

  const syncMutation = useSavedHotspotMutation<HotspotSyncInput>({
    url: "/saved-hotspots/sync",
    method: "PATCH",
    updateCache: (old, input) =>
      old.map((row) => {
        const u = input.updates.find((it) => it.id === row.hotspotId);
        if (!u) return row;
        return {
          ...row,
          ...(u.lat !== undefined ? { lat: u.lat } : {}),
          ...(u.lng !== undefined ? { lng: u.lng } : {}),
          ...(u.species !== undefined ? { species: u.species } : {}),
          ...(u.name !== undefined ? { name: u.name } : {}),
          deletedAt: u.deleted ? row.deletedAt || new Date() : undefined,
        };
      }),
  });

  React.useEffect(() => {
    if (!data || hasSynced.current) return;
    hasSynced.current = true;

    const updates: HotspotSyncUpdate[] = savedHotspots.flatMap((saved) => {
      const live = data.items.find((it) => it.id === saved.hotspotId);
      if (!live) return saved.deletedAt ? [] : [{ id: saved.hotspotId, deleted: true }];
      const changes: Partial<HotspotSyncUpdate> = {};
      if (live.name && live.name !== saved.name) changes.name = live.name;
      if (live.lat !== saved.lat) changes.lat = live.lat;
      if (live.lng !== saved.lng) changes.lng = live.lng;
      if (live.numSpecies != null && live.numSpecies !== saved.species) changes.species = live.numSpecies;
      const hasChanges = Object.keys(changes).length > 0 || !!saved.deletedAt;
      return hasChanges ? [{ id: saved.hotspotId, deleted: false, ...changes }] : [];
    });
    if (updates.length === 0) return;
    syncMutation.mutate({ updates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, savedHotspots]);

}
