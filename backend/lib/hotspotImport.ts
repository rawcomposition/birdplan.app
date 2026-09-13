import { SavedHotspot } from "lib/db.js";
import { lookupHotspots } from "lib/openbirding.js";
import type { Hotspot, HotspotInput } from "@birdplan/shared";

type Options = {
  userId: string;
  hotspotIds: string[];
  existingHotspotIds: string[];
  includeNotes: boolean;
};

export const buildImportedHotspots = async ({
  userId,
  hotspotIds,
  existingHotspotIds,
  includeNotes,
}: Options): Promise<Hotspot[]> => {
  const existing = new Set(existingHotspotIds);
  const candidateIds = [...new Set(hotspotIds.filter((id): id is string => typeof id === "string" && !!id))].filter(
    (id) => !existing.has(id),
  );
  const lookup = await lookupHotspots(candidateIds);
  const incoming: HotspotInput[] = lookup.map((it) => ({
    id: it.id,
    name: it.name,
    lat: it.lat,
    lng: it.lng,
    species: it.numSpecies ?? 0,
    checklists: it.numChecklists ?? 0,
  }));
  if (incoming.length === 0 || !includeNotes) return incoming;

  const savedRows = await SavedHotspot.find({ userId, hotspotId: { $in: incoming.map((it) => it.id) } }).lean();
  const savedById = new Map(savedRows.map((it) => [it.hotspotId, it]));

  return incoming.map((it) => {
    const notes = savedById.get(it.id)?.notes;
    return notes ? { ...it, notes } : it;
  });
};

export const listHotspotIds = async (userId: string, listId: string): Promise<string[]> => {
  const rows = await SavedHotspot.find({ userId, listIds: listId, deletedAt: { $exists: false } })
    .select("hotspotId")
    .lean();
  return rows.map((it) => it.hotspotId);
};
