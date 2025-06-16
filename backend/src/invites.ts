import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { connect, Invite, Trip } from "lib/db.js";
import { authenticate } from "./lib/utils.js";
import { sendInviteEmail } from "./lib/email.js";
import type { InviteInput } from "@birdplan/shared";

const invites = new Hono();

invites.post("/", async (c) => {
  const session = await authenticate(c);
  if (!session?.uid) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { email, tripId } = await c.req.json<InviteInput>();

  await connect();

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const invite = await Invite.create({
    email,
    tripId,
    ownerId: session.uid,
    accepted: false,
  });

  await sendInviteEmail({
    tripName: trip.name,
    fromName: session.name || "",
    email,
    url: `${process.env.NEXT_PUBLIC_URL}/accept/${invite._id}`,
  });

  return c.json({});
});

invites.delete("/:id", async (c) => {
  const session = await authenticate(c);
  if (!session?.uid) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const id: string = c.req.param("id");

  await connect();
  const invite = await Invite.findById(id).lean();
  if (!invite) {
    throw new HTTPException(404, { message: "Invite not found" });
  }
  const trip = await Trip.findById(invite.tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Promise.all([
    Invite.deleteOne({ _id: id }),
    invite.uid ? Trip.updateOne({ _id: invite.tripId }, { $pull: { userIds: invite.uid } }) : null,
  ]);

  return c.json({});
});

invites.patch("/:id/accept", async (c) => {
  const session = await authenticate(c);
  if (!session?.uid) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const id: string = c.req.param("id");

  await connect();
  const invite = await Invite.findById(id).lean();
  if (!invite) {
    throw new HTTPException(404, { message: "Invite not found" });
  }
  if (invite.accepted) {
    throw new HTTPException(400, { message: "Invite already accepted" });
  }

  await Promise.all([
    Invite.updateOne({ _id: id }, { accepted: true, name: session.name, uid: session.uid }),
    Trip.updateOne({ _id: invite.tripId }, { $addToSet: { userIds: session.uid } }),
  ]);

  return c.json({ tripId: invite.tripId });
});

export default invites;
