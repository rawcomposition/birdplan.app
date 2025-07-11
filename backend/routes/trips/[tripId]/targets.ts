import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip, TargetList } from "lib/db.js";
import type { TargetListInput, TargetStarInput, TargetNotesInput } from "@birdplan/shared";
import { TargetListType } from "@birdplan/shared";

const targets = new Hono();

targets.get("/", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const [trip, targetList] = await Promise.all([
    Trip.findById(tripId),
    TargetList.findOne({ type: TargetListType.trip, tripId }).sort({ createdAt: -1 }),
  ]);

  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid)))
    throw new HTTPException(403, { message: "Forbidden" });

  return c.json(targetList || null);
});

targets.patch("/", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetListInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const targetList = await TargetList.findOneAndUpdate(
    { type: TargetListType.trip, tripId },
    {
      ...data,
      type: TargetListType.trip,
      tripId,
    },
    { upsert: true, new: true }
  );

  return c.json({ id: targetList._id });
});

targets.patch("/add-star", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetStarInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $addToSet: { targetStars: data.code } });

  return c.json({});
});

targets.patch("/remove-star", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetStarInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $pull: { targetStars: data.code } });

  return c.json({});
});

targets.patch("/set-notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetNotesInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $set: { [`targetNotes.${data.code}`]: data.notes } });

  return c.json({});
});

export default targets;
