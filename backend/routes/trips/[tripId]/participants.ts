import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip, Participant, Profile } from "lib/db.js";
import { isTripEditor, participantEffectiveList } from "lib/participants.js";
import { sciNamesToCodes } from "lib/taxonomy.js";
import { sendInviteEmail } from "lib/email.js";
import type {
  AddParticipantInput,
  LifelistImportInput,
  ParticipantListMode,
  ParticipantView,
  AddToLifelistInput,
  UpdateParticipantInput,
} from "@birdplan/shared";

const participants = new Hono();

// Roster for the trip. Anyone who can view the trip sees it; email addresses are included only
// for editors/owner (a public viewer gets name/uid/count without the email).
participants.get("/", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });

  const isEditor = await isTripEditor(tripId, session?.uid);
  if (!trip.isPublic && !isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const roster = await Participant.find({ tripId }).sort({ createdAt: 1 }).lean();
  const uids = roster.map((p) => p.uid).filter((u): u is string => !!u);
  const profiles = uids.length ? await Profile.find({ uid: { $in: uids } }).lean() : [];
  const profilesByUid = new Map(profiles.map((p) => [p.uid, p]));

  const views: ParticipantView[] = roster.map((p) => ({
    _id: p._id,
    uid: p.uid,
    name: p.name,
    ...(isEditor ? { email: p.email } : {}),
    status: p.status,
    listMode: p.listMode,
    isOwner: p.isOwner,
    isMe: !!session?.uid && p.uid === session.uid,
    count: participantEffectiveList(p as any, profilesByUid as any).length,
    // A registered World user always "has a list" (their live global one). Everyone else only
    // has one once something's been uploaded (lifelistUpdatedAt set) — otherwise "No life list".
    hasList: p.status === "active" && p.listMode === "world" ? true : !!p.lifelistUpdatedAt,
  }));

  return c.json(views);
});

// Add a participant: an email invite (registered user) or a named-only person with an uploaded
// list. Editors only.
participants.post("/", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!(await isTripEditor(tripId, session.uid))) throw new HTTPException(403, { message: "Forbidden" });

  const body = await c.req.json<AddParticipantInput>();

  if (body.type === "named") {
    if (!body.name?.trim()) throw new HTTPException(400, { message: "Name is required" });
    // A life list is optional — without one the row shows "No life list" (lifelistUpdatedAt null).
    const codes = body.sciNames?.length ? await sciNamesToCodes(body.sciNames) : [];
    const participant = await Participant.create({
      tripId,
      name: body.name.trim(),
      status: "active",
      listMode: "custom",
      lifelist: codes,
      lifelistUpdatedAt: codes.length ? new Date() : null,
      isOwner: false,
    });
    return c.json({ id: participant._id });
  }

  // Email invite
  const email = body.email?.trim().toLowerCase();
  if (!email) throw new HTTPException(400, { message: "Email is required" });

  // No duplicate invites: reject if any participant on this trip already has this email.
  const dupEmail = await Participant.exists({ tripId, email });
  if (dupEmail) throw new HTTPException(400, { message: "That person has already been added to this trip" });

  // Upgrade a named-only person into the real user, in place, keeping their uploaded list.
  if (body.upgradeId) {
    const named = await Participant.findOne({ _id: body.upgradeId, tripId }).lean();
    if (!named || named.uid) throw new HTTPException(400, { message: "Cannot upgrade this participant" });
    await Participant.updateOne({ _id: body.upgradeId }, { $set: { email, status: "pending" } });
    await sendInviteEmail({
      tripName: trip.name,
      fromName: session.name || "",
      email,
      url: `${process.env.FRONTEND_URL}/accept/${body.upgradeId}`,
    });
    return c.json({ id: body.upgradeId });
  }

  // The inviter may pre-attach a list; the invitee can switch to World or replace it after
  // accepting. Without one the pending row stays "world"/empty and shows "No life list".
  const codes = body.sciNames?.length ? await sciNamesToCodes(body.sciNames) : [];
  const participant = await Participant.create({
    tripId,
    email,
    status: "pending",
    listMode: codes.length ? "custom" : "world",
    lifelist: codes,
    lifelistUpdatedAt: codes.length ? new Date() : null,
    isOwner: false,
  });

  await sendInviteEmail({
    tripName: trip.name,
    fromName: session.name || "",
    email,
    url: `${process.env.FRONTEND_URL}/accept/${participant._id}`,
  });

  return c.json({ id: participant._id });
});

// Rename a name-only participant. Editors only; registered users keep their profile name, so a
// row with a `uid` can't be renamed here.
participants.patch("/:id", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  await connect();
  if (!(await isTripEditor(tripId, session.uid))) throw new HTTPException(403, { message: "Forbidden" });

  const p = await Participant.findOne({ _id: id, tripId }).lean();
  if (!p) throw new HTTPException(404, { message: "Participant not found" });
  if (p.uid) throw new HTTPException(400, { message: "Can't rename a registered user" });

  const { name } = await c.req.json<UpdateParticipantInput>();
  if (!name?.trim()) throw new HTTPException(400, { message: "Name is required" });

  await Participant.updateOne({ _id: id }, { $set: { name: name.trim() } });
  return c.json({});
});

