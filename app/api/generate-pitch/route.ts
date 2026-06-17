export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { enforceAiRateLimit } from "@/lib/rate-limit"
import { getModelsForFeature } from "@/lib/ai/models"
import { streamText } from "@/lib/ai/openrouter"
import { pitchSystemPrompt } from "@/lib/ai/prompts"

const schema = z.object({
  role: z.string().min(1).max(80),
  needs: z.array(z.string().max(80)).max(12).default([]),
  requirements: z.string().max(300).nullish(),
})

export async function POST(req: Request) {
  if (!AI_FEATURES_ENABLED) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 503 })
  }

  const limited = await enforceAiRateLimit(req)
  if (limited) return limited

  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const [system, models] = await Promise.all([
      pitchSystemPrompt(),
      getModelsForFeature("pitch"),
    ])

    const parts = [`Reader's role/context: ${data.role}`]
    if (data.needs.length) parts.push(`Looking for: ${data.needs.join(", ")}`)
    if (data.requirements) parts.push(`Specific requirements: ${data.requirements}`)

    const stream = await streamText({
      models,
      system,
      messages: [{ role: "user", content: parts.join("\n") }],
      maxTokens: 500,
    })
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    console.error("generate-pitch error", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 })
  }
}
