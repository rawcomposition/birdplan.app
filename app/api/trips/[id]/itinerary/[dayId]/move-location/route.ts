import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { updateDayTravelTimes, moveLocation } from "lib/itinerary";

type Params = { params: Promise<{ id: string; dayId: string }> };
type Body = { id: string; direction: "up" | "down" };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, dayId } = await params;
    const data: Body = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const day = trip.itinerary?.find((it) => it.id === dayId);
    if (!day) return APIError("Day not found", 404);

    const updatedDay = {
      ...day,
      locations: moveLocation(day.locations, data.id, data.direction),
    };

    const updatedDayWithTravel = await updateDayTravelTimes(trip, updatedDay);

    await Trip.updateOne(
      { _id: id, "itinerary.id": dayId },
      {
        $set: {
          "itinerary.$.locations": updatedDayWithTravel.locations || [],
        },
      }
    );

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error moving location", 500);
  }
}
