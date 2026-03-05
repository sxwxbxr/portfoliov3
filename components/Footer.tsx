"use client"

import Link from "next/link"
import { SiGithub, SiLinkedin } from "react-icons/si"
import { TimeDisplay } from "./TimeDisplay"

const socialLinks = [
  { icon: SiGithub, label: "GitHub", href: "https://github.com/sxwxbxr" },
  { icon: SiLinkedin, label: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256" },
]

const footerNav = [
  {
    heading: "Work",
    links: [
      { name: "Projects", href: "/projects" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Services", href: "/services" },
    ],
  },
  {
    heading: "About",
    links: [
      { name: "About", href: "/about" },
      { name: "Experience", href: "/experience" },
      { name: "Education", href: "/education" },
      { name: "Skills", href: "/skills" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { name: "Contact", href: "/contact" },
      { name: "GitHub", href: "https://github.com/sxwxbxr" },
      { name: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256" },
      { name: "Nxrthstack", href: "https://nxrthstack.sweber.dev" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Contact CTA section */}
        <div className="py-24 md:py-32">
          <p
            className="font-display font-bold tracking-tight text-balance leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Let&apos;s work together
          </p>

          <a
            href="mailto:info@sweber.dev"
            className="inline-block mt-6 link-underline text-primary font-medium"
            style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}
          >
            info@sweber.dev
          </a>

          {/* Social links */}
          <div className="flex items-center gap-5 mt-8">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation link grid */}
        <div className="border-t border-border py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerNav.map((group) => (
              <div key={group.heading}>
                <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wider mb-4">
                  {group.heading}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => {
                    const isExternal = link.href.startsWith("http")
                    return (
                      <li key={link.name}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 Seya Weber</p>
          <p>St. Gallen, Switzerland</p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-primary transition-colors duration-200"
            >
              Login
            </Link>
            <TimeDisplay />
          </div>
        </div>
      </div>
    </footer>
  )
}
