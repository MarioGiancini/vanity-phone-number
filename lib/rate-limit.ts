/**
 * In-process token-bucket rate limiter.
 *
 * Sufficient for a single-instance deployment (including a Vercel serverless
 * function's warm instance) to blunt casual abuse. It is NOT distributed —
 * behind multiple instances, put a shared limiter (Upstash Redis, Vercel KV) or
 * a WAF in front of it.
 */
interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitOptions {
  /** Bucket size (burst). */
  limit: number;
  /** Refill window in milliseconds (one full bucket per window). */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { tokens: limit - 1, updatedAt: now });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  const refill = ((now - bucket.updatedAt) / windowMs) * limit;
  const tokens = Math.min(limit, bucket.tokens + refill);

  if (tokens < 1) {
    buckets.set(key, { tokens, updatedAt: now });
    const retryAfterSeconds = Math.max(1, Math.ceil(((1 - tokens) / limit) * (windowMs / 1000)));
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  const next = tokens - 1;
  buckets.set(key, { tokens: next, updatedAt: now });
  return { ok: true, remaining: Math.floor(next), retryAfterSeconds: 0 };
}

/** Best-effort client identifier from proxy headers. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}
