import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    if (trip.hotspots.find((it) => it.id === data.id)) return Response.json({});

    await Trip.updateOne({ _id: id }, { $push: { hotspots: data } });
    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error adding hotspot", 500);
  }
}
