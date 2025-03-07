import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string };
type BodyT = { code: string; notes: string };

export async function PATCH(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: BodyT = await request.json();

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id }, { $set: { targetNotes: { [data.code]: data.notes } } });

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error adding star", 500);
  }
}
