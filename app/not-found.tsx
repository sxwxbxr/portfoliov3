import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Navigation from "@/components/Navigation"
import { copy } from "@/lib/copy"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="sheet pt-32 pb-24">
        <div className="flex max-w-2xl flex-col items-start gap-6">
          <span className="tab annotate">{copy.notFound.code}</span>

          <h1 className="display text-balance">
            {copy.notFound.title}
          </h1>

          <p className="lede measure">{copy.notFound.body}</p>

          <Link
            href="/"
            className="control control-primary inline-flex items-center gap-2 py-2.5 pr-4 pl-5 text-sm"
          >
            {copy.notFound.home}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
