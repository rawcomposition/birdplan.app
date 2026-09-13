import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, HiddenHotspot, SavedHotspot } from "lib/db.js";

const hiddenHotspots = new Hono();

const getHotspotId = (raw: string | undefined) => {
  const hotspotId = raw?.trim();
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });
  return hotspotId;
};

hiddenHotspots.get("/", async (c) => {
  const session = await authenticate(c);
  await connect();
  const rows = await HiddenHotspot.find({ userId: session.userId }).select("hotspotId").lean();
  return c.json(rows.map((it) => it.hotspotId));
});

hiddenHotspots.put("/:hotspotId", async (c) => {
  const session = await authenticate(c);
  const hotspotId = getHotspotId(c.req.param("hotspotId"));
  await connect();
  await Promise.all([
    HiddenHotspot.updateOne(
      { userId: session.userId, hotspotId },
      { $setOnInsert: { userId: session.userId, hotspotId } },
      { upsert: true },
    ),
    SavedHotspot.updateOne({ userId: session.userId, hotspotId, notes: { $nin: [null, ""] } }, { $set: { listIds: [] } }),
    SavedHotspot.deleteOne({ userId: session.userId, hotspotId, notes: { $in: [null, ""] } }),
  ]);
  return c.json({});
});

hiddenHotspots.delete("/:hotspotId", async (c) => {
  const session = await authenticate(c);
  const hotspotId = getHotspotId(c.req.param("hotspotId"));
  await connect();
  await HiddenHotspot.deleteOne({ userId: session.userId, hotspotId });
  return c.json({});
});

export default hiddenHotspots;
