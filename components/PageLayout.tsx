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

export function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 32 }
      }
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export default function PageLayout({ children, title, subtitle, label }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-32">
        {title && (
          <section className="max-w-[1200px] mx-auto px-6 pb-16 md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              {label && (
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  {label}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </section>
        )}

        <div>{children}</div>
      </div>
    </div>
  )
}
