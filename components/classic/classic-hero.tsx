import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ClassicHero() {
  return (
    <section className="py-20">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl font-bold text-balance">Full Stack Developer & Creative Problem Solver</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Building elegant solutions to complex problems. Passionate about creating exceptional user experiences with
          clean, maintainable code.
        </p>
        <div className="flex gap-4 pt-4">
          <Button size="lg">
            View My Work
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Get in Touch
          </Button>
        </div>
      </div>
    </section>
  )
}
