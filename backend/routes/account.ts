import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile, Trip, TargetList, Invite } from "lib/db.js";
import { auth as firebaseAuth } from "lib/firebaseAdmin.js";
import { HTTPException } from "hono/http-exception";

const account = new Hono();

account.delete("/", async (c) => {
  const session = await authenticate(c);

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

  return c.json({});
});

account.post("/update-email", async (c) => {
  const session = await authenticate(c);
  const { email } = await c.req.json<{ email: string }>();
  if (!email) throw new HTTPException(400, { message: "Email is required" });

  const user = await firebaseAuth.getUser(session.uid);
  if (!user) throw new HTTPException(404, { message: "User not found" });

  if (!user.providerData.some((provider) => provider.providerId === "password")) {
    throw new HTTPException(400, {
      message: "Cannot update email for accounts using external authentication providers",
    });
  }

  await Promise.all([firebaseAuth.updateUser(user.uid, { email }), Profile.updateOne({ uid: session.uid }, { email })]);
  return c.json({ message: "Email updated successfully" });
});

export default account;
