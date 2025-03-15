export const HOTSPOT_TARGET_CUTOFF = 5; // percent
export const EBIRD_BASE_URL =
  process.env.NODE_ENV === "development" ? "/api/v1/ebird-proxy" : "https://api.ebird.org/v2";
