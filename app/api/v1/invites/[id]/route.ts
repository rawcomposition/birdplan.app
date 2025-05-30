import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip } from "lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const invite = await Invite.findById(id).lean();
    if (!invite) return APIError("Invite not found", 404);
    const trip = await Trip.findById(invite.tripId).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    await Promise.all([
      Invite.deleteOne({ _id: id }),
      invite.uid ? Trip.updateOne({ _id: invite.tripId }, { $pull: { userIds: invite.uid } }) : null,
    ]);

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error deleting invite", 500);
  }
}
