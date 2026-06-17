import { getAiSettings, type AiFeature } from "@/lib/data"

// Resolves the [primary, fallback] OpenRouter model pair configured for a
// feature in the admin dashboard. Passed straight to the OpenRouter `models`
// array so it auto-falls-back from the free primary to the paid fallback.
export async function getModelsForFeature(feature: AiFeature): Promise<string[]> {
  const s = await getAiSettings()
  const pairs: Record<AiFeature, [string, string]> = {
    chat: [s.chatPrimary, s.chatFallback],
    contact: [s.contactPrimary, s.contactFallback],
    deepdive: [s.deepdivePrimary, s.deepdiveFallback],
    pitch: [s.pitchPrimary, s.pitchFallback],
    skill: [s.skillPrimary, s.skillFallback],
  }
  return pairs[feature].filter(Boolean)
}
