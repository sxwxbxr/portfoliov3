import type { MetadataRoute } from "next"
import { getProjects, getBlogPosts, getCaseStudies } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { SITE_URL } from "@/lib/seo"

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

  const staticPaths = [
    "",
    "/about",
    "/career",
    "/projects",
    ...(BLOG_ENABLED ? ["/blog"] : []),
    ...(CASE_STUDIES_ENABLED ? ["/case-studies"] : []),
    "/services",
    "/contact",
    "/privacy",
    "/imprint",
    // /skills was folded into /about#skills and /education into /career; 3xx
    // redirects in next.config.mjs keep indexed URLs working, so they must not
    // be listed here as canonicals.
  ]

  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...projects.map((project) => ({ url: `${SITE_URL}/projects/${project.slug}` })),
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...caseStudies.map((cs) => ({ url: `${SITE_URL}/case-studies/${cs.slug}` })),
  ]
}
