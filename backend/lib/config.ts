export const RESET_TOKEN_EXPIRATION = 12;

export const BETTER_AUTH_CONFIG = {
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  baseUrl: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
  sessionExpiry: 60 * 60 * 24 * 7,
} as const;
