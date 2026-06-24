import { HTTPException } from "hono/http-exception";
import type { User as UserType } from "@birdplan/shared";
import { connect, User } from "lib/db.js";
import { isDuplicateKeyError } from "lib/utils.js";

export const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function findOrCreateUserByEmail(email: string): Promise<{ user: UserType; isNewUser: boolean }> {
  await connect();

  let user = await User.findOne({ email }).lean();
  let isNewUser = false;
  if (!user) {
    try {
      user = (await User.create({ email })).toObject();
      isNewUser = true;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        user = await User.findOne({ email }).lean();
      } else {
        throw err;
      }
    }
  }
  if (!user) throw new HTTPException(500, { message: "Failed to create account" });

  return { user, isNewUser };
}
