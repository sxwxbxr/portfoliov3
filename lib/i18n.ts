import { copy, type Copy } from "@/lib/copy"
import { copyDe } from "@/lib/copy.de"

export type Locale = "en" | "de"
export const LOCALES: readonly Locale[] = ["en", "de"]
export const DEFAULT_LOCALE: Locale = "en"

export const isLocale = (value: unknown): value is Locale => value === "en" || value === "de"

export function getCopy(locale: Locale = "en"): Copy {
  return locale === "de" ? copyDe : copy
}

/**
 * English path -> German path for every page that exists in both editions.
 * Dynamic detail pages are listed by their prefix in DYNAMIC below.
 *
 * The three service subpages are reserved: their pages do not exist yet.
 * Until they do, `hasGermanVersion` still reports them as mapped, so the
 * pages that get built there only need to be added, not wired up.
 */
const STATIC_PATHS: ReadonlyArray<readonly [en: string, de: string]> = [
  ["/", "/de"],
  ["/services", "/de/leistungen"],
  ["/services/custom-software", "/de/leistungen/individualsoftware"],
  ["/services/process-automation-ai", "/de/leistungen/prozessautomatisierung-ki"],
  ["/services/digital-project-leadership", "/de/leistungen/projektleitung-digitalisierung"],
  ["/projects", "/de/projekte"],
  ["/about", "/de/ueber-mich"],
  ["/career", "/de/werdegang"],
  ["/contact", "/de/kontakt"],
  ["/imprint", "/de/impressum"],
  ["/privacy", "/de/datenschutz"],
]

/** `/projects/[slug]` <-> `/de/projekte/[slug]` (slugs are shared). */
const DYNAMIC_PATHS: ReadonlyArray<readonly [en: string, de: string]> = [
  ["/projects/", "/de/projekte/"],
]

const toDe = new Map(STATIC_PATHS)
const toEn = new Map(STATIC_PATHS.map(([en, de]) => [de, en] as const))

export const GERMAN_PREFIX = "/de"

/** Which edition a path belongs to, judged by its prefix alone. */
export function localeOfPath(path: string): Locale {
  const pathname = splitPath(path).pathname
  return pathname === GERMAN_PREFIX || pathname.startsWith(`${GERMAN_PREFIX}/`) ? "de" : "en"
}

function splitPath(path: string) {
  const hashAt = path.indexOf("#")
  const hash = hashAt >= 0 ? path.slice(hashAt) : ""
  const rest = hashAt >= 0 ? path.slice(0, hashAt) : path
  const queryAt = rest.indexOf("?")
  const query = queryAt >= 0 ? rest.slice(queryAt) : ""
  let pathname = queryAt >= 0 ? rest.slice(0, queryAt) : rest
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1)
  if (!pathname) pathname = "/"
  return { pathname, query, hash }
}

/**
 * The same page in the target language, or null when there is none (login,
 * admin, packages, physio, blog ...). Accepts a path of either edition,
 * with optional query and hash, and keeps both.
 */
export function translatePath(path: string, target: Locale): string | null {
  const { pathname, query, hash } = splitPath(path)
  const source = localeOfPath(pathname)
  const tail = `${query}${hash}`
  if (source === target) return `${pathname}${tail}`

  const [fromStatic, fromDynamic] =
    target === "de"
      ? [toDe, DYNAMIC_PATHS.map(([en, de]) => [en, de] as const)]
      : [toEn, DYNAMIC_PATHS.map(([en, de]) => [de, en] as const)]

  const hit = fromStatic.get(pathname)
  if (hit) return `${hit}${tail}`
  for (const [from, to] of fromDynamic) {
    if (pathname.startsWith(from) && pathname.length > from.length) {
      return `${to}${pathname.slice(from.length)}${tail}`
    }
  }
  return null
}

/**
 * Internal link target for `locale`. Paths without a counterpart (login,
 * packages, physio, blog ...) are returned unchanged, so a German page links to
 * the English-only page rather than to a 404.
 */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path
  return translatePath(path, locale) ?? path
}

/** True when `path` (either edition) has a counterpart in the other edition. */
export function hasGermanVersion(path: string): boolean {
  return translatePath(path, "de") !== null
}

/** Pathname -> `{ en, de }` for hreflang, or null when the page is single-language. */
export function alternatePaths(path: string): { en: string; de: string } | null {
  const en = translatePath(path, "en")
  const de = translatePath(path, "de")
  return en && de ? { en, de } : null
}
