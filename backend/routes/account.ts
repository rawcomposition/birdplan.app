import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile, Trip, Participant } from "lib/db.js";
import { auth as firebaseAuth } from "lib/firebaseAdmin.js";
import { HTTPException } from "hono/http-exception";

const account = new Hono();

account.delete("/", async (c) => {
  const session = await authenticate(c);

  const uid = session.uid;

  await connect();

  const tripIds = await Trip.distinct("_id", { ownerId: uid });

  await Promise.all([
    Profile.deleteOne({ uid }),
    Participant.deleteMany({ uid }),
    Participant.deleteMany({ tripId: { $in: tripIds } }),
    Trip.deleteMany({ ownerId: uid }),
  ]);

  await firebaseAuth?.deleteUser(uid);

  return c.json({});
});

account.post("/update-email", async (c) => {
  const session = await authenticate(c);
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = rawEmail?.trim().toLowerCase();
  if (!email) throw new HTTPException(400, { message: "Email is required" });

  const user = await firebaseAuth?.getUser(session.uid);
  if (!user) throw new HTTPException(404, { message: "User not found" });

  if (!user.providerData.some((provider) => provider.providerId === "password")) {
    throw new HTTPException(400, {
      message: "Cannot update email for accounts using external authentication providers",
    });
  }

  await Promise.all([
    firebaseAuth?.updateUser(user.uid, { email }),
    Profile.updateOne({ uid: session.uid }, { email }),
  ]);
  return c.json({ message: "Email updated successfully" });
});

export default account;
