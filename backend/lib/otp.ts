import crypto from "crypto";
import dayjs from "dayjs";
import { HTTPException } from "hono/http-exception";
import { OtpCode } from "lib/db.js";
import { sha256, constantTimeEqual } from "lib/session.js";
import { sendOtpEmail } from "lib/email.js";
import { OTP_EXPIRATION_MINUTES, OTP_MAX_ATTEMPTS } from "lib/config.js";

export const generateCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

export async function issueOtp(email: string, ip?: string) {
  await OtpCode.updateMany({ email, consumedAt: null }, { $set: { consumedAt: new Date() } });

  const code = generateCode();
  await OtpCode.create({
    email,
    codeHash: sha256(code),
    expiresAt: dayjs().add(OTP_EXPIRATION_MINUTES, "minute").toDate(),
    ip,
  });

  await sendOtpEmail({ email, code });
}

export async function verifyOtp(email: string, code: string) {
  const now = new Date();

  const otp = await OtpCode.findOneAndUpdate(
    { email, consumedAt: null, expiresAt: { $gt: now }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { sort: { createdAt: -1 }, new: true }
  ).lean();

  if (!otp) {
    const locked = await OtpCode.exists({
      email,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $gte: OTP_MAX_ATTEMPTS },
    });
    if (locked) throw new HTTPException(400, { message: "Too many attempts. Please request a new code." });
    throw new HTTPException(400, { message: "Invalid or expired code" });
  }

  if (!constantTimeEqual(sha256(code), otp.codeHash)) {
    throw new HTTPException(400, { message: "Invalid or expired code" });
  }

  const consumed = await OtpCode.updateOne({ _id: otp._id, consumedAt: null }, { $set: { consumedAt: now } });
  if (consumed.matchedCount === 0) throw new HTTPException(400, { message: "Invalid or expired code" });
}
