export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { enforceAiRateLimit } from "@/lib/rate-limit"
import { getModelsForFeature } from "@/lib/ai/models"
import { streamText } from "@/lib/ai/openrouter"
import { deepDiveSystemPrompt } from "@/lib/ai/prompts"

const schema = z.object({
  projectSlug: z.string().min(1).max(120),
  projectTitle: z.string().min(1).max(200),
  projectDescription: z.string().min(1).max(4000),
  techStack: z.array(z.string().max(80)).max(40).default([]),
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
      deepDiveSystemPrompt(),
      getModelsForFeature("deepdive"),
    ])

    const user = [
      `Project: ${data.projectTitle}`,
      `Description: ${data.projectDescription}`,
      `Tech stack: ${data.techStack.join(", ") || "n/a"}`,
    ].join("\n")

    const stream = await streamText({
      models,
      system,
      messages: [{ role: "user", content: user }],
      maxTokens: 700,
    })
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    console.error("project-deepdive error", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 })
  }
}
