import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string; dayId: string }> };
type Body = { id: string };

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

    await Trip.updateOne(
      { _id: id, "itinerary.id": dayId, "itinerary.locations.id": data.id },
      {
        $set: {
          "itinerary.$[day].locations.$[loc].travel.isDeleted": true,
        },
      },
      {
        arrayFilters: [{ "day.id": dayId }, { "loc.id": data.id }],
      }
    );

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error removing travel time", 500);
  }
}
