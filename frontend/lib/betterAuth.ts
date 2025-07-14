import { createAuthClient } from "better-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5100";

export const authClient = createAuthClient({
  baseURL: backendUrl,
});

export const { useSession } = authClient;

// Export the entire client for inspection
export default authClient;
