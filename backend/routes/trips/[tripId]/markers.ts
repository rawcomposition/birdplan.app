import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";
import type { MarkerInput, MarkerNotesInput } from "@birdplan/shared";

const markers = new Hono();

markers.post("/", async (c) => {
  const data = await c.req.json<MarkerInput>();
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  if (trip.markers.find((it) => it.id === data.id)) return c.json({});

  await Trip.updateOne({ _id: tripId }, { $push: { markers: data } });
  return c.json({});
});

markers.delete("/:markerId", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const markerId = c.req.param("markerId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!markerId) throw new HTTPException(400, { message: "Marker ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $pull: { markers: { id: markerId } } });

  return c.json({});
});

markers.patch("/:markerId/notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const markerId = c.req.param("markerId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!markerId) throw new HTTPException(400, { message: "Marker ID is required" });

  const data = await c.req.json<MarkerNotesInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId, "markers.id": markerId }, { $set: { "markers.$.notes": data.notes } });

  return c.json({});
});

export default markers;
