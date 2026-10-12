import { ProjectsView } from "@/components/views/ProjectsView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("projects", "en")

export default async function ProjectsPage() {
  return ProjectsView({ locale: "en" })
}
