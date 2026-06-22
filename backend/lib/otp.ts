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
  const otp = await OtpCode.findOne({ email, consumedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean();
  if (!otp) throw new HTTPException(400, { message: "Invalid or expired code" });

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await OtpCode.updateOne({ _id: otp._id }, { $set: { consumedAt: new Date() } });
    throw new HTTPException(400, { message: "Too many attempts. Please request a new code." });
  }

  if (!constantTimeEqual(sha256(code), otp.codeHash)) {
    const nextAttempts = otp.attempts + 1;
    await OtpCode.updateOne(
      { _id: otp._id },
      nextAttempts >= OTP_MAX_ATTEMPTS
        ? { $inc: { attempts: 1 }, $set: { consumedAt: new Date() } }
        : { $inc: { attempts: 1 } }
    );
    throw new HTTPException(400, { message: "Invalid or expired code" });
  }

  await OtpCode.updateOne({ _id: otp._id }, { $set: { consumedAt: new Date() } });
}
