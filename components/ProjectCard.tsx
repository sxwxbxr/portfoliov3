import Link from "next/link"
import { ExternalLink, ArrowUpRight } from "lucide-react"
import { SiGithub } from "react-icons/si"

interface ProjectCardProps {
  title: string
  shortDescription: string
  slug: string
  tags?: string[]
  demo?: string
  github?: string
}

export default function ProjectCard({ title, shortDescription, slug, tags = [], demo, github }: ProjectCardProps) {
  const hasDemo = Boolean(demo && demo !== "#")
  const hasGithub = Boolean(github && github !== "#")

  return (
    <div className="group bento-card rounded-2xl border border-border bg-card overflow-hidden h-full flex flex-col">
      <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-secondary/5 dot-grid relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-primary/10">{title.charAt(0)}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          {hasDemo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass text-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {hasGithub && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass text-foreground hover:text-primary transition-colors"
            >
              <SiGithub className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">{shortDescription}</p>

        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
        >
          View details <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
