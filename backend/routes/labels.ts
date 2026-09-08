import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, SavedHotspot, Label } from "lib/db.js";
import { LABEL_COLORS } from "@birdplan/shared";
import type { LabelInput, LabelColor } from "@birdplan/shared";

const labels = new Hono();

const parseInput = (data: LabelInput) => {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) throw new HTTPException(400, { message: "Name is required" });
  if (name.length > 50) throw new HTTPException(400, { message: "Name is too long" });
  if (!LABEL_COLORS.includes(data.color as LabelColor)) throw new HTTPException(400, { message: "Color is required" });
  return { name, color: data.color };
};

labels.get("/", async (c) => {
  const session = await authenticate(c);
  await connect();
  const rows = await Label.find({ userId: session.userId }).sort({ createdAt: 1 }).lean();
  return c.json(rows);
});

labels.post("/", async (c) => {
  const session = await authenticate(c);
  const input = parseInput(await c.req.json<LabelInput>());
  await connect();
  const row = await Label.create({ userId: session.userId, ...input });
  return c.json(row.toObject());
});

labels.patch("/:id", async (c) => {
  const session = await authenticate(c);
  const id = c.req.param("id");
  const input = parseInput(await c.req.json<LabelInput>());
  await connect();
  const result = await Label.updateOne({ _id: id, userId: session.userId }, { $set: input });
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "Label not found" });
  return c.json({});
});

labels.delete("/:id", async (c) => {
  const session = await authenticate(c);
  const id = c.req.param("id");
  await connect();
  const result = await Label.deleteOne({ _id: id, userId: session.userId });
  if (result.deletedCount === 0) throw new HTTPException(404, { message: "Label not found" });
  await SavedHotspot.updateMany({ userId: session.userId, labelIds: id }, { $pull: { labelIds: id } });
  await SavedHotspot.deleteMany({ userId: session.userId, listIds: { $size: 0 }, labelIds: { $size: 0 } });
  return c.json({});
});

export default labels;
