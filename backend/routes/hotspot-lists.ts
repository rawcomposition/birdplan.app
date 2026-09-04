import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, SavedHotspot, HotspotList } from "lib/db.js";
import type { HotspotListInput } from "@birdplan/shared";

const hotspotLists = new Hono();

const parseName = (data: HotspotListInput) => {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) throw new HTTPException(400, { message: "Name is required" });
  if (name.length > 100) throw new HTTPException(400, { message: "Name is too long" });
  return name;
};

hotspotLists.get("/", async (c) => {
  const session = await authenticate(c);
  await connect();
  const rows = await HotspotList.find({ userId: session.userId }).sort({ createdAt: 1 }).lean();
  return c.json(rows);
});

hotspotLists.post("/", async (c) => {
  const session = await authenticate(c);
  const name = parseName(await c.req.json<HotspotListInput>());
  await connect();
  const row = await HotspotList.create({ userId: session.userId, name });
  return c.json(row.toObject());
});

hotspotLists.patch("/:id", async (c) => {
  const session = await authenticate(c);
  const id = c.req.param("id");
  const name = parseName(await c.req.json<HotspotListInput>());
  await connect();
  const result = await HotspotList.updateOne({ _id: id, userId: session.userId }, { $set: { name } });
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "List not found" });
  return c.json({});
});

hotspotLists.delete("/:id", async (c) => {
  const session = await authenticate(c);
  const id = c.req.param("id");
  await connect();
  const result = await HotspotList.deleteOne({
    _id: id,
    userId: session.userId,
  });
  if (result.deletedCount === 0) throw new HTTPException(404, { message: "List not found" });
  await SavedHotspot.deleteMany({ userId: session.userId, listIds: [id] });
  await SavedHotspot.updateMany({ userId: session.userId, listIds: id }, { $pull: { listIds: id } });
  return c.json({});
});

export default hotspotLists;
