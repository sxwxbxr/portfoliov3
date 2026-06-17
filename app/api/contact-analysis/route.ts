export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { enforceAiRateLimit } from "@/lib/rate-limit"
import { getModelsForFeature } from "@/lib/ai/models"
import { completeText } from "@/lib/ai/openrouter"
import { contactAnalysisSystemPrompt } from "@/lib/ai/prompts"

const schema = z.object({
  message: z.string().min(30).max(5000),
  projectType: z.string().max(80).nullish(),
  company: z.string().max(200).nullish(),
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
      contactAnalysisSystemPrompt(),
      getModelsForFeature("contact"),
    ])

    const parts = [`Message: ${data.message}`]
    if (data.projectType) parts.push(`Project type: ${data.projectType}`)
    if (data.company) parts.push(`Company: ${data.company}`)

    const analysis = await completeText({
      models,
      system,
      messages: [{ role: "user", content: parts.join("\n") }],
      maxTokens: 150,
    })

    return NextResponse.json({ analysis: analysis.trim() })
  } catch (err) {
    console.error("contact-analysis error", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 })
  }
}
