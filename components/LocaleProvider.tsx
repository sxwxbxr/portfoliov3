"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { Copy } from "@/lib/copy"
import { getCopy, type Locale } from "@/lib/i18n"

const LocaleContext = createContext<Locale>("en")

/**
 * Makes the page language available to client components. The root layout of
 * each edition wraps its tree in this once; server components get the locale
 * as a prop instead.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** UI strings in the current language. Call inside the component, not at module level. */
export function useCopy(): Copy {
  const locale = useLocale()
  return useMemo(() => getCopy(locale), [locale])
}
