"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { X, ExternalLink, Github, Linkedin } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion, type MotionProps } from "framer-motion"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"
import { PACKAGES_ENTRY } from "@/lib/packages/urls"
import { useOnPackagesHost } from "@/lib/packages/useOnPackagesHost"

const EASE = [0.23, 1, 0.32, 1] as const

const menuLinks = [
  { name: copy.nav.work, href: "/projects" },
  { name: copy.nav.about, href: "/about" },
  { name: copy.nav.contact, href: "/contact" },
]

const subLinks = [
  CASE_STUDIES_ENABLED && { name: copy.nav.caseStudies, href: "/case-studies" },
  { name: copy.nav.services, href: "/services" },
  {
    name: copy.nav.packages,
    href: PACKAGES_ENTRY,
    // Absolute in production (packages.sweber.dev): a plain same-tab link, not next/link.
    absolute: PACKAGES_ENTRY.startsWith("http"),
  },
  { name: copy.nav.career, href: "/career" },
  BLOG_ENABLED && { name: copy.nav.blog, href: "/blog" },
  { name: copy.nav.skills, href: "/about#skills" },
].filter(Boolean) as {
  name: string
  href: string
  external?: boolean
  absolute?: boolean
}[]

const socialLinks = [
  { icon: Github, label: copy.nav.github, href: "https://github.com/sxwxbxr" },
  {
    icon: Linkedin,
    label: copy.nav.linkedin,
    href: "https://ch.linkedin.com/in/seya-weber-06a592256",
  },
]

interface FullscreenMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const onPackagesHost = useOnPackagesHost()

  // The whole overlay used to animate roughly 700ms of staggered entrances with
  // no reduced-motion path at all. Now every stagger collapses to a plain mount.
  const step = (i: number): MotionProps =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 8 },
          transition: { delay: 0.05 + i * 0.045, duration: 0.32, ease: EASE },
        }

  // Auto-focus close button when menu opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the animation start rendering
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape key + focus trap
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "Tab") {
        const container = menuRef.current
        if (!container) return
        const focusableEls = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusableEls.length === 0) return
        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={copy.nav.navigationLabel}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
          // Opaque ground, no blur: the menu is the sheet you are on now, not
          // a pane of frosted glass laid over the old one.
          className="fixed inset-0 z-50 bg-ground lg:hidden"
        >
          <div
            data-lenis-prevent
            className="flex h-full flex-col gap-8 overflow-y-auto px-6 pb-8 pt-5"
          >
            {/* Index bar */}
            <div className="flex items-center justify-between gap-4">
              <span className="annotate">{copy.nav.menu}</span>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="control inline-flex h-10 w-10 items-center justify-center"
                aria-label={copy.nav.closeMenu}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label={copy.nav.mainNavigation}
              className="flex flex-1 flex-col justify-center gap-8"
            >
              {/* Primary routes. The current one is white, the rest grey. */}
              <div className="flex flex-col items-start gap-2">
                {menuLinks.map((link, i) => {
                  const active = pathname === link.href
                  return (
                    <motion.div key={link.href} {...step(i)}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={
                          "inline-flex py-2 text-4xl tracking-tight transition-colors duration-150 sm:text-5xl " +
                          (active ? "text-fg" : "text-fg-muted hover:text-fg")
                        }
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Secondary routes: outlined pills. */}
              <motion.div
                {...step(menuLinks.length)}
                className="flex flex-wrap gap-2"
              >
                {subLinks.map((link) => {
                  const active =
                    link.href === PACKAGES_ENTRY
                      ? onPackagesHost || pathname.startsWith("/packages")
                      : !link.external && !onPackagesHost && pathname === link.href
                  const cls =
                    "tab inline-flex items-center gap-1.5 px-3.5 py-2 text-sm transition-colors duration-150 " +
                    (active ? "text-fg" : "text-fg-muted hover:text-fg")
                  return link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className={cls}
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : link.absolute ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cls}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cls}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </motion.div>
            </nav>

            {/* Socials */}
            <motion.div
              {...step(menuLinks.length + 1)}
              className="flex items-center gap-4 border-t border-edge-soft pt-5"
            >
              <div className="flex items-center gap-2.5">
                {socialLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="control inline-flex h-10 w-10 items-center justify-center"
                      aria-label={link.label}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
