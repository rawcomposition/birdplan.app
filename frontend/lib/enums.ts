export const Flow = {
  Create: "create",
  Accept: "accept",
} as const;

export type Flow = (typeof Flow)[keyof typeof Flow];
