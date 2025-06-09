import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string }> };
type Body = { code: string };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: Body = await request.json();

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Trip.updateOne({ _id: id }, { $addToSet: { targetStars: data.code } });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error adding star", 500);
  }
}
