import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"

interface ProjectCardProps {
  title: string
  description: string
  slug: string
  liveUrl?: string
  repoUrl?: string
}

export default function ProjectCard({ title, description, slug, liveUrl, repoUrl }: ProjectCardProps) {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors group/btn"
              >
                <ExternalLink className="w-4 h-4 text-gray-700 group-hover/btn:text-primary transition-colors" />
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors group/btn"
              >
                <Github className="w-4 h-4 text-gray-700 group-hover/btn:text-primary transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <Link
            href={`/projects/${slug}`}
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            Learn more →
          </Link>

          <div className="flex gap-2">
            {liveUrl && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            {repoUrl && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
          </div>
        </div>
      </div>
    </div>
  )
}
