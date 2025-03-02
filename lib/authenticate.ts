import { auth } from "lib/firebaseAdmin";

export async function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
