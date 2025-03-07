import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip } from "lib/db";

type ParamsT = { id: string };

export async function GET(request: Request, { params }: { params: ParamsT }) {
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
    if (!invites) return APIError("Invites not found", 404);

    return Response.json(invites);
  } catch (error: any) {
    return APIError(error?.message || "Error loading invites", 500);
  }
}
