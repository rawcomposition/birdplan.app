import { authenticate, APIError } from "lib/api";
import { connect, Trip, TargetList } from "lib/db";

type Params = { params: Promise<{ id: string; hotspotId: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Promise.all([
      Trip.updateOne({ _id: id }, { $pull: { hotspots: { id: hotspotId } } }),
      TargetList.deleteMany({ tripId: id, hotspotId }),
    ]);
    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error removing hotspot", 500);
  }
}
