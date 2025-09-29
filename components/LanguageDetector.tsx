"use client"

import { useEffect, useMemo } from "react"
import Script from "next/script"

const GOOGLE_TRANSLATE_LANGUAGES = [
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "tr",
  "uk",
  "zh-CN",
  "zh-TW",
]

type LanguageMap = Record<string, string>

const LANGUAGE_OVERRIDES: LanguageMap = {
  "ar": "ar",
  "de": "de",
  "es": "es",
  "es-es": "es",
  "es-mx": "es",
  "fr": "fr",
  "fr-fr": "fr",
  "fr-ca": "fr",
  "hi": "hi",
  "hi-in": "hi",
  "it": "it",
  "it-it": "it",
  "ja": "ja",
  "ja-jp": "ja",
  "ko": "ko",
  "ko-kr": "ko",
  "nl": "nl",
  "nl-nl": "nl",
  "pl": "pl",
  "pl-pl": "pl",
  "pt": "pt",
  "pt-br": "pt",
  "pt-pt": "pt",
  "ru": "ru",
  "ru-ru": "ru",
  "sv": "sv",
  "sv-se": "sv",
  "tr": "tr",
  "tr-tr": "tr",
  "uk": "uk",
  "uk-ua": "uk",
  "zh": "zh-CN",
  "zh-cn": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hant": "zh-TW",
  "zh-hk": "zh-TW",
  "zh-mo": "zh-TW",
  "zh-tw": "zh-TW",
}

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: unknown
      }
    }
  }
}

const getNormalizedLanguage = (value?: string | null): string | null => {
  if (!value) return null
  const lower = value.toLowerCase()
  if (LANGUAGE_OVERRIDES[lower]) return LANGUAGE_OVERRIDES[lower]
  const base = lower.split("-")[0]
  if (LANGUAGE_OVERRIDES[base]) return LANGUAGE_OVERRIDES[base]
  if (GOOGLE_TRANSLATE_LANGUAGES.includes(lower)) return lower
  if (GOOGLE_TRANSLATE_LANGUAGES.includes(base)) return base
  return null
}

const setGoogleTranslateCookie = (targetLanguage: string) => {
  if (typeof document === "undefined" || typeof window === "undefined") return
  const host = window.location.hostname
  const cookieValue = `/en/${targetLanguage}`
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + 4)
  const expires = `; expires=${expiration.toUTCString()}`
  const path = "; path=/"
  document.cookie = `googtrans=${cookieValue}${expires}${path}`
  if (host.includes(".")) {
    document.cookie = `googtrans=${cookieValue}${expires}${path}; domain=.${host}`
  }
}

const clearGoogleTranslateCookie = () => {
  if (typeof document === "undefined" || typeof window === "undefined") return
  const host = window.location.hostname
  const expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  const path = "; path=/"
  document.cookie = `googtrans=/en/en${expires}${path}`
  if (host.includes(".")) {
    document.cookie = `googtrans=/en/en${expires}${path}; domain=.${host}`
  }
}

const joinIncludedLanguages = (languages: string[]): string => languages.join(",")

export const LanguageDetector = () => {
  const includedLanguages = useMemo(() => joinIncludedLanguages(GOOGLE_TRANSLATE_LANGUAGES), [])

  useEffect(() => {
    const browserLanguage = navigator.languages?.[0] ?? navigator.language
    const normalized = getNormalizedLanguage(browserLanguage)

    if (!normalized || normalized === "en") {
      clearGoogleTranslateCookie()
      return
    }

    setGoogleTranslateCookie(normalized)
  }, [])

  return (
    <>
      <Script id="google-translate-inline-loader" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            if (typeof google === "undefined" || !google.translate || !google.translate.TranslateElement) {
              return
            }

            new google.translate.TranslateElement({
              pageLanguage: "en",
              includedLanguages: "${includedLanguages}",
              autoDisplay: false
            }, "google_translate_element")
          }
        `}
      </Script>
      <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
    </>
  )
}

export default LanguageDetector
