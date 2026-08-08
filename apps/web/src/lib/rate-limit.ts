import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Constructed lazily, only when both credentials are present. Both
// @upstash/redis and @upstash/ratelimit validate their config eagerly at
// construction time — calling `new Redis(...)` with a missing url/token
// throws immediately, which would crash every page that imports
// actions/auth.ts (and therefore this module) the moment Upstash isn't
// configured, not just the one request that needed rate limiting. Since
// this is the default state of a fresh checkout per .env.example, that
// import-time crash is the actual bug behind the /signup failure, not
// just the auto-pipelining issue that surfaced it.
const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Login/signup: generous enough for a real user mistyping a password a
 * few times, tight enough to blunt scripted credential stuffing.
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * Password reset requests: tighter, since each one sends an email —
 * unrestricted resets are both a spam vector and an easy user enumeration
 * probe.
 */
export const passwordResetRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "300 s"),
      prefix: "ratelimit:password-reset",
    })
  : null;

let warnedOnce = false;

/**
 * Keyed by a stable identifier (IP address, or email for account-specific
 * limits) — callers decide which based on the endpoint's abuse pattern.
 *
 * Fails OPEN when rate limiting isn't configured: this is a defense-in-
 * depth measure layered on top of Supabase's own auth rate limits, not
 * the only thing standing between the app and abuse. A misconfigured or
 * absent Upstash instance should degrade the app's abuse resistance, not
 * take signup/login down entirely — those are very different severities.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) {
    if (!warnedOnce) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled. " +
          "Fine for local development; set these before real production traffic.",
      );
      warnedOnce = true;
    }
    return { success: true, remaining: Infinity };
  }

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
