"use client"

import type React from "react"
import Navigation from "./Navigation"
import { motion, useInView, useReducedMotion, useScroll } from "framer-motion"
import { useRef } from "react"
import InkScene from "./hero/InkScene"
import { useScrollSpeed, useStill } from "./hero/motion"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  label?: string
  /** "portfolio" puts the page in the portfolio's own colours and type and
   *  opens it on the night scene (see globals.css). Package pages leave it
   *  out; their layout sets the quieter "packages" look. */
  site?: "portfolio"
  /** An opening of the page's own, set on the night scene in place of the
   *  title block. */
  opening?: React.ReactNode
  /** The page ends on its own invitation to get in touch, so the footer
   *  leaves its large one out. */
  ownAsk?: boolean
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

/**
 * A page's opening on the night scene of the home stage, at a smaller
 * size. The bar sits on the scene for as long as it is under it.
 */
function StagedOpening({ children }: { children: React.ReactNode }) {
  const stage = useRef<HTMLElement>(null)
  const onStage = useInView(stage, { margin: "0px 0px -90% 0px", initial: true })
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end start"] })
  const speed = useScrollSpeed()
  const still = useStill()

  return (
    <>
      <Navigation overlay={onStage} />
      <header ref={stage} className="page-stage" data-field="signal">
        <InkScene className="page-stage-scene" progress={scrollYProgress} velocity={speed} still={still} />
        <div className="sheet">{children}</div>
      </header>
    </>
  )
}

export default function PageLayout({
  children,
  title,
  subtitle,
  label,
  site,
  opening,
  ownAsk,
}: PageLayoutProps) {
  const reduce = useReducedMotion()
  // Portfolio pages open on the night scene of the home stage.
  const staged = Boolean(opening) || (site === "portfolio" && Boolean(title))

  const heading = (
    <motion.div
      className="flex flex-col gap-3"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
    >
      {label && <span className={staged ? "block-label mb-3" : "annotate mb-3"}>{label}</span>}
      <h1 className="display text-balance">{title}</h1>
      {subtitle && (
        <p className="measure text-xl leading-snug text-fg-muted md:text-2xl">{subtitle}</p>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-ground" data-site={site} data-own-ask={ownAsk ? "" : undefined}>
      {staged ? (
        <>
          <StagedOpening>{opening ?? heading}</StagedOpening>
          <div className="pt-16 md:pt-24">{children}</div>
        </>
      ) : (
        <div className="pt-36">
          <Navigation />
          {title && <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">{heading}</header>}

          {children}
        </div>
      )}
    </div>
  )
}
