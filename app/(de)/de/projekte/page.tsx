import { ProjectsView } from "@/components/views/ProjectsView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("projects", "de")

export default async function ProjectsDe() {
  return ProjectsView({ locale: "de" })
}
