export const OPENBIRDING_API_URL = process.env.OPENBIRDING_API_URL;
export const SHARE_CODE_TTL_MINUTES = 10;

export const IS_DEV = process.env.NODE_ENV !== "production";

export const OTP_EXPIRATION_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

export const SESSION_INACTIVITY_DAYS = 365;
export const SESSION_REFRESH_THRESHOLD_HOURS = 24;

type RateRule = { limit: number; windowMs: number };

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS: Record<string, RateRule[]> = {
  requestCodeEmail: [
    { limit: 1, windowMs: 30 * SECOND },
    { limit: 5, windowMs: HOUR },
  ],
  requestCodeIp: [{ limit: 10, windowMs: HOUR }],
  verifyCodeEmail: [{ limit: 10, windowMs: 10 * MINUTE }],
  verifyCodeIp: [{ limit: 20, windowMs: 10 * MINUTE }],
};
