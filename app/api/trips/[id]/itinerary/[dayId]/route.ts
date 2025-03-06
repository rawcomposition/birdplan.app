import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string; dayId: string };

export async function DELETE(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, dayId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id }, { $pull: { itinerary: { id: dayId } } });

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error removing itinerary day", 500);
  }
}
