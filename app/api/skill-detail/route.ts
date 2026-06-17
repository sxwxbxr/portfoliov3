export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { enforceAiRateLimit } from "@/lib/rate-limit"
import { getModelsForFeature } from "@/lib/ai/models"
import { completeText } from "@/lib/ai/openrouter"
import { skillDetailSystemPrompt } from "@/lib/ai/prompts"

const schema = z.object({ skill: z.string().min(1).max(100) })

type SkillDetail = { description: string; relatedProjects: string[] }

const FALLBACK: SkillDetail = {
  description: "Used in various projects — see the Projects page for details.",
  relatedProjects: [],
}

// Free models don't reliably honor JSON mode, so parse defensively: pull the
// first {...} block out of the text and validate it; fall back on any miss.
function parseResult(text: string): SkillDetail {
  try {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end <= start) return FALLBACK
    const json = JSON.parse(text.slice(start, end + 1)) as {
      description?: unknown
      relatedProjects?: unknown
    }
    const description =
      typeof json.description === "string" ? json.description.trim() : ""
    if (!description) return FALLBACK
    const relatedProjects = Array.isArray(json.relatedProjects)
      ? json.relatedProjects
          .filter((p): p is string => typeof p === "string")
          .slice(0, 2)
      : []
    return { description, relatedProjects }
  } catch {
    return FALLBACK
  }
}

export async function POST(req: Request) {
  if (!AI_FEATURES_ENABLED) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 503 })
  }

  const limited = await enforceAiRateLimit(req)
  if (limited) return limited

  let skill: string
  try {
    skill = schema.parse(await req.json()).skill
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const [system, models] = await Promise.all([
      skillDetailSystemPrompt(),
      getModelsForFeature("skill"),
    ])
    const text = await completeText({
      models,
      system,
      messages: [{ role: "user", content: `Skill: ${skill}` }],
      maxTokens: 200,
      json: true,
    })
    return NextResponse.json(parseResult(text))
  } catch (err) {
    console.error("skill-detail error", err)
    // Soft-fail to the fallback text (the popover shows it gracefully).
    return NextResponse.json(FALLBACK)
  }
}
