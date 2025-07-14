import { createAuthClient } from "better-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const betterAuthUrl = apiUrl.replace("/v1", "");

export const authClient = createAuthClient({
  baseURL: betterAuthUrl,
});

export const { useSession } = authClient;
