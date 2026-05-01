import Link from "next/link"
import { SiGithub, SiLinkedin } from "react-icons/si"
import { TimeDisplay } from "./TimeDisplay"
import type { SiteSettings } from "@/lib/data"

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
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const email = settings.contactEmail || "info@sweber.dev"

  const socialLinks = [
    settings.githubUrl
      ? { icon: SiGithub, label: "GitHub", href: settings.githubUrl }
      : null,
    settings.linkedinUrl
      ? { icon: SiLinkedin, label: "LinkedIn", href: settings.linkedinUrl }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null)

  const connectGroup = {
    heading: "Connect",
    links: [
      { name: "Contact", href: "/contact", external: false },
      ...(settings.githubUrl
        ? [{ name: "GitHub", href: settings.githubUrl, external: true }]
        : []),
      ...(settings.linkedinUrl
        ? [{ name: "LinkedIn", href: settings.linkedinUrl, external: true }]
        : []),
      { name: "Nxrthstack", href: "https://nxrthstack.sweber.dev", external: true },
      ...(settings.privacyContent.trim()
        ? [{ name: "Privacy", href: "/privacy", external: false }]
        : []),
    ],
  }

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
            href={`mailto:${email}`}
            className="inline-block mt-6 link-underline text-primary font-medium"
            style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}
          >
            {email}
          </a>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-5 mt-8">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation link grid */}
        <div className="border-t border-border py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[...footerNav, connectGroup].map((group) => (
              <div key={group.heading}>
                <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wider mb-4">
                  {group.heading}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => {
                    const isExternal =
                      "external" in link
                        ? link.external
                        : link.href.startsWith("http")
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
          <p>&copy; {year} Seya Weber</p>
          <p>{settings.contactLocation || "St. Gallen, Switzerland"}</p>
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
