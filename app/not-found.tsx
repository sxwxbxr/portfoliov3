import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Navigation from "@/components/Navigation"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="sheet pt-32 pb-24">
        {/* One object on an otherwise empty ground: the page that is missing
            is replaced by a plate that plainly is not. */}
        <div className="cast rim flex max-w-2xl flex-col items-start gap-5 p-8 md:p-12">
          <span className="tab annotate">404</span>

          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Page not found
          </h1>

          <p className="measure leading-relaxed text-fg-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <Link
            href="/"
            className="control inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
