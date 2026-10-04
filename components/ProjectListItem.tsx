import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { copy } from "@/lib/copy"

interface Project {
  title: string
  shortDescription: string
  tags: string[]
  slug: string
}

interface ProjectListItemProps {
  project: Project
  index: number
  /** Pre-resolved by the server via lib/project-image.ts; null when absent. */
  imageSrc?: string | null
  /** First two tiles on a page are above the fold and load eagerly. */
  priority?: boolean
}

/**
 * A project as a flat card: artwork on top, title and a grey line of
 * description underneath. Without an image the frame shows the index in
 * thin type, so the card still reads as deliberate.
 */
export function ProjectListItem({
  project,
  index,
  imageSrc = null,
  priority = false,
}: ProjectListItemProps) {
  const indexLabel = String(index + 1).padStart(2, "0")
  const category = project.tags[0] ?? ""

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="cast card-link group flex flex-col gap-6 p-5 md:p-6"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-well">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority={priority}
            className="object-cover opacity-90 transition-[opacity,transform] duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-100 motion-reduce:transform-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-7xl font-extralight tabular text-fg-subtle/60 select-none"
          >
            {indexLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="annotate">{copy.projects.itemMeta(indexLabel, category)}</span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-fg-subtle transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg motion-reduce:transform-none"
            aria-hidden="true"
          />
        </div>

        <h3 className="text-lg tracking-tight">
          {project.title}
        </h3>

        {project.shortDescription && (
          <p className="text-sm leading-relaxed text-fg-muted line-clamp-2">
            {project.shortDescription}
          </p>
        )}
      </div>
    </Link>
  )
}
