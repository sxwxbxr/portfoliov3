import { getClientIp } from "@/lib/rate-limit"

/**
 * Small in-memory limiter for the physio account routes: per instance, so a soft
 * deterrent against password guessing and mail abuse, not a hard guarantee.
 * Sliding window; `limited` returns true when the caller is over the limit.
 */

type Store = Map<string, number[]>

function store(): Store {
  const g = globalThis as typeof globalThis & { physioRateLimit?: Store }
  if (!g.physioRateLimit) g.physioRateLimit = new Map()
  return g.physioRateLimit
}

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE

export function limited(key: string, max: number, windowMs: number): boolean {
  const s = store()
  const now = Date.now()
  const recent = (s.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    s.set(key, recent)
    return true
  }
  recent.push(now)
  s.set(key, recent)
  if (s.size > 5000) {
    for (const [k, hits] of s) {
      const fresh = hits.filter((t) => now - t < HOUR)
      if (fresh.length === 0) s.delete(k)
      else s.set(k, fresh)
    }
  }
  return false
}

export const clientIp = getClientIp

/** Named limits of the account routes. */
export const LIMITS = {
  login: { max: 10, windowMs: 15 * MINUTE },
  signup: { max: 5, windowMs: HOUR },
  mail: { max: 5, windowMs: HOUR },
  password: { max: 10, windowMs: 15 * MINUTE },
  checkout: { max: 20, windowMs: HOUR },
} as const
