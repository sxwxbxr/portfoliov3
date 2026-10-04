"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import type { SiteSettings } from "@/lib/data"
import { copy } from "@/lib/copy"
import { Ruler } from "./Ruler"

const EASE = [0.23, 1, 0.32, 1] as const

interface HeroProps {
  settings: SiteSettings
  metrics: readonly { value: string; label: string }[]
  /** Labels for the upper ruler, oldest first. */
  years: readonly string[]
  /** Labels for the lower ruler. */
  skills: readonly string[]
}

/**
 * Name and role at the top, then two measuring strips with the tagline set
 * between them. The heading is server-rendered text and paints first; the
 * strips are decoration and carry nothing the copy does not also say.
 */
export default function Hero({ settings, metrics, years, skills }: HeroProps) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  })

  return (
    <section className="pt-36">
      <motion.div className="sheet flex flex-col gap-8 pt-8 md:pt-14" {...rise(0.05)}>
        {settings.heroAvailable && (
          <span className="tab self-start text-xs text-fg-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-50 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            {settings.heroAvailabilityLabel || copy.home.availabilityFallback}
          </span>
        )}

        <div className="flex flex-col gap-1">
          <h1 className="display">Seya Weber</h1>
          <p className="display text-fg-muted">
            {settings.currentRole || copy.home.roleFallback}
          </p>
        </div>

        <p className="measure lede">
          {copy.home.locationLead(settings.contactLocation || copy.common.locationFallback)}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="control control-primary inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
          >
            {copy.nav.contact}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link href="/projects" className="control inline-flex items-center px-5 py-2.5 text-sm">
            {copy.projects.allProjects}
          </Link>
        </div>
      </motion.div>

      <motion.div className="mt-20 md:mt-28" {...rise(0.2)}>
        <Ruler labels={years} initial={years.length - 1} labelSide="bottom" interval={2600} />

        <p className="headline py-14 text-center md:py-20 md:text-[2.5rem]">
          {copy.home.heroTaglineLead}
          <span className="headline-sub">{copy.home.heroTaglineSub}</span>
        </p>

        <Ruler labels={skills} labelSide="top" interval={2000} />
      </motion.div>

      {metrics.length > 0 && (
        <motion.div className="sheet mt-20 md:mt-28" {...rise(0.3)}>
          <dl className="grid grid-cols-1 divide-y divide-edge-soft border-y border-edge-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-1 py-6 sm:px-6 sm:first:pl-0">
                <dt className="annotate order-2">{metric.label}</dt>
                <dd className="order-1 text-3xl tracking-tight tabular">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      )}
    </section>
  )
}
