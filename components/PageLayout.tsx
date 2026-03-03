"use client"

import type React from "react"
import Navigation from "./Navigation"
import { AnimatedSection } from "./AnimatedSection"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  label?: string
}

export default function PageLayout({ children, title, subtitle, label }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-16">
        {title && (
          <section className="py-20 md:py-28 px-6 mesh-gradient">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection>
                {label && (
                  <p className="text-sm font-medium text-primary tracking-wide uppercase mb-4">{label}</p>
                )}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
                )}
              </AnimatedSection>
            </div>
          </section>
        )}

        <main>{children}</main>
      </div>
    </div>
  )
}
