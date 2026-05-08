import {
  getProjects,
  getExperience,
  getBlogPosts,
  getCaseStudies,
  getSiteSettings,
} from "@/lib/data"
import HomeContent from "@/components/HomeContent"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"

export const revalidate = 60

export default async function Home() {
  const [projects, experience, blogPosts, caseStudies, settings] = await Promise.all([
    getProjects(),
    getExperience(),
    BLOG_ENABLED ? getBlogPosts() : Promise.resolve([]),
    CASE_STUDIES_ENABLED ? getCaseStudies() : Promise.resolve([]),
    getSiteSettings(),
  ])

  return (
    <HomeContent
      projects={projects}
      experience={experience}
      blogPosts={blogPosts}
      caseStudies={caseStudies}
      settings={settings}
    />
  )
}
