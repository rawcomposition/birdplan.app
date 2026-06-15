import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { connect, Participant } from "lib/db.js";
import { authenticate } from "../lib/utils.js";

const participants = new Hono();

// Accept a pending invite (the participant `_id` is the link token). Idempotent: if the user is
// already an active participant on the trip, drop this redundant pending row instead of creating
// a duplicate. Mirrors the old top-level /invites/:id/accept.
participants.patch("/:id/accept", async (c) => {
  const session = await authenticate(c);
  if (!session?.uid) throw new HTTPException(401, { message: "Unauthorized" });

  const id: string = c.req.param("id");

  await connect();
  const pending = await Participant.findById(id).lean();
  if (!pending) throw new HTTPException(404, { message: "Invite not found" });

  // Already a member? Remove this redundant pending row and return the trip.
  const existing = await Participant.findOne({ tripId: pending.tripId, uid: session.uid, status: "active" }).lean();
  if (existing) {
    if (existing._id !== pending._id) await Participant.deleteOne({ _id: pending._id });
    return c.json({ tripId: pending.tripId });
  }

  await Participant.updateOne(
    { _id: id },
    { $set: { status: "active", uid: session.uid, name: session.name } }
  );

  return c.json({ tripId: pending.tripId });
});

export default participants;
