import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { ProjectListItem } from "../../components/ProjectListItem"
import { getProjects } from "@/lib/data"

export const revalidate = 60

export default async function Projects() {
  const projects = await getProjects()

  return (
    <PageLayout
      title="Projects"
      subtitle="A selection of projects spanning healthcare, energy, SaaS, and developer tools."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {projects.map((project, i) => (
              <ProjectListItem key={project.slug} project={project} index={i} />
            ))}
            <div className="border-t border-border" />
          </div>

          <div className="mt-12">
            <Link
              href="/case-studies"
              className="link-underline text-primary text-sm font-medium"
            >
              View case studies &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
