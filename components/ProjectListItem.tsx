"use client"

import Link from "next/link"

interface Project {
  title: string
  shortDescription: string
  description: string
  image: string
  tags: string[]
  slug: string
  github: string
  demo: string
}

interface ProjectListItemProps {
  project: Project
  index: number
}

export function ProjectListItem({ project, index }: ProjectListItemProps) {
  const indexLabel = String(index + 1).padStart(2, "0")

  // Derive a category from the first tag
  const category = project.tags[0] ?? ""

  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <div
        className={[
          "relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[3rem_1fr_auto_auto] items-center gap-4 md:gap-6",
          "py-5 md:py-6 border-t border-border",
          // Hover background
          "transition-[background-color] duration-200 ease-out",
          "group-hover:bg-background/60 group-hover:backdrop-blur-sm",
        ].join(" ")}
      >
        {/* Left border accent — animates height on hover */}
        <span
          className={[
            "absolute left-0 top-0 w-[2px] bg-primary",
            "h-0 group-hover:h-full",
            "transition-[height] duration-300 ease-out",
            "motion-reduce:transition-none",
          ].join(" ")}
          aria-hidden="true"
        />

        {/* Index */}
        <span className="font-mono text-sm text-muted-foreground transition-colors duration-200 group-hover:text-primary">
          {indexLabel}
        </span>

        {/* Title */}
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary truncate">
          {project.title}
        </h3>

        {/* Category — hidden on mobile */}
        <span className="hidden md:block text-sm text-muted-foreground">
          {category}
        </span>

        {/* Arrow indicator */}
        <span className="text-muted-foreground group-hover:text-primary transition-colors duration-200" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 ease-out motion-reduce:transform-none"
          >
            <path
              d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  )
}
