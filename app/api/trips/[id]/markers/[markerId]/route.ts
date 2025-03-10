import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string; markerId: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, markerId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id }, { $pull: { markers: { id: markerId } } });

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error removing marker", 500);
  }
}
