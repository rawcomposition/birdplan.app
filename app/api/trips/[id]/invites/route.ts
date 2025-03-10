import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip } from "lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const [trip, invites] = await Promise.all([
      Trip.findById(id),
      Invite.find({ tripId: id }, ["name", "email"]).sort({ createdAt: -1 }),
    ]);

    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    return Response.json(invites);
  } catch (error: any) {
    return APIError(error?.message || "Error loading invites", 500);
  }
}
