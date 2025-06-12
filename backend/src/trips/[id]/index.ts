import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip, TargetList, Invite } from "lib/db.js";
import type { TripUpdateInput } from "shared/types.js";
import { TargetListType } from "shared/enums.js";

const trip = new Hono();

trip.get("/", async (c) => {
  const session = await authenticate(c);
  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  return c.json(trip);
});

trip.patch("/", async (c) => {
  const session = await authenticate(c);

  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const data = await c.req.json<TripUpdateInput>();

  const hasChangedDates = data.startMonth !== trip.startMonth || data.endMonth !== trip.endMonth;
  const newData = { name: data.name, startMonth: data.startMonth, endMonth: data.endMonth };

  if (hasChangedDates) {
    await Promise.all([
      Trip.updateOne(
        { _id: id },
        { ...newData, hotspots: trip.hotspots?.map(({ targetsId, ...hotspot }) => hotspot) || [] }
      ),
      TargetList.deleteMany({ tripId: id, type: TargetListType.hotspot }),
    ]);
  } else {
    await Trip.updateOne({ _id: id }, newData);
  }

  return c.json({ hasChangedDates });
});

trip.delete("/", async (c) => {
  const session = await authenticate(c);

  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (trip.ownerId !== session.uid) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Promise.all([
    Trip.deleteOne({ _id: id }),
    TargetList.deleteMany({ tripId: id }),
    Invite.deleteMany({ tripId: id }),
  ]);

  return c.json({});
});

export default trip;
