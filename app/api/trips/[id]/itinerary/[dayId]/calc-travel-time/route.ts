import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { updateDayTravelTimes } from "lib/itinerary";

type ParamsT = { id: string; dayId: string };
type BodyT = { id: string; method: "walking" | "driving" | "cycling" };

export async function PATCH(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, dayId } = await params;
    const data: BodyT = await request.json();
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
      locations: day.locations.map((loc) =>
        loc.id === data.id
          ? { ...loc, travel: { ...loc.travel, method: data.method, time: 0, distance: 0, locationId: "" } }
          : loc
      ),
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
  } catch (error: any) {
    return APIError(error?.message || "Error calculating travel time", 500);
  }
}
