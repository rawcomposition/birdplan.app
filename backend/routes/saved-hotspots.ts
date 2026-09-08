import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AnyBulkWriteOperation, UpdateQuery } from "mongoose";
import { authenticate } from "lib/utils.js";
import { connect, SavedHotspot, HotspotList, Label } from "lib/db.js";
import type {
  HotspotSyncInput,
  SavedHotspotInput,
  SavedHotspotLabelsInput,
  SavedHotspotListsInput,
  SavedHotspotNotesInput,
  SavedHotspot as SavedHotspotT,
} from "@birdplan/shared";

const savedHotspots = new Hono();

const DEFAULT_LIST_NAME = "Favorites";

const getDefaultListId = async (userId: string) => {
  const existing = await HotspotList.findOne({ userId }).sort({ createdAt: 1 }).lean();
  if (existing) return existing._id;
  const created = await HotspotList.create({ userId, name: DEFAULT_LIST_NAME });
  return created._id;
};

const getOwnedListIds = async (userId: string, listIds: unknown) => {
  if (!Array.isArray(listIds)) return null;
  const ids = [...new Set(listIds.filter((id): id is string => typeof id === "string" && !!id))];
  if (ids.length === 0) return [];
  const owned = await HotspotList.find({ userId, _id: { $in: ids } })
    .select("_id")
    .lean();
  const ownedIds = new Set(owned.map((it) => it._id));
  return ids.filter((id) => ownedIds.has(id));
};

const getOwnedLabelIds = async (userId: string, labelIds: unknown) => {
  if (!Array.isArray(labelIds)) return null;
  const ids = [...new Set(labelIds.filter((id): id is string => typeof id === "string" && !!id))];
  if (ids.length === 0) return [];
  const owned = await Label.find({ userId, _id: { $in: ids } })
    .select("_id")
    .lean();
  const ownedIds = new Set(owned.map((it) => it._id));
  return ids.filter((id) => ownedIds.has(id));
};

savedHotspots.get("/", async (c) => {
  const session = await authenticate(c);
  await connect();
  const rows = await SavedHotspot.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();
  return c.json(rows);
});

savedHotspots.post("/", async (c) => {
  const session = await authenticate(c);
  const data = await c.req.json<SavedHotspotInput>();

  const hotspotId = typeof data.hotspotId === "string" ? data.hotspotId.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });
  if (!name) throw new HTTPException(400, { message: "Name is required" });
  if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
    throw new HTTPException(400, { message: "Coordinates are required" });
  }

  await connect();
  const requestedListIds = await getOwnedListIds(session.userId, data.listIds);
  const listIds = requestedListIds?.length ? requestedListIds : [await getDefaultListId(session.userId)];
  const row = await SavedHotspot.findOneAndUpdate(
    { userId: session.userId, hotspotId },
    {
      $set: {
        name,
        lat: data.lat,
        lng: data.lng,
        ...(requestedListIds ? { listIds } : {}),
      },
      $setOnInsert: requestedListIds ? {} : { listIds },
    },
    { upsert: true, new: true },
  ).lean();

  return c.json(row);
});

savedHotspots.patch("/sync", async (c) => {
  const session = await authenticate(c);
  const { updates } = await c.req.json<HotspotSyncInput>();
  if (!Array.isArray(updates) || updates.length === 0) return c.json({});

  await connect();
  const now = new Date();
  const ops: AnyBulkWriteOperation<SavedHotspotT>[] = updates.map((u) => {
    const $set: Record<string, unknown> = {};
    if (Number.isFinite(u.lat)) $set.lat = u.lat;
    if (Number.isFinite(u.lng)) $set.lng = u.lng;
    if (typeof u.name === "string" && u.name.length > 0) $set.name = u.name;
    const filter = u.deleted
      ? { userId: session.userId, hotspotId: u.id, deletedAt: null }
      : { userId: session.userId, hotspotId: u.id };
    const update: UpdateQuery<SavedHotspotT> = u.deleted
      ? { $set: { ...$set, deletedAt: now } }
      : { ...(Object.keys($set).length ? { $set } : {}), $unset: { deletedAt: true } };
    return { updateOne: { filter, update } };
  });
  await SavedHotspot.bulkWrite(ops);
  return c.json({});
});

savedHotspots.delete("/:hotspotId", async (c) => {
  const session = await authenticate(c);
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  await SavedHotspot.deleteOne({ userId: session.userId, hotspotId });
  return c.json({});
});

savedHotspots.patch("/:hotspotId/notes", async (c) => {
  const session = await authenticate(c);
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<SavedHotspotNotesInput>();
  const notes = typeof data.notes === "string" ? data.notes : "";

  await connect();
  const result = await SavedHotspot.updateOne({ userId: session.userId, hotspotId }, { $set: { notes } });
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "Saved hotspot not found" });
  return c.json({});
});

savedHotspots.patch("/:hotspotId/lists", async (c) => {
  const session = await authenticate(c);
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<SavedHotspotListsInput>();
  await connect();
  const listIds = await getOwnedListIds(session.userId, data.listIds);
  if (!listIds) throw new HTTPException(400, { message: "List IDs are required" });

  const result = await SavedHotspot.updateOne({ userId: session.userId, hotspotId }, { $set: { listIds } });
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "Saved hotspot not found" });
  if (listIds.length === 0) {
    await SavedHotspot.deleteOne({ userId: session.userId, hotspotId, labelIds: { $size: 0 } });
  }
  return c.json({});
});

savedHotspots.put("/:hotspotId/labels", async (c) => {
  const session = await authenticate(c);
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<SavedHotspotLabelsInput>();
  await connect();
  const labelIds = await getOwnedLabelIds(session.userId, data.labelIds);
  if (!labelIds) throw new HTTPException(400, { message: "Label IDs are required" });

  const existing = await SavedHotspot.findOne({ userId: session.userId, hotspotId }).lean();
  if (!existing) {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) throw new HTTPException(400, { message: "Name is required" });
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
      throw new HTTPException(400, { message: "Coordinates are required" });
    }
    if (labelIds.length === 0) return c.json({});
    const row = await SavedHotspot.create({
      userId: session.userId,
      hotspotId,
      name,
      lat: data.lat,
      lng: data.lng,
      listIds: [],
      labelIds,
    });
    return c.json(row.toObject());
  }

  if (labelIds.length === 0 && existing.listIds.length === 0) {
    await SavedHotspot.deleteOne({ _id: existing._id });
    return c.json({});
  }
  await SavedHotspot.updateOne({ _id: existing._id }, { $set: { labelIds } });
  return c.json({});
});

export default savedHotspots;
