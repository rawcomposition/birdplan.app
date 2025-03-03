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
    console.error("Firebase auth error:", error);
    return null;
  }
}

export const APIError = (message: string, status: number) => {
  console.error(message);
  return new Response(JSON.stringify({ message }), { status });
};
