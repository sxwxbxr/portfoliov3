"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "./ThemeToggle"
import { FullscreenMenu } from "./FullscreenMenu"

const navLinks = [
  { name: "Work", href: "/projects" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

const moreLinks = [
  { name: "Case Studies", href: "/case-studies", description: "In-depth project breakdowns" },
  { name: "Services", href: "/services", description: "What I offer" },
  { name: "Experience", href: "/experience", description: "Work history" },
  { name: "Blog", href: "/blog", description: "Thoughts and articles" },
  { name: "Skills", href: "/skills", description: "Technical expertise" },
  { name: "Education", href: "/education", description: "Academic background" },
  {
    name: "Nxrthstack",
    href: "https://nxrthstack.sweber.dev",
    description: "SaaS product",
    external: true,
  },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY

      // Show/hide based on scroll direction
      if (currentY < 10) {
        setVisible(true)
        setScrolled(false)
      } else {
        setVisible(currentY < lastScrollY.current || currentY < 100)
        setScrolled(currentY > 50)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  // Close dropdown on Escape and click-outside
  useEffect(() => {
    if (!dropdownOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false)
        moreButtonRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "glass border-b border-border/50 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-display font-medium text-base tracking-tight text-foreground hover:text-primary transition-colors duration-200"
            >
              seya weber
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`link-underline text-sm transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  ref={moreButtonRef}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1 link-underline text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  More
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full right-0 mt-3 w-[520px] glass rounded-xl border border-border/50 shadow-lg overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-px p-1">
                        {moreLinks.map((link) =>
                          link.external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setDropdownOpen(false)}
                              className="group flex flex-col gap-0.5 rounded-lg p-3 hover:bg-primary/5 transition-colors duration-150"
                            >
                              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {link.name}
                                <ExternalLink className="w-3 h-3 text-muted-foreground/60" aria-hidden="true" />
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {link.description}
                              </span>
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setDropdownOpen(false)}
                              className="group flex flex-col gap-0.5 rounded-lg p-3 hover:bg-primary/5 transition-colors duration-150"
                            >
                              <span className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                                {link.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {link.description}
                              </span>
                            </Link>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-4 bg-border" />
              <ThemeToggle />
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <FullscreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
