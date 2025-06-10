import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { auth } from "lib/firebaseAdmin.js";
import { customAlphabet } from "nanoid";

export const nanoId = (length: number = 16) => {
  return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();
};

export async function authenticate(c: Context) {
  const authHeader = c.req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error("Firebase auth error:", error);
    throw new HTTPException(401, { message: "Unauthorized" });
  }
}
