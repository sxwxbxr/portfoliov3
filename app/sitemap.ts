import type { MetadataRoute } from "next"
import { getProjects, getBlogPosts, getCaseStudies } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { SITE_URL } from "@/lib/seo"
import { localizePath } from "@/lib/i18n"
import { hasGermanProject } from "@/lib/i18n-data"

export const revalidate = 3600

/**
 * Only indexable portfolio routes. changeFrequency and priority are left out
 * on purpose (Google ignores them), and lastModified is set only where a real
 * date exists: a `new Date()` on every build would tell crawlers everything
 * changed every hour. /packages and /physio have their own sitemaps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogPosts, caseStudies] = await Promise.all([
    getProjects(),
    BLOG_ENABLED ? getBlogPosts() : Promise.resolve([]),
    CASE_STUDIES_ENABLED ? getCaseStudies() : Promise.resolve([]),
  ])

  // Both language versions of every page, each entry listing the whole set so
  // the sitemap and the on-page hreflang agree. Only English paths are listed
  // here; localizePath derives the German twin.
  const entry = (enPath: string, withGerman = true): MetadataRoute.Sitemap => {
    const en = `${SITE_URL}${enPath === "/" ? "" : enPath}`
    if (!withGerman) return [{ url: en, alternates: { languages: { en, "x-default": en } } }]
    const deRaw = localizePath(enPath, "de")
    const de = `${SITE_URL}${deRaw}`
    const languages = { en, de, "x-default": en }
    return [
      { url: en, alternates: { languages } },
      { url: de, alternates: { languages } },
    ]
  }

  const staticPaths = [
    "/",
    "/about",
    "/career",
    "/projects",
    "/services",
    "/contact",
    "/privacy",
    "/imprint",
    // /skills was folded into /about#skills and /education into /career; 3xx
    // redirects in next.config.mjs keep indexed URLs working, so they must not
    // be listed here as canonicals.
  ]

  return [
    ...staticPaths.flatMap((path) => entry(path)),
    // A project's German page is indexable only once it has a German
    // description; until then it is noindex and absent here, and the English
    // page lists no `de` alternate.
    ...projects.flatMap((project) =>
      entry(`/projects/${project.slug}`, hasGermanProject(project))
    ),
    // Blog and case studies have no German edition.
    ...(BLOG_ENABLED ? [{ url: `${SITE_URL}/blog` }] : []),
    ...(CASE_STUDIES_ENABLED ? [{ url: `${SITE_URL}/case-studies` }] : []),
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...caseStudies.map((cs) => ({ url: `${SITE_URL}/case-studies/${cs.slug}` })),
  ]
}
