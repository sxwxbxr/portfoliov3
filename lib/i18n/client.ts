import type { SupportedLanguage } from "./dictionary"

type TranslationResponse = {
  translations: Record<string, string>
}

export const requestTranslations = async (
  texts: string[],
  language: SupportedLanguage,
): Promise<Record<string, string>> => {
  if (!texts.length) return {}

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts, targetLanguage: language }),
    })

    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as TranslationResponse
    return payload.translations ?? {}
  } catch (error) {
    console.warn("Failed to fetch translations", error)
    return {}
  }
}
