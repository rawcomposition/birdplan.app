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
  if (!pending) throw new HTTPException(404, { message: "This invite no longer exists." });

  const existing = await Participant.findOne({ tripId: pending.tripId, uid: session.uid, status: "active" }).lean();
  if (existing) {
    if (existing._id !== pending._id) await Participant.deleteOne({ _id: pending._id });
    return c.json({ tripId: pending.tripId });
  }

  if (pending.uid && pending.uid !== session.uid) {
    throw new HTTPException(409, { message: "This invite has already been accepted." });
  }

  const profile = await Profile.findOne({ uid: session.uid }).lean();
  const name = profile?.name || session.name || (await auth?.getUser(session.uid))?.displayName || pending.name;

  const result = await Participant.updateOne(
    { _id: id, status: "pending", uid: { $exists: false } },
    { $set: { status: "active", uid: session.uid, name } }
  );
  if (result.matchedCount === 0) {
    throw new HTTPException(409, { message: "This invite has already been accepted." });
  }

  return c.json({ tripId: pending.tripId });
});

export default participants;
