"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { navLinks } from "../src/config"
import { ThemeToggle } from "./ThemeToggle"
import pages from "@/data/pages.json"

const primaryLinks = navLinks.slice(0, 6)
const secondaryLinks = navLinks.slice(6)

const dynamicLinks = (pages as { title: string; slug: string }[]).map((p) => ({
  name: p.title,
  href: `/pages/${p.slug}`,
}))

const allLinks = [...navLinks, ...dynamicLinks]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="relative font-bold text-lg tracking-tight hover:opacity-70 transition-opacity duration-200"
            >
              <span className="text-foreground">seya</span>
              <span className="text-primary">.</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm transition-colors duration-200 rounded-md ${
                    pathname === link.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              <div className="w-px h-5 bg-border mx-2" />
              <ThemeToggle />
              <Link
                href="/contact"
                className="ml-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-80 transition-opacity duration-200"
              >
                Contact
              </Link>
            </div>

            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative pt-24 px-8 h-full overflow-auto"
            >
              <div className="space-y-1">
                {allLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between py-4 text-2xl font-light border-b border-border/50 transition-colors ${
                        pathname === link.href
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-5 h-5 opacity-30" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 pb-8">
                <p className="text-sm text-muted-foreground">info@sweber.dev</p>
                <p className="text-sm text-muted-foreground mt-1">St. Gallen, Switzerland</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
