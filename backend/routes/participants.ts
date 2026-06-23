import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { connect, Participant, Profile, Trip } from "lib/db.js";
import { authenticateOptional, nanoId, isDuplicateKeyError } from "lib/utils.js";
import { createSession } from "lib/session.js";
import type { AcceptInviteResponse, InviteInfo } from "@birdplan/shared";

const participants = new Hono();

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const getIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

participants.get("/:token/invite", async (c) => {
  const token: string = c.req.param("token");

  await connect();
  const invite = await Participant.findOne({ inviteToken: token }).lean();
  if (!invite) throw new HTTPException(404, { message: "This invite link is no longer valid. It may have already been used." });
  if (invite.inviteExpiresAt && invite.inviteExpiresAt.getTime() < Date.now()) {
    throw new HTTPException(410, { message: "This invite has expired. Ask the trip owner to send you a new one." });
  }

  const trip = await Trip.findById(invite.tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "This invite no longer exists." });

  const email = normalizeEmail(invite.email);
  const accountExists = !!email && !!(await Profile.exists({ email }));

  const info: InviteInfo = {
    tripId: invite.tripId,
    tripName: trip.name,
    inviterName: trip.ownerName,
    email: invite.email,
    status: invite.status,
    accountExists,
  };

  return c.json(info);
});

participants.post("/:token/accept", async (c) => {
  const token: string = c.req.param("token");
  const session = await authenticateOptional(c);

  await connect();
  const pending = await Participant.findOne({ inviteToken: token }).lean();
  if (!pending) throw new HTTPException(410, { message: "This invite link is no longer valid. It may have already been used." });

  if (pending.inviteExpiresAt && pending.inviteExpiresAt.getTime() < Date.now()) {
    throw new HTTPException(410, { message: "This invite has expired. Ask the trip owner to send you a new one." });
  }

  let profile = session
    ? await Profile.findOne({ uid: session.uid }).lean()
    : await Profile.findOne({ email: normalizeEmail(pending.email) }).lean();

  if (session) {
    if (!profile) throw new HTTPException(401, { message: "Your session is no longer valid." });
  } else {
    const invitedEmail = normalizeEmail(pending.email);
    if (!invitedEmail) throw new HTTPException(400, { message: "This invite cannot be accepted." });
    if (!profile) {
      try {
        profile = (await Profile.create({ uid: nanoId(), email: invitedEmail })).toObject();
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          profile = await Profile.findOne({ email: invitedEmail }).lean();
        } else {
          throw err;
        }
      }
    }
    if (!profile) throw new HTTPException(500, { message: "Failed to accept this invite." });
  }

  const name = profile.name || pending.name;

  const existing = await Participant.findOne({ tripId: pending.tripId, uid: profile.uid, status: "active" }).lean();
  if (existing) {
    if (existing._id !== pending._id) await Participant.deleteOne({ _id: pending._id });
  } else {
    let matched = true;
    try {
      const result = await Participant.updateOne(
        { _id: pending._id, status: "pending", uid: { $exists: false }, inviteToken: token },
        {
          $set: {
            status: "active",
            uid: profile.uid,
            ...(name ? { name } : {}),
          },
          $unset: { inviteToken: "", inviteExpiresAt: "", email: "" },
        }
      );
      matched = result.matchedCount > 0;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        await Participant.deleteOne({ _id: pending._id, status: "pending" });
      } else {
        throw err;
      }
    }
    if (!matched) {
      const reread = await Participant.findById(pending._id).lean();
      if (reread?.uid !== profile.uid) throw new HTTPException(409, { message: "This invite has already been accepted." });
    }
  }

  let sessionToken: string | undefined;
  if (!session) {
    ({ token: sessionToken } = await createSession(profile.uid, { userAgent: c.req.header("user-agent"), ip: getIp(c) }));
  }

  const response: AcceptInviteResponse = {
    tripId: pending.tripId,
    token: sessionToken,
    hasName: !!profile.name,
    hasLifelist: !!profile.lifelist?.length,
  };

  return c.json(response);
});

export default participants;
