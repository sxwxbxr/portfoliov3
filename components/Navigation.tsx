"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { ThemeToggle } from "./ThemeToggle"
import { FullscreenMenu } from "./FullscreenMenu"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

/**
 * Browse destinations. All of them, with nothing behind a disclosure.
 *
 * There used to be a "More" dropdown here: a 540px three-column panel built
 * for seven entries. Case studies and the blog are feature-flagged off and
 * skills moved into /about, so it was rendering three links into a mega-menu —
 * and it sat as a RAISED control immediately beside the SUNKEN track, two
 * opposite polarities at the same level of hierarchy.
 *
 * Both problems have the same fix. Everything lives in the track, one
 * polarity, nothing hidden. Nxrthstack is a different website rather than a
 * section of this one, so it stays in the footer and the mobile menu.
 */
const navLinks = [
  { name: copy.nav.work, href: "/projects" },
  { name: copy.nav.about, href: "/about" },
  { name: copy.nav.services, href: "/services" },
  { name: copy.nav.career, href: "/career" },
  ...(CASE_STUDIES_ENABLED
    ? [{ name: copy.nav.caseStudies, href: "/case-studies" }]
    : []),
  ...(BLOG_ENABLED ? [{ name: copy.nav.blog, href: "/blog" }] : []),
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [seated, setSeated] = useState(false)
  const lastScrollY = useRef(0)
  const frame = useRef<number | null>(null)
  const pathname = usePathname()
  const reduce = useReducedMotion()

  // Scroll reads are coalesced into one rAF per frame. The previous version
  // called setState on every scroll event at the root of the tree, which is a
  // measurable INP cost for a purely visual state change.
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
          <div className="flex h-16 items-center justify-between gap-5">
            <Link
              href="/"
              className="shrink-0 font-display text-base font-semibold tracking-tight transition-colors duration-150 hover:text-signal"
            >
              {copy.nav.brand}
            </Link>

            <div className="hidden items-center gap-3 lg:flex">
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
                      className="relative rounded-md px-3 py-1.5 text-sm transition-colors duration-150"
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
                          "relative whitespace-nowrap " +
                          (active
                            ? "font-medium text-signal"
                            : "text-fg-muted hover:text-fg")
                        }
                      >
                        {link.name}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* Contact is an action, not a peer destination, so it leaves the
                  track and becomes the one raised, accent-filled control. */}
              <Link
                href="/contact"
                aria-current={pathname === "/contact" ? "page" : undefined}
                className="control control-primary shrink-0 px-4 py-2 text-sm font-medium"
              >
                {copy.nav.contact}
              </Link>

              <ThemeToggle />
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="control inline-flex h-10 w-10 items-center justify-center lg:hidden"
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
