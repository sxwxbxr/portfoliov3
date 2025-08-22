import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  company: string
  avatar: string
}

export default function TestimonialCard({ quote, name, role, company, avatar }: TestimonialCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
      <div className="absolute -top-4 left-8">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Quote className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      <blockquote className="text-card-foreground leading-relaxed mb-6 pt-4 italic">"{quote}"</blockquote>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
          <img
            src={avatar || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.nextElementSibling!.classList.remove("hidden")
            }}
          />
          <span className="hidden text-sm font-semibold text-primary">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>

        <div>
          <div className="font-semibold text-card-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">
            {role} · <span className="text-primary">{company}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
