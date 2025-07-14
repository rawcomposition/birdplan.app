import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile, Trip, TargetList, Invite } from "lib/db.js";
import { HTTPException } from "hono/http-exception";

const account = new Hono();

account.delete("/", async (c) => {
  const session = await authenticate(c);

  const uid = session.user.id;

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

  return c.json({});
});

account.post("/update-email", async (c) => {
  const session = await authenticate(c);
  const { email } = await c.req.json<{ email: string }>();
  if (!email) throw new HTTPException(400, { message: "Email is required" });

  await Profile.updateOne({ uid: session.user.id }, { email });
  return c.json({ message: "Email updated successfully" });
});

export default account;
