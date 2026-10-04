"use client"

import type React from "react"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

const EASE = [0.23, 1, 0.32, 1] as const

interface BlockProps {
  /** Short name in the left column, e.g. "Work". */
  label: string
  /** White lead line of the heading. */
  title: React.ReactNode
  /** Grey follow-up line of the heading. */
  sub?: React.ReactNode
  /** Paragraph under the heading, in the right column. */
  lede?: React.ReactNode
  /** Content below the head, full sheet width. */
  children?: React.ReactNode
  /** Extra content in the right column, under the lede (e.g. a link). */
  aside?: React.ReactNode
  id?: string
  /** Drops the top rule, for the first block under a hero. */
  flush?: boolean
}

/**
 * The page section: hairline on top, label on the left, a two-tone heading
 * on the right, and whatever the section holds underneath.
 */
export function Block({ label, title, sub, lede, children, aside, id, flush }: BlockProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-72px" })
  const reduce = useReducedMotion()

  return (
    <section
      ref={ref}
      id={id}
      style={id ? { scrollMarginTop: "6rem" } : undefined}
      className={flush ? "py-18 md:py-24" : "block"}
    >
      <motion.div
        className="sheet"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        <div className="block-head">
          <p className="block-label">{label}</p>
          <div className="flex flex-col gap-6">
            <h2 className="headline">
              {title}
              {sub && <span className="headline-sub">{sub}</span>}
            </h2>
            {lede && <div className="lede flex flex-col gap-4">{lede}</div>}
            {aside}
          </div>
        </div>
        {children && <div className="mt-12 md:mt-16">{children}</div>}
      </motion.div>
    </section>
  )
}
