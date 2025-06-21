import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";
import { updateDayTravelTimes, moveLocation } from "lib/itinerary.js";
import type {
  ItineraryDayInput,
  ItineraryNotesInput,
  MoveLocationInput,
  RemoveLocationInput,
  AddLocationInput,
  CalcTravelTimeInput,
} from "@birdplan/shared";

const itinerary = new Hono();

itinerary.post("/", async (c) => {
  const data = await c.req.json<ItineraryDayInput>();
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  if (trip.itinerary?.find((it) => it.id === data.id)) return c.json({});

  await Trip.updateOne({ _id: tripId }, { $push: { itinerary: data } });
  return c.json({});
});

itinerary.delete("/:dayId", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $pull: { itinerary: { id: dayId } } });

  return c.json({});
});

itinerary.patch("/:dayId/move-location", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<MoveLocationInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedDay = {
    ...day,
    locations: moveLocation(day.locations, data.id, data.direction),
  };

  const updatedDayWithTravel = await updateDayTravelTimes(trip as any, updatedDay as any);

  await Trip.updateOne(
    { _id: tripId, "itinerary.id": dayId },
    {
      $set: {
        "itinerary.$.locations": updatedDayWithTravel.locations || [],
      },
    }
  );

  return c.json({});
});

itinerary.patch("/:dayId/notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<ItineraryNotesInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId, "itinerary.id": dayId }, { $set: { "itinerary.$.notes": data.notes } });

  return c.json({});
});

itinerary.patch("/:dayId/remove-location", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<RemoveLocationInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedDay = await updateDayTravelTimes(
    trip as any,
    {
      ...day,
      locations: day.locations?.filter((it) => it.id !== data.id) || [],
    } as any
  );

  await Trip.updateOne(
    { _id: tripId, "itinerary.id": dayId },
    {
      $set: {
        "itinerary.$.locations": updatedDay.locations || [],
      },
    }
  );

  return c.json({});
});

itinerary.patch("/:dayId/remove-travel-time", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<RemoveLocationInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  await Trip.updateOne(
    { _id: tripId, "itinerary.id": dayId, "itinerary.locations.id": data.id },
    {
      $set: {
        "itinerary.$[day].locations.$[loc].travel.isDeleted": true,
      },
    },
    {
      arrayFilters: [{ "day.id": dayId }, { "loc.id": data.id }],
    }
  );

  return c.json({});
});

itinerary.patch("/:dayId/set-notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<ItineraryNotesInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId, "itinerary.id": dayId }, { $set: { "itinerary.$.notes": data.notes } });

  return c.json({});
});

itinerary.post("/:dayId/add-location", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<AddLocationInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedDay = await updateDayTravelTimes(
    trip as any,
    {
      ...day,
      locations: [...(day.locations || []), data],
    } as any
  );

  await Trip.updateOne(
    { _id: tripId, "itinerary.id": dayId },
    {
      $set: {
        "itinerary.$.locations": updatedDay.locations || [],
      },
    }
  );

  return c.json({});
});

itinerary.patch("/:dayId/calc-travel-time", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<CalcTravelTimeInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedDay = {
    ...day,
    locations: day.locations.map((loc) =>
      loc.id === data.id
        ? { ...loc, travel: { ...loc.travel, method: data.method, time: 0, distance: 0, locationId: "" } }
        : loc
    ),
  };

  const updatedDayWithTravel = await updateDayTravelTimes(trip, updatedDay);

  await Trip.updateOne(
    { _id: tripId, "itinerary.id": dayId },
    {
      $set: {
        "itinerary.$.locations": updatedDayWithTravel.locations || [],
      },
    }
  );

  return c.json({});
});

export default itinerary;
