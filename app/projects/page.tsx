import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import PageLayout from "../../components/PageLayout"
import { ProjectListItem } from "../../components/ProjectListItem"
import { getProjects } from "@/lib/data"
import { CASE_STUDIES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"

export const revalidate = 86400

export default async function Projects() {
  const projects = await getProjects()
  const withImages = projects.map((p) => ({ ...p, imageSrc: resolveImage(p.image) }))

  return (
    <PageLayout
      label={`${projects.length} ${projects.length === 1 ? "Projekt" : "Projekte"}`}
      title="Projects"
      subtitle="Eine Auswahl aus Healthcare, Energie, SaaS und Developer Tools."
    >
      <section className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        {withImages.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {withImages.map((project, i) => (
              <ProjectListItem
                key={project.slug}
                project={project}
                index={i}
                imageSrc={project.imageSrc}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <div className="well p-12 text-center text-sm text-fg-muted">
            Noch keine Projekte hinterlegt.
          </div>
        )}

        {CASE_STUDIES_ENABLED && (
          <Link
            href="/case-studies"
            className="control inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium"
          >
            Case Studies ansehen
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </section>
    </PageLayout>
  )
}
