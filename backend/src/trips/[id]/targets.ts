import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip, TargetList } from "lib/db.js";
import type { TargetListInput, TargetStarInput, TargetNotesInput } from "shared/types.js";
import { TargetListType } from "shared/enums.js";

const targets = new Hono();

targets.get("/", async (c) => {
  const session = await authenticate(c);

  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const [trip, targetList] = await Promise.all([
    Trip.findById(id),
    TargetList.findOne({ type: TargetListType.trip, tripId: id }).sort({ createdAt: -1 }),
  ]);

  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid)))
    throw new HTTPException(403, { message: "Forbidden" });

  return c.json(targetList || null);
});

targets.patch("/", async (c) => {
  const session = await authenticate(c);

  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetListInput>();

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const targetList = await TargetList.findOneAndUpdate(
    { type: TargetListType.trip, tripId: id },
    {
      ...data,
      type: TargetListType.trip,
      tripId: id,
    },
    { upsert: true, new: true }
  );

  return c.json({ id: targetList._id });
});

targets.patch("/add-star", async (c) => {
  const session = await authenticate(c);

  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetStarInput>();

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: id }, { $addToSet: { targetStars: data.code } });

  return c.json({});
});

targets.patch("/remove-star", async (c) => {
  const session = await authenticate(c);

  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetStarInput>();

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: id }, { $pull: { targetStars: data.code } });

  return c.json({});
});

targets.patch("/set-notes", async (c) => {
  const session = await authenticate(c);

  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetNotesInput>();

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: id }, { $set: { [`targetNotes.${data.code}`]: data.notes } });

  return c.json({});
});

export default targets;
