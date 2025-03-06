import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string; markerId: string };
type BodyT = { notes: string };

export async function PUT(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, markerId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: BodyT = await request.json();

    await connect();
    const trip = await Trip.findById(id);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id, "markers.id": markerId }, { $set: { "markers.$.notes": data.notes } });

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error saving notes", 500);
  }
}
