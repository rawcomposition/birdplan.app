import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, SavedHotspot, HotspotList } from "lib/db.js";
import type { SavedHotspotInput, SavedHotspotListsInput, SavedHotspotNotesInput } from "@birdplan/shared";

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
        species: Number.isFinite(data.species) ? data.species : undefined,
        checklists: Number.isFinite(data.checklists) ? data.checklists : undefined,
        ...(requestedListIds ? { listIds } : {}),
      },
      $setOnInsert: requestedListIds ? {} : { listIds },
    },
    { upsert: true, new: true },
  ).lean();

  return c.json(row);
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

  if (listIds.length === 0) {
    await SavedHotspot.deleteOne({ userId: session.userId, hotspotId });
    return c.json({});
  }

  const result = await SavedHotspot.updateOne({ userId: session.userId, hotspotId }, { $set: { listIds } });
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "Saved hotspot not found" });
  return c.json({});
});

export default savedHotspots;
