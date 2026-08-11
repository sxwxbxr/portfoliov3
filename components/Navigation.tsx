"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, ExternalLink } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ThemeToggle } from "./ThemeToggle"
import { FullscreenMenu } from "./FullscreenMenu"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

// Services moved up out of the overflow menu: it is a conversion surface and
// does not belong behind a disclosure. What stays in "More" is CV detail.
const navLinks = [
  { name: copy.nav.work, href: "/projects" },
  { name: copy.nav.about, href: "/about" },
  { name: copy.nav.services, href: "/services" },
  { name: copy.nav.contact, href: "/contact" },
]

const moreLinks = [
  CASE_STUDIES_ENABLED && {
    name: copy.nav.caseStudies,
    href: "/case-studies",
    description: copy.nav.caseStudiesDescription,
  },
  {
    name: copy.nav.experience,
    href: "/experience",
    description: copy.nav.experienceDescription,
  },
  {
    name: copy.nav.education,
    href: "/education",
    description: copy.nav.educationDescription,
  },
  BLOG_ENABLED && {
    name: copy.nav.blog,
    href: "/blog",
    description: copy.nav.blogDescription,
  },
  {
    name: copy.nav.nxrthstack,
    href: "https://nxrthstack.sweber.dev",
    description: copy.nav.nxrthstackDescription,
    external: true,
  },
].filter(Boolean) as {
  name: string
  href: string
  description: string
  external?: boolean
}[]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [seated, setSeated] = useState(false)
  const lastScrollY = useRef(0)
  const frame = useRef<number | null>(null)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()

  // Scroll reads are coalesced into one rAF per frame. The previous version
  // called setState on every scroll event at the root of the tree, and also
  // ran two comparisons per event; on a long page that is a measurable INP
  // cost for a purely visual state change.
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

  useEffect(() => {
    if (!dropdownOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false)
        moreButtonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [dropdownOpen])

  const moreActive = moreLinks.some((l) => !l.external && l.href === pathname)

  return (
    <>
      <nav
        // Seating on scroll ramps the material, not a blur radius: the plate
        // rises out of the ground. Retract is critically damped — a nav that
        // springs reads as cheap.
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-[transform,background-color,box-shadow] duration-200 ease-out",
          visible ? "translate-y-0" : "-translate-y-full",
          seated ? "bg-plate shadow-[0_6px_18px_-10px_var(--cast-lo)]" : "bg-transparent",
        ].join(" ")}
      >
        <div className="sheet">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link
              href="/"
              className="font-display text-base font-semibold tracking-tight hover:text-signal transition-colors duration-150"
            >
              {copy.nav.brand}
            </Link>

            <div className="hidden lg:flex items-center gap-3">
              {/* Sunken track. The active page is a raised seat inside it, so
                  "where am I" is answered by physical position, not only hue. */}
              <div className="well-sm flex items-center gap-0.5 p-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className="relative rounded-md px-3.5 py-1.5 text-sm transition-colors duration-150"
                    >
                      {active && (
                        <motion.span
                          layoutId={reduce ? undefined : "nav-seat"}
                          className="cast-sm absolute inset-0"
                          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        />
                      )}
                      <span
                        className={
                          "relative " +
                          (active ? "text-signal font-medium" : "text-fg-muted hover:text-fg")
                        }
                      >
                        {link.name}
                      </span>
                    </Link>
                  )
                })}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  ref={moreButtonRef}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className={
                    "control inline-flex items-center gap-1.5 px-3.5 py-2 text-sm " +
                    (moreActive ? "text-signal" : "text-fg-muted")
                  }
                >
                  {copy.nav.more}
                  <ChevronDown
                    className={
                      "h-3.5 w-3.5 transition-transform duration-200 " +
                      (dropdownOpen ? "rotate-180" : "")
                    }
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={reduce ? undefined : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="cast rim absolute right-0 top-full mt-3 w-[540px] overflow-hidden p-2"
                    >
                      <div className="grid grid-cols-3 gap-1">
                        {moreLinks.map((link) => {
                          const active = !link.external && pathname === link.href
                          const inner = (
                            <>
                              <span
                                className={
                                  "flex items-center gap-1.5 text-sm font-medium transition-colors " +
                                  (active ? "text-signal" : "group-hover:text-signal")
                                }
                              >
                                {link.name}
                                {link.external && (
                                  <ExternalLink
                                    className="h-3 w-3 text-fg-subtle"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                              <span className="text-xs text-fg-muted">
                                {link.description}
                              </span>
                            </>
                          )
                          const cls =
                            "group flex flex-col gap-0.5 rounded-md p-3 transition-[background-color,box-shadow] duration-150 hover:bg-well " +
                            (active ? "well-sm" : "")
                          return link.external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setDropdownOpen(false)}
                              className={cls}
                            >
                              {inner}
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setDropdownOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={cls}
                            >
                              {inner}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ThemeToggle />
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="control lg:hidden inline-flex h-10 w-10 items-center justify-center"
              aria-label={copy.nav.openMenu}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <FullscreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
