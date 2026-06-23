import crypto from "crypto";
import dayjs from "dayjs";
import type { Session } from "@birdplan/shared";
import { connect, Profile as ProfileModel, Session as SessionModel } from "lib/db.js";
import { SESSION_INACTIVITY_DAYS } from "lib/config.js";

const SESSION_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function generateSecureRandomString(): string {
  const bytes = crypto.randomBytes(24);
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += SESSION_ALPHABET[bytes[i] >> 3];
  }
  return result;
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashSecret(secret: string): string {
  return sha256(secret);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

type SessionMeta = { userAgent?: string; ip?: string };

export async function createSession(uid: string, meta: SessionMeta = {}) {
  await connect();
  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const now = new Date();
  const expiresAt = dayjs(now).add(SESSION_INACTIVITY_DAYS, "day").toDate();

  await SessionModel.create({
    _id: id,
    secretHash: hashSecret(secret),
    uid,
    lastActiveAt: now,
    expiresAt,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  await ProfileModel.updateOne({ uid }, { $set: { lastAuthenticatedAt: now } });

  return { token: `${id}.${secret}`, id };
}

export async function validateSessionToken(token: string): Promise<Session | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [id, secret] = parts;
  if (!id || !secret) return null;

  await connect();

  const session = await SessionModel.findById(id).lean<Session>();
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await SessionModel.deleteOne({ _id: id });
    return null;
  }

  if (!constantTimeEqual(hashSecret(secret), session.secretHash)) return null;

  return session;
}

export async function invalidateSession(id: string) {
  await connect();
  await SessionModel.deleteOne({ _id: id });
}
