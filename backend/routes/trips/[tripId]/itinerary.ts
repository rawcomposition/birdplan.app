import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";
import { isTripEditor } from "lib/participants.js";
import { updateDayTravelTimes, moveLocation, densifyItinerary } from "lib/itinerary.js";
import type {
  ItineraryNotesInput,
  MoveLocationInput,
  ReorderLocationsInput,
  RemoveLocationInput,
  AddLocationInput,
  CalcTravelTimeInput,
} from "@birdplan/shared";

const itinerary = new Hono();

itinerary.patch("/:dayId/move-location", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<MoveLocationInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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

itinerary.patch("/:dayId/reorder-locations", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<ReorderLocationsInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const day = trip.itinerary?.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const currentIds = (day.locations || []).map((it) => it.id);
  const isSameSet =
    data.ids?.length === currentIds.length && currentIds.every((id) => data.ids.includes(id));
  if (!isSameSet) throw new HTTPException(400, { message: "ids must match the day's locations" });

  const updatedDay = {
    ...day,
    locations: data.ids.map((id) => day.locations.find((it) => it.id === id)!),
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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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

  const { notes, dayIds } = await c.req.json<ItineraryNotesInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const itinerary = densifyItinerary(trip.itinerary, dayIds);
  const day = itinerary.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedItinerary = itinerary.map((it) => (it.id === dayId ? { ...it, notes } : it));
  await Trip.updateOne({ _id: tripId }, { $set: { itinerary: updatedItinerary } });

  return c.json({ itinerary: updatedItinerary });
});

itinerary.post("/:dayId/add-location", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const { dayIds, ...location } = await c.req.json<AddLocationInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const itinerary = densifyItinerary(trip.itinerary, dayIds);
  const day = itinerary.find((it) => it.id === dayId);
  if (!day) throw new HTTPException(404, { message: "Day not found" });

  const updatedDay = await updateDayTravelTimes(
    { ...trip, itinerary } as any,
    {
      ...day,
      locations: [...(day.locations || []), location],
    } as any
  );

  const updatedItinerary = itinerary.map((it) => (it.id === dayId ? updatedDay : it));
  await Trip.updateOne({ _id: tripId }, { $set: { itinerary: updatedItinerary } });

  return c.json({ itinerary: updatedItinerary });
});

itinerary.patch("/:dayId/calc-travel-time", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const dayId = c.req.param("dayId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!dayId) throw new HTTPException(400, { message: "Day ID is required" });

  const data = await c.req.json<CalcTravelTimeInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
