"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import type { SiteSettings } from "@/lib/data"
import { copy } from "@/lib/copy"
import ColdStart from "./ColdStart"

/**
 * Loaded on demand, and only once `armed` flips — `dynamic()` fetches on first
 * render, so gating the JSX gates the network request too. On a visit that
 * never arms it (reduced motion, save-data) the renderer is never downloaded.
 */
const MilledBlock = dynamic(() => import("./MilledBlock"), { ssr: false })

interface HeroStageProps {
  settings: SiteSettings
  metrics: readonly { value: string; label: string }[]
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean }
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The hero.
 *
 * Three layers in one box, which is the whole trick: a CSS poster built from
 * the real `.cast` and `.well` material, a WebGL canvas that continues it in
 * three dimensions, and the type. Poster and canvas share the same grid area
 * and cross-fade, so the upgrade cannot shift a single pixel of layout and
 * cannot become a precondition for reading the page.
 *
 * Ordering is deliberate: the text is server-rendered and is the largest
 * contentful paint. The object arrives afterwards, during idle time, and if it
 * never arrives the poster is a finished design rather than a placeholder.
 */
export default function HeroStage({ settings, metrics }: HeroStageProps) {
  const reduce = useReducedMotion()
  const [armed, setArmed] = useState(false)
  const [live, setLive] = useState(false)
  /**
   * True once the object has painted OR has definitively given up. This is what
   * the splash waits on — not `live`, because a machine that cannot run the
   * renderer must not be held on a splash forever.
   */
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSettled(true)
      return
    }

    // A decorative renderer is precisely what a data-saving request means to
    // switch off, so this is honoured rather than merely noted.
    if ((navigator as NavigatorWithConnection).connection?.saveData) {
      setSettled(true)
      return
    }

    // Wait for idle. The object must never compete for main-thread time with
    // hydration or with the paint of the heading it sits behind.
    let idleHandle = 0
    let timeoutHandle = 0
    const arm = () => setArmed(true)

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(arm, { timeout: 1800 })
    } else {
      timeoutHandle = window.setTimeout(arm, 900)
    }

    return () => {
      if (idleHandle) window.cancelIdleCallback(idleHandle)
      if (timeoutHandle) window.clearTimeout(timeoutHandle)
    }
  }, [])

  const handleReady = useCallback(() => {
    setLive(true)
    setSettled(true)
  }, [])
  // Falls back to the poster and unmounts the renderer, so a machine that
  // cannot keep up stops paying for the attempt as well.
  const handleFail = useCallback(() => {
    setLive(false)
    setArmed(false)
    setSettled(true)
  }, [])

  return (
    <section className="hero-stage">
      <ColdStart heroReady={settled} />
      <div className="hero-object" data-live={live ? "true" : "false"} aria-hidden="true">
        <div className="hero-poster">
          <div className="hero-poster-plate cast rim">
            <div className="hero-poster-pocket well" />
          </div>
        </div>
        <div className="hero-canvas-wrap">
          {armed && (
            <MilledBlock
              className="hero-canvas"
              onReady={handleReady}
              onFail={handleFail}
            />
          )}
        </div>
      </div>

      <div className="hero-scrim" aria-hidden="true" />

      {/* .sheet stays the page container; .hero-copy is the column inside it,
          so the copy occupies the left half of the SHEET rather than half of
          the viewport centred. */}
      <div className="sheet relative">
        <div className="hero-copy flex flex-col gap-10">
        <motion.div
          className="flex flex-col gap-5"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        >
          {settings.heroAvailable && (
            <span className="tab self-start">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-signal-bright opacity-40 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-bright" />
              </span>
              <span className="annotate">
                {settings.heroAvailabilityLabel || copy.home.availabilityFallback}
              </span>
            </span>
          )}

          <h1
            className="font-display font-bold leading-[0.94] tracking-tight text-balance"
            style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)" }}
          >
            Seya Weber
          </h1>

          <p className="text-xl text-fg md:text-2xl">
            {settings.currentRole || copy.home.roleFallback}
            {settings.currentEmployer && (
              <span className="text-fg-muted"> · {settings.currentEmployer}</span>
            )}
          </p>

          <p className="measure text-base leading-relaxed text-fg-muted">
            {copy.home.locationLead(
              settings.contactLocation || copy.common.locationFallback
            )}
          </p>
        </motion.div>

        {metrics.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-4"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
          >
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="cast rim flex min-w-[9.5rem] flex-1 flex-col gap-1 p-5"
              >
                <span className="font-display text-3xl font-bold tracking-tight tabular md:text-4xl">
                  {metric.value}
                </span>
                <span className="annotate">{metric.label}</span>
              </div>
            ))}
          </motion.div>
        )}
        </div>
      </div>

      <motion.div
        className="sheet relative mt-14 flex items-center gap-2 text-fg-subtle"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <span className="annotate">{copy.common.scroll}</span>
        <motion.span
          animate={reduce ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.span>
      </motion.div>
    </section>
  )
}
