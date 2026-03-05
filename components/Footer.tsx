"use client"

import { SiGithub, SiLinkedin } from "react-icons/si"
import { TimeDisplay } from "./TimeDisplay"

const socialLinks = [
  { icon: SiGithub, label: "GitHub", href: "https://github.com/sxwxbxr" },
  { icon: SiLinkedin, label: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256" },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Contact CTA section */}
        <div className="py-24 md:py-32">
          <h2
            className="font-display font-bold tracking-tight text-balance leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Let&apos;s work together
          </h2>

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
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 Seya Weber</p>
          <p>St. Gallen, Switzerland</p>
          <TimeDisplay />
        </div>
      </div>
    </footer>
  )
}
