import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { ProjectListItem } from "../../components/ProjectListItem"
import { getProjects } from "@/lib/data"
import { CASE_STUDIES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"
import { copy } from "@/lib/copy"
import { pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/JsonLd"
import { breadcrumbList } from "@/lib/structured-data"

export const revalidate = 86400

export const metadata = pageMetadata({
  title: "Projects and case studies",
  description:
    "Selected projects by Weber Development: web applications, automation and AI integrations, each with the problem, the solution and the results.",
  path: "/projects",
})

export default async function Projects() {
  const projects = await getProjects()
  const withImages = projects.map((p) => ({ ...p, imageSrc: resolveImage(p.image) }))

  return (
    <PageLayout
      label={copy.projects.label(projects.length)}
      title={copy.projects.title}
      subtitle={copy.projects.subtitle}
    >
      <JsonLd data={breadcrumbList([{ name: "Projects", path: "/projects" }])} />
      <section className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        {withImages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
          <EmptyState>{copy.projects.empty}</EmptyState>
        )}

        {CASE_STUDIES_ENABLED && (
          <Link
            href="/case-studies"
            className="control inline-flex items-center gap-1.5 self-start py-2.5 pr-4 pl-5 text-sm"
          >
            {copy.projects.viewCaseStudies}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </section>
    </PageLayout>
  )
}
