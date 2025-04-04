import { authenticate, APIError } from "lib/api";
import { connect, Profile, Trip, TargetList, Invite } from "lib/db";
import { auth as firebaseAuth } from "lib/firebaseAdmin";

export async function DELETE(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    const uid = session.uid;

    await connect();

    const trips = await Trip.find({ ownerId: uid }).lean();
    const tripIds = trips.map((trip) => trip._id);

    await Promise.all([
      Profile.deleteOne({ uid }),
      TargetList.deleteMany({ tripId: { $in: tripIds } }),
      Invite.deleteMany({ tripId: { $in: tripIds } }),
      Invite.deleteMany({ uid }),
      Trip.deleteMany({ ownerId: uid }),
      Trip.updateMany({ userIds: uid, ownerId: { $ne: uid } }, { $pull: { userIds: uid } }),
    ]);

    await firebaseAuth.deleteUser(uid);

    return Response.json({});
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    return APIError(error instanceof Error ? error.message : "Error deleting account", 500);
  }
}
