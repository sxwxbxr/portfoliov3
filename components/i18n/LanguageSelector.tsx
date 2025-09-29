"use client"

import { Languages } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_LANGUAGES, useI18nContext } from "./I18nProvider"
import type { SupportedLanguage } from "@/lib/i18n/dictionary"

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
}

export const LanguageSelector = () => {
  const { language, setLanguage } = useI18nContext()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 right-6 z-50"
        data-no-translate
      >
        <div className="rounded-full border border-border/60 bg-background/80 px-3 py-2 shadow-lg shadow-primary/10 backdrop-blur">
          <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
            <SelectTrigger className="gap-2 border-none bg-transparent px-0 py-0 text-sm font-medium shadow-none focus-visible:ring-0">
              <Languages className="size-4 text-primary" aria-hidden="true" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur border-border/60 bg-background/95">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LanguageSelector
