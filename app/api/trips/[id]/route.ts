import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string };

export async function GET(request: Request, { params }: { params: ParamsT }) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);
    return Response.json(trip);
  } catch (error: any) {
    return APIError(error?.message || "Error loading trip", 500);
  }
}
