import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, parseClientId } from "lib/utils.js";
import { connect, SavedHotspot, Label } from "lib/db.js";
import { parseLabelInput } from "lib/labels.js";
import type { LabelInput, LabelCreateInput } from "@birdplan/shared";

const labels = new Hono();

labels.get("/", async (c) => {
  const session = await authenticate(c);
  await connect();
  const rows = await Label.find({ userId: session.userId }).sort({ createdAt: 1 }).lean();
  return c.json(rows);
});

labels.post("/", async (c) => {
  const session = await authenticate(c);
  const data = await c.req.json<LabelCreateInput>();
  const _id = parseClientId(data._id);
  const input = parseLabelInput(data);
  await connect();
  const row = await Label.create({ _id, userId: session.userId, ...input });
  return c.json(row.toObject());
});

labels.patch("/:id", async (c) => {
  const session = await authenticate(c);
  const id = c.req.param("id");
  const input = parseLabelInput(await c.req.json<LabelInput>());
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
