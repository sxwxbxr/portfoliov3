import { ProjectDetailView } from "@/components/views/ProjectDetailView"
import { projectMetadata } from "@/lib/project-meta"
import { getProjects } from "@/lib/data"

export const revalidate = 86400

// Pre-render every project detail page at build time so the first visit is a
// CDN cache hit instead of a cold on-demand render.
export async function generateStaticParams() {
  const all = await getProjects()
  return all.map((project) => ({ slug: project.slug }))
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params
  return projectMetadata(slug, "en")
}

export default async function ProjectDetails({ params }: ProjectPageProps) {
  const { slug } = await params
  return ProjectDetailView({ slug, locale: "en" })
}
