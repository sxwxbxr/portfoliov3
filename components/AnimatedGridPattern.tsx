import { cn } from "@/lib/utils"

interface AnimatedGridPatternProps {
  className?: string
}

export function AnimatedGridPattern({ className }: AnimatedGridPatternProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_45%)]" />
      <svg
        className="absolute inset-0 h-full w-full animate-grid-motion text-border/60 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid-pattern" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M48 0H0V48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="opacity-50"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
    </div>
  )
}
