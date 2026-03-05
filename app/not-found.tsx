import Link from "next/link"
import Navigation from "@/components/Navigation"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
        <p className="font-mono text-sm text-muted-foreground mb-4">404</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="text-primary hover:underline font-medium"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  )
}
