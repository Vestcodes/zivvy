/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Each key (typically a client IP) gets an array of request timestamps.
 * When the number of timestamps inside the current window exceeds `limit`,
 * the request is rejected.
 *
 * Stale entries are purged on every call so the Map does not grow unbounded.
 *
 * This is per-process: each Vercel serverless invocation gets its own Map,
 * so the effective limit is softer than a Redis-backed store. That is fine
 * for blocking form-spam without adding infrastructure dependencies.
 */

interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest tracked request expires (useful for Retry-After). */
  retryAfterSeconds: number;
}

interface RateLimiterOptions {
  /** Maximum requests allowed within `windowMs`. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export function createRateLimiter({ limit, windowMs }: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - windowMs;

    // Purge stale keys on every call (cheap — map is small for contact spam).
    for (const [k, timestamps] of hits) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        hits.delete(k);
      } else {
        hits.set(k, fresh);
      }
    }

    const timestamps = hits.get(key) ?? [];
    const recent = timestamps.filter((t) => t > cutoff);

    if (recent.length >= limit) {
      const oldest = recent[0]!;
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    recent.push(now);
    hits.set(key, recent);
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
