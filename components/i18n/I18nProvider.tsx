"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { translateFromDictionary, type SupportedLanguage } from "@/lib/i18n/dictionary"

const STORAGE_KEY = "portfolio.languagePreference"
const CACHE_STORAGE_KEY = "portfolio.translationCache"

type TranslationCache = Record<string, string>

type I18nContextValue = {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  translateInstant: (text: string) => string
  cacheTranslation: (original: string, translated: string, language: SupportedLanguage) => void
  getCachedTranslation: (original: string, language: SupportedLanguage) => string | null
}

const I18nContext = createContext<I18nContextValue | null>(null)

const DEFAULT_LANGUAGE: SupportedLanguage = "en"
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "de", "fr", "it", "es"]

const normalizeKey = (language: SupportedLanguage, value: string) => `${language}::${value}`

const loadCache = (): TranslationCache => {
  if (typeof window === "undefined") return {}
  try {
    const existing = window.localStorage.getItem(CACHE_STORAGE_KEY)
    if (!existing) return {}
    return JSON.parse(existing) as TranslationCache
  } catch (error) {
    console.warn("Failed to parse translation cache", error)
    return {}
  }
}

const saveCache = (cache: TranslationCache) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn("Failed to persist translation cache", error)
  }
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const cacheRef = useRef<TranslationCache>({})

  useEffect(() => {
    cacheRef.current = loadCache()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      setLanguage(storedLanguage)
      return
    }

    const browserLanguage = window.navigator.language?.split("-")[0]?.toLowerCase()
    const detected = SUPPORTED_LANGUAGES.find((lang) => lang === browserLanguage)
    if (detected) {
      setLanguage(detected)
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  const updateLanguage = useCallback((next: SupportedLanguage) => {
    setLanguage(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const translateInstant = useCallback(
    (text: string) => {
      if (!text) return text
      if (language === "en") return text

      const cached = cacheRef.current[normalizeKey(language, text)]
      if (cached) return cached

      const dictionaryValue = translateFromDictionary(language, text)
      if (dictionaryValue) return dictionaryValue

      return text
    },
    [language],
  )

  const cacheTranslation = useCallback((original: string, translated: string, lang: SupportedLanguage) => {
    if (!original || !translated) return
    const key = normalizeKey(lang, original)
    cacheRef.current[key] = translated
    saveCache(cacheRef.current)
  }, [])

  const getCachedTranslation = useCallback((original: string, lang: SupportedLanguage) => {
    const key = normalizeKey(lang, original)
    return cacheRef.current[key] ?? null
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: updateLanguage,
      translateInstant,
      cacheTranslation,
      getCachedTranslation,
    }),
    [language, translateInstant, updateLanguage, cacheTranslation, getCachedTranslation],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18nContext = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider")
  }
  return context
}

export { SUPPORTED_LANGUAGES }
