import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip } from "lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const invite = await Invite.findById(id).lean();
    if (!invite) return APIError("Invite not found", 404);
    if (invite.accepted) return APIError("Invite already accepted", 400);

    await Promise.all([
      Invite.updateOne({ _id: id }, { accepted: true, name: session.name, uid: session.uid }),
      Trip.updateOne({ _id: invite.tripId }, { $addToSet: { userIds: session.uid } }),
    ]);

    return Response.json({ tripId: invite.tripId });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error accepting invite", 500);
  }
}
