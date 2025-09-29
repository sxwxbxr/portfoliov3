import { NextResponse } from "next/server"

const DEFAULT_ENDPOINT = "https://libretranslate.com/translate"
const CHUNK_SIZE = 5

type TranslationRequest = {
  texts?: string[]
  targetLanguage?: string
}

const sanitizeTexts = (texts: string[] = []) => {
  const seen = new Set<string>()
  return texts
    .map((text) => (typeof text === "string" ? text : ""))
    .map((text) => text.trim())
    .filter((text) => text.length > 0 && !seen.has(text) && seen.add(text))
}

const translateChunk = async (texts: string[], targetLanguage: string, endpoint: string, apiKey: string) => {
  const results: Record<string, string> = {}

  for (const text of texts) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: targetLanguage,
          format: "text",
          api_key: apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Translation failed with status ${response.status}`)
      }

      const payload = (await response.json()) as { translatedText?: string }
      if (payload.translatedText) {
        results[text] = payload.translatedText
      }
    } catch (error) {
      console.error("Translation error", error)
    }
  }

  return results
}

export async function POST(request: Request) {
  const body = (await request.json()) as TranslationRequest
  const { texts = [], targetLanguage } = body

  if (!targetLanguage || typeof targetLanguage !== "string") {
    return NextResponse.json({ translations: {} }, { status: 400 })
  }

  if (targetLanguage === "en") {
    const identity = Object.fromEntries(texts.map((text) => [text, text]))
    return NextResponse.json({ translations: identity })
  }

  const sanitized = sanitizeTexts(texts)
  if (!sanitized.length) {
    return NextResponse.json({ translations: {} })
  }

  const endpoint = process.env.LIBRE_TRANSLATE_ENDPOINT ?? DEFAULT_ENDPOINT
  const apiKey = process.env.LIBRE_TRANSLATE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { translations: {} },
      { headers: { "x-translation-warning": "missing-api-key" } },
    )
  }

  const translations: Record<string, string> = {}
  for (let index = 0; index < sanitized.length; index += CHUNK_SIZE) {
    const chunk = sanitized.slice(index, index + CHUNK_SIZE)
    const chunkTranslations = await translateChunk(chunk, targetLanguage, endpoint, apiKey)
    Object.assign(translations, chunkTranslations)
  }

  return NextResponse.json({ translations })
}
