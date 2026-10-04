"use client"

import type React from "react"
import Navigation from "./Navigation"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  label?: string
}

/**
 * Scroll-reveal wrapper.
 *
 * Travel is 8px, not the previous 32px. A long slide reads as a template;
 * content that resolves near its final position reads as authored. The
 * distinction matters because this wrapper is the most repeated component
 * on the site.
 */
export function Section({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Set when the section is a link target, e.g. /about#skills. */
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-72px" })
  const reduce = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      id={id}
      // Clears the sticky nav when the section is jumped to by hash.
      style={id ? { scrollMarginTop: "6rem" } : undefined}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export default function PageLayout({
  children,
  title,
  subtitle,
  label,
}: PageLayoutProps) {
  const reduce = useReducedMotion()

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="pt-36">
        {title && (
          <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
            <motion.div
              className="flex flex-col gap-3"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
            >
              {label && <span className="annotate mb-3">{label}</span>}
              <h1 className="display text-balance">{title}</h1>
              {subtitle && (
                <p className="measure text-xl leading-snug text-fg-muted md:text-2xl">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </header>
        )}

        {children}
      </div>
    </div>
  )
}
