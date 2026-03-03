"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SiGithub, SiLinkedin } from "react-icons/si"
import { AnimatedSection } from "./AnimatedSection"

const footerLinks = [
  {
    heading: "Navigate",
    links: [
      { name: "About", href: "/about" },
      { name: "Projects", href: "/projects" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Experience", href: "/experience" },
    ],
  },
  {
    heading: "More",
    links: [
      { name: "Services", href: "/services" },
      { name: "Blog", href: "/blog" },
      { name: "Skills", href: "/skills" },
      { name: "Education", href: "/education" },
    ],
  },
]

const socialLinks = [
  { icon: SiGithub, label: "GitHub", href: "https://github.com/sxwxbxr" },
  { icon: SiLinkedin, label: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="py-20 md:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary tracking-wide uppercase mb-4">
                Available for projects
              </p>
              <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                Let&apos;s build something{" "}
                <span className="text-gradient">great together.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Start a project
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:info@sweber.dev"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                >
                  info@sweber.dev
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="border-t border-border py-12 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-bold text-lg tracking-tight">
              <span className="text-foreground">seya</span>
              <span className="text-primary">.</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Project Manager & Developer based in St. Gallen, Switzerland.
              Turning complex ideas into lean, maintainable solutions.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {group.heading}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Connect
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Seya Weber. Handcrafted in Switzerland.</p>
          <p className="flex items-center gap-1">
            St. Gallen, CH
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 ml-1" />
          </p>
        </div>
      </div>
    </footer>
  )
}
