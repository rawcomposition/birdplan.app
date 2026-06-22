import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import dayjs from "dayjs";
import { connect, Profile, Session, Participant } from "lib/db.js";
import { nanoId, authenticate } from "lib/utils.js";
import { createSession, invalidateSession } from "lib/session.js";
import { issueOtp, verifyOtp } from "lib/otp.js";
import { enforceRateLimit } from "lib/rateLimit.js";
import { SESSION_INACTIVITY_DAYS, SESSION_REFRESH_THRESHOLD_HOURS, RATE_LIMITS } from "lib/config.js";

const auth = new Hono();

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const getIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

async function claimInvite(inviteId: string, email: string, uid: string, name?: string): Promise<string | undefined> {
  const pending = await Participant.findById(inviteId).lean();
  if (!pending || pending.status !== "pending" || pending.uid) return undefined;
  if (normalizeEmail(pending.email) !== email) return undefined;

  const existing = await Participant.findOne({ tripId: pending.tripId, uid, status: "active" }).lean();
  if (existing) {
    await Participant.deleteOne({ _id: pending._id });
    return pending.tripId;
  }

  const hasCuratedList = !!pending.lifelist?.length;
  try {
    const result = await Participant.updateOne(
      { _id: inviteId, status: "pending", uid: { $exists: false } },
      { $set: { status: "active", uid, name, ...(hasCuratedList ? {} : { listMode: "world" }) } }
    );
    if (result.matchedCount === 0) return undefined;
  } catch (err) {
    if ((err as { code?: number })?.code === 11000) {
      await Participant.deleteOne({ _id: inviteId, status: "pending" });
      return pending.tripId;
    }
    throw err;
  }
  return pending.tripId;
}

auth.post("/request-code", async (c) => {
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);

  if (!email || !isValidEmail(email)) return c.json({ ok: true });

  await connect();

  const emailOk = await enforceRateLimit("request_code", "email", email, RATE_LIMITS.requestCodeEmail);
  const ipOk = await enforceRateLimit("request_code", "ip", ip, RATE_LIMITS.requestCodeIp);
  if (!emailOk || !ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  await issueOtp(email, ip);

  return c.json({ ok: true });
});

auth.post("/verify-code", async (c) => {
  const {
    email: rawEmail,
    code,
    inviteId,
  } = await c.req.json<{ email: string; code: string; inviteId?: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);

  if (!email || !code) throw new HTTPException(400, { message: "Email and code are required" });

  await connect();

  const emailOk = await enforceRateLimit("verify_code", "email", email, RATE_LIMITS.verifyCodeEmail);
  const ipOk = await enforceRateLimit("verify_code", "ip", ip, RATE_LIMITS.verifyCodeIp);
  if (!emailOk || !ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  await verifyOtp(email, code);

  let profile = await Profile.findOne({ email }).lean();
  let isNewUser = false;
  if (!profile) {
    try {
      profile = (await Profile.create({ uid: nanoId(), email })).toObject();
      isNewUser = true;
    } catch (err) {
      if ((err as { code?: number })?.code === 11000) {
        profile = await Profile.findOne({ email }).lean();
      } else {
        throw err;
      }
    }
  }
  if (!profile) throw new HTTPException(500, { message: "Failed to create account" });

  const { token } = await createSession(profile.uid, {
    userAgent: c.req.header("user-agent"),
    ip,
  });

  let claimedTripId: string | undefined;
  if (inviteId) {
    claimedTripId = await claimInvite(inviteId, email, profile.uid, profile.name);
  }

  return c.json({ token, isNewUser, claimedTripId });
});

auth.get("/me", async (c) => {
  const session = await authenticate(c);

  await connect();
  const profile = await Profile.findOne({ uid: session.uid }).lean();
  if (!profile) {
    await invalidateSession(session._id);
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const now = Date.now();
  const lastActive = new Date(session.lastActiveAt).getTime();
  if (now - lastActive > SESSION_REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000) {
    const nowDate = new Date();
    const expiresAt = dayjs(nowDate).add(SESSION_INACTIVITY_DAYS, "day").toDate();
    await Session.updateOne({ _id: session._id }, { $set: { lastActiveAt: nowDate, expiresAt } });
    await Profile.updateOne({ uid: session.uid }, { $set: { lastActiveAt: nowDate } });
  }

  return c.json(profile);
});

auth.post("/logout", async (c) => {
  const session = await authenticate(c);
  await invalidateSession(session._id);
  return c.json({});
});

export default auth;