// Resend a pending invite email. Editors only.
participants.post("/:id/resend", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  await connect();
  const [p, trip] = await Promise.all([
    Participant.findOne({ _id: id, tripId }).lean(),
    Trip.findById(tripId).lean(),
  ]);
  if (!p || !trip) throw new HTTPException(404, { message: "Participant not found" });
  if (!(await isTripEditor(tripId, session.uid))) throw new HTTPException(403, { message: "Forbidden" });
  if (p.status !== "pending" || !p.email) throw new HTTPException(400, { message: "No pending invite to resend" });

  await sendInviteEmail({
    tripName: trip.name,
    fromName: session.name || "",
    email: p.email,
    url: `${process.env.FRONTEND_URL}/accept/${p._id}`,
  });
  return c.json({});
});

// Switch my own contribution between World and Custom. Self only — an admin can never change
// another registered user's mode.
participants.patch("/:id/mode", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  await connect();
  const p = await Participant.findOne({ _id: id, tripId }).lean();
  if (!p) throw new HTTPException(404, { message: "Participant not found" });
  if (!p.uid || p.uid !== session.uid) throw new HTTPException(403, { message: "Forbidden" });

  const { listMode } = await c.req.json<{ listMode: ParticipantListMode }>();
  if (listMode !== "world" && listMode !== "custom") throw new HTTPException(400, { message: "Invalid list mode" });

  await Participant.updateOne({ _id: id }, { $set: { listMode } });
  return c.json({});
});

// Upload (replace) a participant's custom list. Either my own list, or — only for a named-only
// person — the owner manages it. Uploading implies Custom mode.
participants.put("/:id/list", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  await connect();
  const [p, trip] = await Promise.all([
    Participant.findOne({ _id: id, tripId }).lean(),
    Trip.findById(tripId).lean(),
  ]);
  if (!p || !trip) throw new HTTPException(404, { message: "Participant not found" });

  // Self manages their own; any editor manages a name-only person; only the owner may pre-fill a
  // pending invite's list (the invitee re-chooses after accepting).
  const isSelf = !!p.uid && p.uid === session.uid;
  const isNameOnly = !p.uid && p.status === "active";
  const isPendingInvite = !p.uid && p.status === "pending";
  const allowed =
    isSelf ||
    (isNameOnly && (await isTripEditor(tripId, session.uid))) ||
    (isPendingInvite && trip.ownerId === session.uid);
  if (!allowed) throw new HTTPException(403, { message: "Forbidden" });

  const { sciNames } = await c.req.json<LifelistImportInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);
  await Participant.updateOne(
    { _id: id },
    { $set: { lifelist: codes, lifelistUpdatedAt: new Date(), listMode: "custom" } }
  );
  return c.json({});
});

// Mark a species seen, writing to *this participant's* list. Self for my own list; owner for a
// named-only person. World users write through to their global Profile; everyone else to the
// participant's own custom list.
participants.post("/:id/seen", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  const { code } = await c.req.json<AddToLifelistInput>();
  if (!code) throw new HTTPException(400, { message: "Missing code" });

  await connect();
  const [p, trip] = await Promise.all([
    Participant.findOne({ _id: id, tripId }).lean(),
    Trip.findById(tripId).lean(),
  ]);
  if (!p || !trip) throw new HTTPException(404, { message: "Participant not found" });

  const isSelf = !!p.uid && p.uid === session.uid;
  const isOwnerManagingNamed = !p.uid && trip.ownerId === session.uid;
  if (!isSelf && !isOwnerManagingNamed) throw new HTTPException(403, { message: "Forbidden" });

  if (p.uid && p.listMode === "world") {
    await Profile.updateOne({ uid: p.uid }, { $addToSet: { lifelist: code }, $pull: { exceptions: code } });
  } else {
    await Participant.updateOne({ _id: id }, { $addToSet: { lifelist: code }, $set: { lifelistUpdatedAt: new Date() } });
  }
  return c.json({});
});

// Remove a participant. Self (leave the trip) or any editor; the owner can't be removed.
participants.delete("/:id", async (c) => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  const id = c.req.param("id");
  if (!tripId || !id) throw new HTTPException(400, { message: "Trip ID and participant ID are required" });

  await connect();
  const p = await Participant.findOne({ _id: id, tripId }).lean();
  if (!p) throw new HTTPException(404, { message: "Participant not found" });
  if (p.isOwner) throw new HTTPException(400, { message: "Cannot remove the trip owner" });

  const isSelf = !!p.uid && p.uid === session.uid;
  const isEditor = await isTripEditor(tripId, session.uid);
  if (!isSelf && !isEditor) throw new HTTPException(403, { message: "Forbidden" });

  await Participant.deleteOne({ _id: id });
  return c.json({});
});

export default participants;
