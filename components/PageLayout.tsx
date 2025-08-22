import type React from "react"
import Navigation from "./Navigation"
import FadeInSection from "./FadeInSection"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16">
        <section className="py-24 px-4 gradient-bg">
          <div className="max-w-6xl mx-auto text-center">
            <FadeInSection>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">{subtitle}</p>}
            </FadeInSection>
          </div>
        </section>

        <main>{children}</main>
      </div>
    </div>
  )
}
