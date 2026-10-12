import { ProjectDetailView } from "@/components/views/ProjectDetailView"
import { projectMetadata } from "@/lib/project-meta"
import { getProjects } from "@/lib/data"

export const revalidate = 86400

export async function generateStaticParams() {
  const all = await getProjects()
  return all.map((project) => ({ slug: project.slug }))
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params
  return projectMetadata(slug, "de")
}

export default async function ProjectDetailsDe({ params }: ProjectPageProps) {
  const { slug } = await params
  return ProjectDetailView({ slug, locale: "de" })
}
