import { getProjects, getExperience, getBlogPosts, getCaseStudies } from "@/lib/data"
import HomeContent from "@/components/HomeContent"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [projects, experience, blogPosts, caseStudies] = await Promise.all([
    getProjects(),
    getExperience(),
    getBlogPosts(),
    getCaseStudies(),
  ])

  return (
    <HomeContent
      projects={projects}
      experience={experience}
      blogPosts={blogPosts}
      caseStudies={caseStudies}
    />
  )
}
