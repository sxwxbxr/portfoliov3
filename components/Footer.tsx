import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import { TimeDisplay } from "./TimeDisplay"
import type { SiteSettings } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"
import { PACKAGES_ENTRY } from "@/lib/packages/urls"

const footerNav = [
  {
    heading: copy.nav.work,
    links: [
      { name: copy.nav.projects, href: "/projects" },
      ...(CASE_STUDIES_ENABLED
        ? [{ name: copy.nav.caseStudies, href: "/case-studies" }]
        : []),
      { name: copy.nav.services, href: "/services" },
      { name: copy.nav.packages, href: PACKAGES_ENTRY, sameTab: true },
      // The blog lives on the package site; posts come from Schulz Media and /admin/news.
      { name: copy.nav.blog, href: `${PACKAGES_ENTRY}/blog`, sameTab: true },
    ],
  },
  {
    heading: copy.nav.about,
    links: [
      { name: copy.nav.about, href: "/about" },
      { name: copy.nav.career, href: "/career" },
      { name: copy.nav.skills, href: "/about#skills" },
      ...(BLOG_ENABLED ? [{ name: copy.nav.blog, href: "/blog" }] : []),
    ],
  },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const email = settings.contactEmail || "info@sweber.dev"
  const hasSocial = Boolean(settings.githubUrl || settings.linkedinUrl)

  const connectGroup = {
    heading: copy.nav.connect,
    links: [
      { name: copy.nav.contact, href: "/contact", external: false },
      ...(settings.githubUrl
        ? [{ name: copy.nav.github, href: settings.githubUrl, external: true }]
        : []),
      ...(settings.linkedinUrl
        ? [{ name: copy.nav.linkedin, href: settings.linkedinUrl, external: true }]
        : []),
      {
        name: copy.nav.nxrthstack,
        href: "https://nxrthstack.sweber.dev",
        external: true,
      },
      { name: copy.nav.privacy, href: "/privacy", external: false },
      { name: copy.nav.imprint, href: "/imprint", external: false },
    ],
  }

  const linkCls = "text-sm text-fg-muted hover:text-fg transition-colors duration-150"

  return (
    <footer className="mt-24 md:mt-32 border-t border-edge-soft">
      <div className="sheet flex flex-col gap-14 py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand, the address and the social links. */}
          <div className="flex flex-col items-start gap-5">
            <Link href="/" className="text-lg tracking-tight">
              {copy.nav.brand}
            </Link>
            <a href={`mailto:${email}`} className={linkCls}>
              {email}
            </a>
            {hasSocial && (
              <div className="flex items-center gap-2">
                {settings.githubUrl && (
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy.nav.github}
                    className="control inline-flex h-9 w-9 items-center justify-center"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy.nav.linkedin}
                    className="control inline-flex h-9 w-9 items-center justify-center"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>

          <nav
            aria-label={copy.nav.footerLabel}
            className="grid grid-cols-2 gap-10 md:col-span-3 md:grid-cols-3"
          >
            {[...footerNav, connectGroup].map((group) => (
              <div key={group.heading} className="flex flex-col gap-4">
                <p className="text-sm text-fg">{group.heading}</p>
                <ul className="flex flex-col gap-2.5">
                  {group.links.map((link) => {
                    const isExternal =
                      "external" in link ? link.external : link.href.startsWith("http")
                    // The packages subdomain is absolute but ours: same tab.
                    const sameTab = "sameTab" in link && link.sameTab
                    return (
                      <li key={link.name}>
                        {sameTab && link.href.startsWith("http") ? (
                          <a href={link.href} className={linkCls}>
                            {link.name}
                          </a>
                        ) : isExternal && !sameTab ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkCls}
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link href={link.href} className={linkCls}>
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
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-edge-soft pt-6 md:flex-row md:items-center">
          <p className="annotate">{copy.common.copyright(year)}</p>
          <p className="annotate">
            {settings.contactLocation || copy.common.locationFallback}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="annotate hover:text-fg transition-colors duration-150"
            >
              {copy.nav.login}
            </Link>
            <TimeDisplay />
          </div>
        </div>
      </div>
    </footer>
  )
}
