import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { connect, Participant, Profile } from "lib/db.js";
import { auth } from "lib/firebaseAdmin.js";
import { authenticate } from "../lib/utils.js";

const participants = new Hono();

participants.patch("/:id/accept", async (c) => {
  const session = await authenticate(c);
  if (!session?.uid) throw new HTTPException(401, { message: "Unauthorized" });

  const id: string = c.req.param("id");

  await connect();
  const pending = await Participant.findById(id).lean();
  if (!pending) throw new HTTPException(404, { message: "Invite not found" });

  const existing = await Participant.findOne({ tripId: pending.tripId, uid: session.uid, status: "active" }).lean();
  if (existing) {
    if (existing._id !== pending._id) await Participant.deleteOne({ _id: pending._id });
    return c.json({ tripId: pending.tripId });
  }

  const profile = await Profile.findOne({ uid: session.uid }).lean();
  const name = profile?.name || session.name || (await auth?.getUser(session.uid))?.displayName || pending.name;

  await Participant.updateOne(
    { _id: id },
    { $set: { status: "active", uid: session.uid, name } }
  );

  return c.json({ tripId: pending.tripId });
});

export default participants;
