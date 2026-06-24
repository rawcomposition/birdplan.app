import dayjs from "dayjs";
import { HTTPException } from "hono/http-exception";
import { connect, MagicLink } from "lib/db.js";
import { nanoId } from "lib/utils.js";
import { sha256, createSession } from "lib/session.js";
import { MAGIC_LINK_EXPIRATION_DAYS } from "lib/config.js";

export async function issueMagicLink(userId: string, createdByUserId?: string) {
  await connect();

  const token = nanoId(40);
  const expiresAt = dayjs().add(MAGIC_LINK_EXPIRATION_DAYS, "day").toDate();

  await MagicLink.create({
    tokenHash: sha256(token),
    userId,
    expiresAt,
    createdByUserId,
  });

  return { token, expiresAt };
}

type RedeemMeta = { userAgent?: string; ip?: string };

export async function redeemMagicLink(token: string, meta: RedeemMeta = {}) {
  await connect();

  const now = new Date();
  const link = await MagicLink.findOneAndUpdate(
    { tokenHash: sha256(token), consumedAt: null, expiresAt: { $gt: now } },
    { $set: { consumedAt: now } },
    { new: true }
  ).lean();

  if (!link) throw new HTTPException(400, { message: "This link is invalid or has expired." });

  try {
    const { token: sessionToken } = await createSession(link.userId, meta);
    return { sessionToken, userId: link.userId };
  } catch (err) {
    await MagicLink.updateOne({ _id: link._id }, { $set: { consumedAt: null } });
    throw err;
  }
}
