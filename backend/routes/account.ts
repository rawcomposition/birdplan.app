import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile, Trip, Participant, Session, OtpCode } from "lib/db.js";
import { issueOtp, verifyOtp } from "lib/otp.js";
import { HTTPException } from "hono/http-exception";

const account = new Hono();

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

account.delete("/", async (c) => {
  const session = await authenticate(c);
  const uid = session.uid;

  await connect();

  const profile = await Profile.findOne({ uid }).select("email").lean();
  const tripIds = await Trip.distinct("_id", { ownerId: uid });

  await Promise.all([
    Profile.deleteOne({ uid }),
    Participant.deleteMany({ uid }),
    Participant.deleteMany({ tripId: { $in: tripIds } }),
    Trip.deleteMany({ ownerId: uid }),
    Session.deleteMany({ uid }),
    profile?.email ? OtpCode.deleteMany({ email: profile.email }) : Promise.resolve(),
  ]);

  return c.json({});
});

account.post("/request-email-change", async (c) => {
  const session = await authenticate(c);
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmail(email)) throw new HTTPException(400, { message: "A valid email is required" });

  await connect();

  const existing = await Profile.findOne({ email }).select("uid").lean();
  if (existing && existing.uid !== session.uid) {
    throw new HTTPException(400, { message: "That email is already in use" });
  }

  await issueOtp(email);

  return c.json({ ok: true });
});

account.post("/update-email", async (c) => {
  const session = await authenticate(c);
  const { email: rawEmail, code } = await c.req.json<{ email: string; code: string }>();
  const email = normalizeEmail(rawEmail);
  if (!email || !code) throw new HTTPException(400, { message: "Email and code are required" });

  await connect();

  const existing = await Profile.findOne({ email }).select("uid").lean();
  if (existing && existing.uid !== session.uid) {
    throw new HTTPException(400, { message: "That email is already in use" });
  }

  await verifyOtp(email, code);

  await Profile.updateOne({ uid: session.uid }, { $set: { email } });

  return c.json({ message: "Email updated successfully" });
});

export default account;
