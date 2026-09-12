import { nanoId } from "lib/utils.js";
import { SavedHotspot, Label } from "lib/db.js";
import { lookupHotspots } from "lib/openbirding.js";
import type { Hotspot, HotspotInput, TripLabel } from "@birdplan/shared";

type Options = {
  userId: string;
  hotspotIds: string[];
  existingHotspotIds: string[];
  existingLabels: TripLabel[];
  includeNotes: boolean;
  includeLabels: boolean;
};

export const buildImportedHotspots = async ({
  userId,
  hotspotIds,
  existingHotspotIds,
  existingLabels,
  includeNotes,
  includeLabels,
}: Options): Promise<{ hotspots: Hotspot[]; newLabels: TripLabel[] }> => {
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
  if (incoming.length === 0) return { hotspots: [], newLabels: [] };

  const savedRows =
    includeNotes || includeLabels
      ? await SavedHotspot.find({ userId, hotspotId: { $in: incoming.map((it) => it.id) } }).lean()
      : [];
  const savedById = new Map(savedRows.map((it) => [it.hotspotId, it]));

  const newLabels: TripLabel[] = [];
  const tripLabelIdByUserLabelId = new Map<string, string>();
  if (includeLabels) {
    const userLabelIds = [...new Set(savedRows.flatMap((it) => it.labelIds || []))];
    const userLabels = userLabelIds.length ? await Label.find({ userId, _id: { $in: userLabelIds } }).lean() : [];
    const tripLabels = [...existingLabels];
    for (const userLabel of userLabels) {
      const match = tripLabels.find((it) => it.name.toLowerCase() === userLabel.name.toLowerCase());
      if (match) {
        tripLabelIdByUserLabelId.set(userLabel._id, match._id);
        continue;
      }
      const label: TripLabel = { _id: nanoId(), name: userLabel.name, color: userLabel.color };
      tripLabels.push(label);
      newLabels.push(label);
      tripLabelIdByUserLabelId.set(userLabel._id, label._id);
    }
  }

  const hotspots = incoming.map((it) => {
    const saved = savedById.get(it.id);
    const labelIds = (saved?.labelIds || [])
      .map((id) => tripLabelIdByUserLabelId.get(id))
      .filter((id): id is string => !!id);
    return {
      ...it,
      ...(includeNotes && saved?.notes ? { notes: saved.notes } : {}),
      ...(includeLabels && labelIds.length ? { labelIds } : {}),
    };
  });

  return { hotspots, newLabels };
};

export const listHotspotIds = async (userId: string, listId: string): Promise<string[]> => {
  const rows = await SavedHotspot.find({ userId, listIds: listId, deletedAt: { $exists: false } })
    .select("hotspotId")
    .lean();
  return rows.map((it) => it.hotspotId);
};
