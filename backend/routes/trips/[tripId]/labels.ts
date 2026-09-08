import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, parseClientId } from "lib/utils.js";
import { Trip } from "lib/db.js";
import { loadEditableTrip } from "lib/participants.js";
import { parseLabelInput } from "lib/labels.js";
import type { LabelInput, LabelCreateInput, TripLabel } from "@birdplan/shared";

const labels = new Hono();

labels.post("/", async (c) => {
  const session = await authenticate(c);
  const data = await c.req.json<LabelCreateInput>();
  const label: TripLabel = { _id: parseClientId(data._id), ...parseLabelInput(data) };
  const trip = await loadEditableTrip(c.req.param("tripId"), session.userId);
  if (trip.labels?.some((it) => it._id === label._id)) throw new HTTPException(409, { message: "Label already exists" });
  await Trip.updateOne({ _id: trip._id }, { $push: { labels: label } });
  return c.json(label);
});

labels.patch("/:labelId", async (c) => {
  const session = await authenticate(c);
  const labelId = c.req.param("labelId");
  const input = parseLabelInput(await c.req.json<LabelInput>());
  const trip = await loadEditableTrip(c.req.param("tripId"), session.userId);
  const result = await Trip.updateOne(
    { _id: trip._id, "labels._id": labelId },
    { $set: { "labels.$.name": input.name, "labels.$.color": input.color } }
  );
  if (result.matchedCount === 0) throw new HTTPException(404, { message: "Label not found" });
  return c.json({});
});

labels.delete("/:labelId", async (c) => {
  const session = await authenticate(c);
  const labelId = c.req.param("labelId");
  const trip = await loadEditableTrip(c.req.param("tripId"), session.userId);
  if (!trip.labels?.some((it) => it._id === labelId)) throw new HTTPException(404, { message: "Label not found" });
  await Trip.updateOne(
    { _id: trip._id },
    { $pull: { labels: { _id: labelId }, "hotspots.$[].labelIds": labelId } }
  );
  return c.json({});
});

export default labels;
