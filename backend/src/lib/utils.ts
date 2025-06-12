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

export const getBounds = async (regionString: string) => {
  const regions = regionString.split(",");
  const boundsPromises = regions.map((region) =>
    fetch(`https://api.ebird.org/v2/ref/region/info/${region}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`).then((res) =>
      res.json()
    )
  );
  const boundsResults = await Promise.all(boundsPromises);
  const combinedBounds = boundsResults.reduce(
    (acc, bounds) => {
      return {
        minX: Math.min(acc.minX, bounds.bounds.minX),
        maxX: Math.max(acc.maxX, bounds.bounds.maxX),
        minY: Math.min(acc.minY, bounds.bounds.minY),
        maxY: Math.max(acc.maxY, bounds.bounds.maxY),
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  return combinedBounds;
};
