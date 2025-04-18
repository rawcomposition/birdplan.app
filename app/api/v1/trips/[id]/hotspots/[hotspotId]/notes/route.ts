import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string; hotspotId: string }> };
type Body = { notes: string };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: Body = await request.json();

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id, "hotspots.id": hotspotId }, { $set: { "hotspots.$.notes": data.notes } });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error saving notes", 500);
  }
}
