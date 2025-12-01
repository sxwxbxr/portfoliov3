"use client"

import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"
import { navLinks } from "@/src/config"
import { socialLinks, personalInfo } from "@/src/content"

interface ClassicLayoutProps {
  children: ReactNode
}

export function ClassicLayout({ children }: ClassicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            {personalInfo.name}
          </Link>
          <nav className="flex items-center gap-4 flex-wrap">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 {personalInfo.name}</p>
          <div className="flex items-center gap-4">
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${socialLinks.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
