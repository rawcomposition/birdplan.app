import { connect, Log } from "lib/db.js";

type LogInput = {
  type: string;
  email?: string;
  userId?: string;
  ip?: string;
  data?: Record<string, unknown>;
};

export const logEvent = async (input: LogInput) => {
  try {
    await connect();
    await Log.create(input);
  } catch (err) {
    console.error(`[log] failed to write ${input.type}: ${err instanceof Error ? err.message : err}`);
  }
};
