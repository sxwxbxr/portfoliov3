import { NextResponse } from "next/server"
import { getAiSettings } from "@/lib/data"

// Two-layer abuse protection for the public, unauthenticated AI routes:
//  1. Per-IP sliding window in memory (fast, per-instance, soft deterrent).
//  2. Durable global daily cap via Vercel KV / Upstash REST (hard kill-switch
//     against runaway cost). Talks to KV over its REST API with plain fetch —
//     no SDK dependency. Fails OPEN if KV is unconfigured or unreachable so the
//     site never breaks because of the limiter.

const PER_IP_MAX = 10
const PER_IP_WINDOW_MS = 60 * 1000

type RateStore = Map<string, number[]>

type GlobalRateState = { aiRateLimit?: RateStore }

function getStore(): RateStore {
  const g = globalThis as typeof globalThis & GlobalRateState
  if (!g.aiRateLimit) g.aiRateLimit = new Map()
  return g.aiRateLimit
}

export function getClientIp(req: Request): string {
  const header =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    ""
  return header ? header.split(",")[0].trim() : "unknown"
}

function perIpLimited(ip: string): boolean {
  const store = getStore()
  const now = Date.now()
  const recent = (store.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS)

  if (recent.length >= PER_IP_MAX) {
    store.set(ip, recent)
    return true
  }

  recent.push(now)
  store.set(ip, recent)

  // Opportunistic cleanup so the map can't grow unbounded.
  if (store.size > 5000) {
    for (const [key, hits] of store) {
      const fresh = hits.filter((t) => now - t < PER_IP_WINDOW_MS)
      if (fresh.length === 0) store.delete(key)
      else store.set(key, fresh)
    }
  }
  return false
}

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ""), token }
}

async function kvCommand(path: string): Promise<number | null> {
  const cfg = kvConfig()
  if (!cfg) return null
  try {
    const res = await fetch(`${cfg.url}/${path}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result?: number }
    return typeof data.result === "number" ? data.result : null
  } catch {
    return null
  }
}

async function globalDailyExceeded(): Promise<boolean> {
  if (!kvConfig()) return false // fail-open: no KV configured

  const day = new Date().toISOString().slice(0, 10)
  const key = encodeURIComponent(`ai:global:${day}`)
  const count = await kvCommand(`incr/${key}`)
  if (count === null) return false // fail-open on KV error

  // First request of the day: expire the counter ~25h out so it rolls over.
  if (count === 1) await kvCommand(`expire/${key}/90000`)

  let limit = 500
  try {
    limit = (await getAiSettings()).dailyLimit
  } catch {
    // keep the default if settings can't be read
  }
  return count > limit
}

/**
 * Enforces both rate-limit layers. Returns a ready-to-send error response when
 * blocked, or `null` when the request may proceed.
 */
export async function enforceAiRateLimit(req: Request): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  if (perIpLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  if (await globalDailyExceeded()) {
    return NextResponse.json({ error: "Daily AI limit reached" }, { status: 503 })
  }
  return null
}
