import type { RateLimit } from "@birdplan/shared";
import { RateLimit as RateLimitModel } from "lib/db.js";

export type RateRule = { limit: number; windowMs: number };

type RateScope = { action: string; scopeType: string; scopeValue: string };

async function hitRule(scope: RateScope, rule: RateRule): Promise<boolean> {
  const now = Date.now();
  const windowStartAt = new Date(Math.floor(now / rule.windowMs) * rule.windowMs);

  const doc = await RateLimitModel.findOneAndUpdate(
    { ...scope, windowMs: rule.windowMs, windowStartAt },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(windowStartAt.getTime() + rule.windowMs) },
    },
    { upsert: true, new: true }
  ).lean<RateLimit>();

  if (!doc) return true;
  return doc.count <= rule.limit;
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
