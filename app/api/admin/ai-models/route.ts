export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

// Returns the live OpenRouter model catalogue (slimmed) for the admin model
// picker. Cached module-level for ~1h so the dropdown is snappy and we don't
// hammer OpenRouter. Public endpoint on OpenRouter's side — no key required.

type SlimModel = {
  id: string
  name: string
  isFree: boolean
  promptPrice: number | null
  contextLength: number | null
}

type OpenRouterModel = {
  id: string
  name?: string
  context_length?: number
  pricing?: { prompt?: string | number }
}

type ModelCache = { at: number; data: SlimModel[] }

const globalForModels = globalThis as typeof globalThis & {
  openrouterModels?: ModelCache
}

const TTL_MS = 60 * 60 * 1000

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cached = globalForModels.openrouterModels
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.data)
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`OpenRouter models ${res.status}`)

    const json = (await res.json()) as { data?: OpenRouterModel[] }
    const models: SlimModel[] = (json.data ?? [])
      .map((m) => {
        const raw = m.pricing?.prompt
        const promptPrice = raw != null ? Number(raw) : null
        const id = String(m.id)
        return {
          id,
          name: String(m.name ?? id),
          isFree: id.endsWith(":free") || promptPrice === 0,
          promptPrice:
            promptPrice != null && Number.isFinite(promptPrice)
              ? promptPrice
              : null,
          contextLength:
            typeof m.context_length === "number" ? m.context_length : null,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    globalForModels.openrouterModels = { at: Date.now(), data: models }
    return NextResponse.json(models)
  } catch {
    // Serve stale cache if we have it; otherwise surface a soft error.
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json(
      { error: "Could not load the model list from OpenRouter" },
      { status: 502 }
    )
  }
}
