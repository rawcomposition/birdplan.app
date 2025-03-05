import { authenticate, APIError } from "lib/api";
import { connect, Trip, TargetList } from "lib/db";

type ParamsT = { id: string; markerId: string };

export async function DELETE(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, markerId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Promise.all([
      Trip.updateOne({ _id: id }, { $pull: { markers: { id: markerId } } }),
      TargetList.deleteMany({ tripId: id, markerId }),
    ]);
    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error removing marker", 500);
  }
}
