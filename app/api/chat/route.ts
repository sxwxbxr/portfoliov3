export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { enforceAiRateLimit } from "@/lib/rate-limit"
import { getModelsForFeature } from "@/lib/ai/models"
import { streamText, type ChatMessage } from "@/lib/ai/openrouter"
import { chatSystemPrompt } from "@/lib/ai/prompts"

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      })
    )
    .min(1)
    .max(20),
})

export async function POST(req: Request) {
  if (!AI_FEATURES_ENABLED) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 503 })
  }

  const limited = await enforceAiRateLimit(req)
  if (limited) return limited

  let messages: ChatMessage[]
  try {
    const parsed = schema.parse(await req.json())
    messages = parsed.messages
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const [system, models] = await Promise.all([
      chatSystemPrompt(),
      getModelsForFeature("chat"),
    ])
    const stream = await streamText({ models, system, messages, maxTokens: 800 })
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    console.error("chat route error", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 })
  }
}
