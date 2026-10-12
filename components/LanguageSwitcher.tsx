"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "@/components/LocaleProvider"
import { translatePath, type Locale } from "@/lib/i18n"
import { useOnPackagesHost } from "@/lib/packages/useOnPackagesHost"

/** Language names in their own language: they must not be translated. */
const NAME: Record<Locale, string> = { en: "English", de: "Deutsch" }
const HTML_LANG: Record<Locale, string> = { en: "en", de: "de-CH" }

/**
 * Link to the same page in the other language. Renders nothing when the
 * current page has no counterpart (login, packages, 404 ...). It is a plain
 * link: there is deliberately no redirect by Accept-Language or IP anywhere.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const onPackagesHost = useOnPackagesHost()
  const target: Locale = locale === "de" ? "en" : "de"

  // On packages.* the path "/" is the package overview, not the portfolio home.
  if (onPackagesHost || !pathname) return null
  const href = translatePath(pathname, target)
  if (!href) return null

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={HTML_LANG[target]}
      className={className}
    >
      {NAME[target]}
    </Link>
  )
}
