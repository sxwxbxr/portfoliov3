import type { Metadata } from "next"
import { getProjectBySlug } from "@/lib/data"
import { localizePath, type Locale } from "@/lib/i18n"
import { hasGermanProject, localizeProject } from "@/lib/i18n-data"
import { clipDescription, pageMetadata } from "@/lib/seo"

/**
 * Metadata of a project detail page in either edition.
 *
 * A project without a German description (`descriptionDe` empty) has no German
 * translation: its /de page still renders (with the English text) but is
 * `noindex, follow`, and the English page then lists no `de` alternate, so the
 * two never point at each other with hreflang.
 */
export async function projectMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const row = await getProjectBySlug(slug)
  if (!row) return {}
  const translated = hasGermanProject(row)
  const project = localizeProject(row, locale)
  const enPath = localizePath(`/projects/${slug}`, "en")
  const dePath = localizePath(`/projects/${slug}`, "de")
  return pageMetadata({
    title: project.title,
    description: clipDescription(project.shortDescription || project.description),
    path: locale === "de" ? dePath : enPath,
    locale,
    alternates: translated ? { en: enPath, de: dePath } : { en: enPath },
    noindex: locale === "de" && !translated,
  })
}
