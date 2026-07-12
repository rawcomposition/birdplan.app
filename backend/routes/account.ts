import { Hono } from "hono";
import { authenticate, isDuplicateKeyError } from "lib/utils.js";
import { connect, User, Trip, Participant, Session, OtpCode, IntegrationToken, MagicLink } from "lib/db.js";
import { issueOtp, verifyOtp } from "lib/otp.js";
import { invalidateOtherSessions } from "lib/session.js";
import { enforceRateLimit } from "lib/rateLimit.js";
import { RATE_LIMITS } from "lib/config.js";
import { HTTPException } from "hono/http-exception";

const account = new Hono();

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const getIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

account.delete("/", async (c) => {
  const session = await authenticate(c);
  const userId = session.userId;

  await connect();

  const user = await User.findOne({ _id: userId }).select("email").lean();
  const tripIds = await Trip.distinct("_id", { ownerId: userId });

  await Promise.all([
    User.deleteOne({ _id: userId }),
    Participant.deleteMany({ userId }),
    Participant.deleteMany({ tripId: { $in: tripIds } }),
    Trip.deleteMany({ ownerId: userId }),
    IntegrationToken.deleteMany({ tripId: { $in: tripIds } }),
    MagicLink.deleteMany({ userId }),
    Session.deleteMany({ userId }),
    user?.email ? OtpCode.deleteMany({ email: user.email }) : Promise.resolve(),
  ]);

  return c.json({});
});

account.post("/request-email-change", async (c) => {
  const session = await authenticate(c);
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);
  if (!email || !isValidEmail(email)) throw new HTTPException(400, { message: "A valid email is required" });

  await connect();

  const emailOk = await enforceRateLimit("request_code", "email", email, RATE_LIMITS.requestCodeEmail);
  const ipOk = await enforceRateLimit("request_code", "ip", ip, RATE_LIMITS.requestCodeIp);
  const userOk = await enforceRateLimit("request_code", "userId", session.userId, RATE_LIMITS.requestCodeIp);
  if (!emailOk || !ipOk || !userOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing && existing._id !== session.userId) {
    throw new HTTPException(400, { message: "That email is already in use" });
  }

  await issueOtp(email, ip);

  return c.json({ ok: true });
});

account.post("/update-email", async (c) => {
  const session = await authenticate(c);
  const { email: rawEmail, code } = await c.req.json<{ email: string; code: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);
  if (!email || !code) throw new HTTPException(400, { message: "Email and code are required" });

  await connect();

  const emailOk = await enforceRateLimit("verify_code", "email", email, RATE_LIMITS.verifyCodeEmail);
  const ipOk = await enforceRateLimit("verify_code", "ip", ip, RATE_LIMITS.verifyCodeIp);
  if (!emailOk || !ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing && existing._id !== session.userId) {
    throw new HTTPException(400, { message: "That email is already in use" });
  }

  await verifyOtp(email, code);

  try {
    await User.updateOne({ _id: session.userId }, { $set: { email } });
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new HTTPException(400, { message: "That email is already in use" });
    throw err;
  }

  await invalidateOtherSessions(session.userId, session._id);

  return c.json({ message: "Email updated successfully" });
});

export default account;
