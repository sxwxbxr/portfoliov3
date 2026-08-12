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
 * A project as a cast tile.
 *
 * The screen is recessed into the plate rather than sitting on it, which is
 * the one place the material metaphor is literally true — and it means the
 * tile still reads as a deliberate object when no image exists, because the
 * recess is then filled by an engraved index instead of a broken frame.
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
      className="cast rim group flex flex-col gap-4 p-4 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none"
    >
      <div className="well relative aspect-[16/10] overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold tabular text-fg-subtle/45 select-none"
          >
            {indexLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 px-1 pb-1">
        <div className="flex items-center justify-between gap-3">
          <span className="annotate">{copy.projects.itemMeta(indexLabel, category)}</span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-fg-subtle transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal motion-reduce:transform-none"
            aria-hidden="true"
          />
        </div>

        <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight transition-colors duration-150 group-hover:text-signal">
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
