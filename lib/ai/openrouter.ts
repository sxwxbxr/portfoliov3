// Thin OpenRouter client (OpenAI-compatible) used by every AI feature.
// We call OpenRouter directly with `fetch` — no SDK dependency. Each request
// passes a `models` array (primary `:free` model + paid fallback); OpenRouter
// automatically routes to the next model on error/rate-limit.
// Docs: https://openrouter.ai/docs

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

function authHeaders(): Record<string, string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured")
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    // Optional but recommended by OpenRouter for attribution/rankings.
    "HTTP-Referer": "https://sweber.dev",
    "X-Title": "sweber.dev",
  }
}

function resolveModels(models: string[]): string[] {
  const list = [...new Set(models.filter(Boolean))]
  if (list.length === 0) throw new Error("No model configured for this feature")
  return list
}

function withSystem(system: string, messages: ChatMessage[]): ChatMessage[] {
  return [{ role: "system", content: system }, ...messages]
}

async function failureFromResponse(res: Response): Promise<Error> {
  const detail = await res.text().catch(() => "")
  return new Error(`OpenRouter request failed (${res.status}): ${detail.slice(0, 500)}`)
}

// Aborts a request that stalls — e.g. a rate-limited free model holding the
// connection open — so callers get a fast error instead of hanging.
function withTimeout(ms: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, cancel: () => clearTimeout(id) }
}

/** Non-streaming completion. Returns the assistant message text. */
export async function completeText(opts: {
  models: string[]
  system: string
  messages: ChatMessage[]
  maxTokens?: number
  json?: boolean
}): Promise<string> {
  const body: Record<string, unknown> = {
    models: resolveModels(opts.models),
    messages: withSystem(opts.system, opts.messages),
    max_tokens: opts.maxTokens ?? 1024,
    stream: false,
  }
  // Opportunistic — most models honor it, the rest ignore it harmlessly.
  if (opts.json) body.response_format = { type: "json_object" }

  const timer = withTimeout(45_000)
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: timer.signal,
    })
    if (!res.ok) throw await failureFromResponse(res)

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== "string") throw new Error("OpenRouter returned no content")
    return content
  } finally {
    timer.cancel()
  }
}

/**
 * Streaming completion. Returns a plain UTF-8 text stream (the assistant's
 * content deltas), suitable for returning straight from a route handler. The
 * client reads it with `res.body.getReader()` + TextDecoder.
 */
export async function streamText(opts: {
  models: string[]
  system: string
  messages: ChatMessage[]
  maxTokens?: number
}): Promise<ReadableStream<Uint8Array>> {
  const timer = withTimeout(90_000)
  let res: Response
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        models: resolveModels(opts.models),
        messages: withSystem(opts.system, opts.messages),
        max_tokens: opts.maxTokens ?? 1024,
        stream: true,
      }),
      signal: timer.signal,
    })
  } catch (err) {
    timer.cancel()
    throw err
  }
  if (!res.ok || !res.body) {
    timer.cancel()
    throw await failureFromResponse(res)
  }
  return sseToText(res.body, timer.cancel)
}

/** Transforms OpenRouter's SSE response into a stream of plain text deltas. */
function sseToText(
  upstream: ReadableStream<Uint8Array>,
  onClose?: () => void
): ReadableStream<Uint8Array> {
  const reader = upstream.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ""

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read()
        if (done) {
          onClose?.()
          controller.close()
          return
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const raw of lines) {
          const line = raw.trim()
          // Skip blank lines and OpenRouter keep-alive comments (": OPENROUTER PROCESSING").
          if (!line || line.startsWith(":")) continue
          if (!line.startsWith("data:")) continue
          const payload = line.slice(5).trim()
          if (payload === "[DONE]") {
            onClose?.()
            controller.close()
            return
          }
          try {
            const json = JSON.parse(payload) as {
              choices?: { delta?: { content?: string } }[]
            }
            const delta = json?.choices?.[0]?.delta?.content
            if (typeof delta === "string" && delta.length > 0) {
              controller.enqueue(encoder.encode(delta))
            }
          } catch {
            // Ignore non-JSON / partial payloads.
          }
        }
      } catch (err) {
        onClose?.()
        controller.error(err)
      }
    },
    cancel() {
      onClose?.()
      void reader.cancel().catch(() => {})
    },
  })
}
