import { home as homeDe } from "@/content/home/de"
import { home as homeEn } from "@/content/home/en"
import { localizePath, type Locale } from "@/lib/i18n"
import { SITE_URL } from "@/lib/seo"
import { SERVICE_KEYS, getService, servicePath, servicesOverview } from "@/lib/services"

export const dynamic = "force-static"

/**
 * Short Markdown overview for language-model crawlers (llmstxt.org). Static:
 * everything comes from the content modules, nothing from the database.
 * Middleware only rewrites the packages and physio hosts, so on the main host
 * this path reaches the route unchanged.
 */

/** The first two sentences of the opening paragraph: who offers what, to whom, where. */
const coreSentence = (text: string) => text.split(/(?<=\.) /).slice(0, 2).join(" ")

const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`

function section(locale: Locale) {
  const overview = servicesOverview(locale)
  const link = (label: string, path: string, note?: string) =>
    `- [${label}](${url(localizePath(path, locale))})${note ? `: ${note}` : ""}`
  const pages =
    locale === "de"
      ? [
          link("Startseite", "/"),
          link("Über mich", "/about"),
          link("Projekte", "/projects"),
          link("Kontakt", "/contact"),
        ]
      : [
          link("Home", "/"),
          link("About", "/about"),
          link("Projects", "/projects"),
          link("Contact", "/contact"),
        ]
  const services = [
    `- [${locale === "de" ? "Leistungen" : "Services"}](${url(servicePathOverview(locale))}): ${overview.metaDescription}`,
    ...SERVICE_KEYS.map((key) => {
      const service = getService(key, locale)
      return `- [${service.h1}](${url(servicePath(key, locale))}): ${service.metaDescription}`
    }),
  ]
  return [
    `## ${locale === "de" ? "Deutsch" : "English"}`,
    "",
    ...pages,
    ...services,
  ].join("\n")
}

const servicePathOverview = (locale: Locale) => localizePath("/services", locale)

export function GET() {
  const body = [
    "# Weber Development",
    "",
    `> ${coreSentence(homeEn.intro)}`,
    ">",
    `> ${coreSentence(homeDe.intro)}`,
    "",
    section("en"),
    "",
    section("de"),
    "",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
