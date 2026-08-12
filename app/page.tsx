import {
  getProjects,
  getExperience,
  getBlogPosts,
  getCaseStudies,
  getSiteSettings,
} from "@/lib/data"
import HomeContent from "@/components/HomeContent"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"

// Static-first: admin writes invalidate on demand via revalidatePublic().
// The 24h value is only a self-healing fallback, not the primary refresh path.
export const revalidate = 86400

export default async function Home() {
  const [projects, experience, blogPosts, caseStudies, settings] = await Promise.all([
    getProjects(),
    getExperience(),
    BLOG_ENABLED ? getBlogPosts() : Promise.resolve([]),
    CASE_STUDIES_ENABLED ? getCaseStudies() : Promise.resolve([]),
    getSiteSettings(),
  ])

  // Resolved here rather than in the tile: the check touches the filesystem and
  // must not be dragged into the client bundle.
  const withImages = projects.map((p) => ({ ...p, imageSrc: resolveImage(p.image) }))

  return (
    <HomeContent
      projects={withImages}
      experience={experience}
      blogPosts={blogPosts}
      caseStudies={caseStudies}
      settings={settings}
    />
  )
}
