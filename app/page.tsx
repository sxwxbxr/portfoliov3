import {
  getProjects,
  getExperience,
  getBlogPosts,
  getCaseStudies,
  getSiteSettings,
} from "@/lib/data"
import HomeContent from "@/components/HomeContent"

export const revalidate = 60

export default async function Home() {
  const [projects, experience, blogPosts, caseStudies, settings] = await Promise.all([
    getProjects(),
    getExperience(),
    getBlogPosts(),
    getCaseStudies(),
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
