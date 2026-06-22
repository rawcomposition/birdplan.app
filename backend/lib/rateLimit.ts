import type { RateLimit } from "@birdplan/shared";
import { RateLimit as RateLimitModel } from "lib/db.js";

export type RateRule = { limit: number; windowMs: number };

type RateScope = { action: string; scopeType: string; scopeValue: string };

async function hitRule(scope: RateScope, rule: RateRule): Promise<boolean> {
  const now = Date.now();
  const windowStartThreshold = new Date(now - rule.windowMs);
  const match = { ...scope, windowMs: rule.windowMs };

  const doc = await RateLimitModel.findOneAndUpdate(
    { ...match, windowStartAt: { $gt: windowStartThreshold } },
    { $inc: { count: 1 } },
    { new: true }
  ).lean<RateLimit>();

  if (doc) {
    return doc.count <= rule.limit;
  }

  await RateLimitModel.updateOne(
    match,
    { $set: { count: 1, windowStartAt: new Date(now), expiresAt: new Date(now + rule.windowMs) } },
    { upsert: true }
  );

  return true;
}

export async function enforceRateLimit(
  action: string,
  scopeType: string,
  scopeValue: string,
  rules: RateRule[]
): Promise<boolean> {
  for (const rule of rules) {
    const ok = await hitRule({ action, scopeType, scopeValue }, rule);
    if (!ok) return false;
  }
  return true;
}
