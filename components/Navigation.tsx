"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, ChevronRight, Menu } from "lucide-react"
import { FullscreenMenu } from "./FullscreenMenu"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"
import { MAIN_ORIGIN, PACKAGES_ENTRY } from "@/lib/packages/urls"
import { useOnPackagesHost } from "@/lib/packages/useOnPackagesHost"

/** Browse destinations, all visible. */
const navLinks = [
  { name: copy.nav.work, href: "/projects" },
  { name: copy.nav.about, href: "/about" },
  { name: copy.nav.services, href: "/services" },
  { name: copy.nav.packages, href: PACKAGES_ENTRY },
  { name: copy.nav.career, href: "/career" },
  ...(CASE_STUDIES_ENABLED
    ? [{ name: copy.nav.caseStudies, href: "/case-studies" }]
    : []),
  ...(BLOG_ENABLED ? [{ name: copy.nav.blog, href: "/blog" }] : []),
]

/** Height of the announcement strip plus the nav row, for page offsets. */
export const NAV_OFFSET = "pt-36"

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [seated, setSeated] = useState(false)
  const lastScrollY = useRef(0)
  const frame = useRef<number | null>(null)
  const pathname = usePathname()
  const onPackagesHost = useOnPackagesHost()

  // Scroll reads are coalesced into one rAF per frame.
  useEffect(() => {
    const read = () => {
      frame.current = null
      const y = window.scrollY
      if (y < 10) {
        setVisible(true)
        setSeated(false)
      } else {
        setVisible(y < lastScrollY.current || y < 100)
        setSeated(y > 24)
      }
      lastScrollY.current = y
    }
    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(read)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const brandClass =
    "shrink-0 text-[0.9375rem] tracking-tight text-fg transition-opacity duration-150 hover:opacity-70"

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-[transform,background-color] duration-200 ease-out",
          visible ? "translate-y-0" : "-translate-y-full",
          seated ? "bg-ground/85 backdrop-blur-md" : "bg-ground",
        ].join(" ")}
      >
        {/* On packages.* the strip would point at the page you are on. */}
        {!onPackagesHost && (
          <Link
            href={PACKAGES_ENTRY}
            className="flex h-8 items-center justify-center gap-1.5 bg-plate text-xs text-fg transition-colors duration-150 hover:bg-plate-hi"
          >
            {copy.announcement.text}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}

        <nav aria-label={copy.nav.mainNavigation} className="sheet">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              {/* On packages.* the path "/" is the package overview, so the
                  brand has to leave for the portfolio's own origin. */}
              {onPackagesHost ? (
                <a href={`${MAIN_ORIGIN}/`} className={brandClass}>
                  {copy.nav.brand}
                </a>
              ) : (
                <Link href="/" className={brandClass}>
                  {copy.nav.brand}
                </Link>
              )}

              <ul className="hidden items-center gap-5 lg:flex">
                {navLinks.map((link) => {
                  const isPackages = link.href === PACKAGES_ENTRY
                  const active = isPackages
                    ? onPackagesHost || pathname.startsWith("/packages")
                    : !onPackagesHost && pathname === link.href
                  const Tag = link.href.startsWith("http") ? "a" : Link
                  return (
                    <li key={link.href}>
                      <Tag
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          "whitespace-nowrap text-sm transition-colors duration-150 " +
                          (active ? "text-fg" : "text-fg-muted hover:text-fg")
                        }
                      >
                        {link.name}
                      </Tag>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                aria-current={pathname === "/contact" ? "page" : undefined}
                className="control control-primary hidden items-center gap-1 py-2 pr-3 pl-4 text-sm lg:inline-flex"
              >
                {copy.nav.contact}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <button
                onClick={() => setMenuOpen(true)}
                className="control control-ghost inline-flex h-10 w-10 items-center justify-center lg:hidden"
                aria-label={copy.nav.openMenu}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <FullscreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
