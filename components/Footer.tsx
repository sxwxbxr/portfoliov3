import Link from "next/link"
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react"
import { TimeDisplay } from "./TimeDisplay"
import type { SiteSettings } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"

const footerNav = [
  {
    heading: "Work",
    links: [
      { name: "Projects", href: "/projects" },
      ...(CASE_STUDIES_ENABLED
        ? [{ name: "Case Studies", href: "/case-studies" }]
        : []),
      { name: "Services", href: "/services" },
    ],
  },
  {
    heading: "About",
    links: [
      { name: "About", href: "/about" },
      { name: "Experience", href: "/experience" },
      { name: "Education", href: "/education" },
      { name: "Skills", href: "/about#skills" },
      ...(BLOG_ENABLED ? [{ name: "Blog", href: "/blog" }] : []),
    ],
  },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const email = settings.contactEmail || "info@sweber.dev"
  const hasSocial = Boolean(settings.githubUrl || settings.linkedinUrl)

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
    <footer className="mt-24 md:mt-32">
      <div className="sheet flex flex-col gap-10 pb-10">
        {/* The conversion surface gets the most material attention on the
            site: one large raised plate, with the address as a real button. */}
        <div className="cast rim p-8 md:p-12 flex flex-col gap-7">
          <p
            className="font-display font-bold tracking-tight text-balance leading-[1.08]"
            style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.4rem)" }}
          >
            Lass uns zusammenarbeiten.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${email}`}
              className="control control-primary inline-flex items-center gap-2.5 px-5 py-3 text-sm font-medium"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {email}
            </a>

            <Link
              href="/contact"
              className="control inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              Projekt anfragen
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {hasSocial && (
              <div className="flex items-center gap-2.5 md:ml-2">
                {settings.githubUrl && (
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="control inline-flex h-11 w-11 items-center justify-center"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="control inline-flex h-11 w-11 items-center justify-center"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Link grid sits on the ground — it is navigation, not an object. */}
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-3 gap-8 px-1 pt-2">
          {[...footerNav, connectGroup].map((group) => (
            <div key={group.heading} className="flex flex-col gap-3.5">
              <p className="annotate">{group.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => {
                  const isExternal =
                    "external" in link ? link.external : link.href.startsWith("http")
                  const cls =
                    "text-sm text-fg-muted hover:text-signal transition-colors duration-150"
                  return (
                    <li key={link.name}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cls}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.href} className={cls}>
                          {link.name}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sunken base rail: the page rests on it. */}
        <div className="well-sm flex flex-col md:flex-row items-center justify-between gap-3 px-5 py-3.5">
          <p className="annotate">&copy; {year} Seya Weber</p>
          <p className="annotate">
            {settings.contactLocation || "St. Gallen, Switzerland"}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="annotate hover:text-signal transition-colors duration-150"
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
