"use client"

import Image from "next/image"
import Link from "next/link"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  motion,
  transform,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useCopy, useLocale } from "@/components/LocaleProvider"
import { localizePath } from "@/lib/i18n"
import s from "./SheetStage.module.css"

export interface StageProject {
  slug: string
  title: string
  shortDescription: string
  tags: string[]
  imageSrc?: string | null
}

export interface StageService {
  key: string
  label: string
  href: string
}

interface SheetStageProps {
  projects: StageProject[]
  services: StageService[]
  location: string
  /** Availability line from site settings; omitted when not available. */
  status?: string
}

/** Scroll length of each act, in viewport heights. */
const INTRO = 1
const SHEET = 1
const CONTACT = 1.2

/** How each sheet comes to rest, in degrees. Repeats after six. */
const TILT = [-2.4, 1.7, -1.1, 2.3, -1.8, 1.2]

const two = (n: number) => String(n).padStart(2, "0")

/**
 * A value that follows `source` through keyframes.
 *
 * Deliberately the function form of useTransform. Given the ranges directly,
 * framer-motion hands some properties to a native scroll timeline, and a
 * range that does not start at 0 and end at 1 then runs back to the resting
 * value after its last keyframe.
 */
function useTrack<T extends number | string>(source: MotionValue<number>, input: number[], output: T[]) {
  return useTransform(source, transform(input, output))
}

/**
 * The home hero: a pinned stage on a flat signal field that scroll moves
 * through.
 *
 * At rest the name lies across the bottom as one slab of type, with the
 * project count and the services above it and project artwork tinted into
 * the field. Scrolling pushes that screen off the top, then drops one sheet
 * per project onto the stack, each a little askew like paper thrown on a
 * desk. The last sheet is the contact.
 *
 * Everything that moves is decoration over real content: the services are
 * links at rest, the projects exist again as the grid below the hero, and
 * under reduced motion the stage is a single unpinned screen.
 */
export default function SheetStage({ projects, services, location, status }: SheetStageProps) {
  const copy = useCopy()
  const locale = useLocale()
  // Read after mount, so the server markup and the first client render agree.
  // Until then the stylesheet's own reduced-motion rules hold the stage still.
  const [still, setStill] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setStill(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const n = projects.length
  const total = INTRO + n * SHEET + CONTACT
  const introEnd = INTRO / total
  const f = SHEET / total
  const c = CONTACT / total
  const contactStart = 1 - c
  /** Sheet `i` leaves the bottom edge here; the contact sheet is sheet `n`. */
  const startAt = (i: number) => (i < n ? introEnd + (i - 0.3) * f : contactStart)
  /** ...and has landed here. */
  const landAt = (i: number) => (i < n ? introEnd + (i + 0.55) * f : contactStart + 0.45 * c)

  // The opening screen leaves over the top edge as one piece, and the name
  // tilts further as it goes.
  const introY = useTrack(p, [0, introEnd], ["0svh", "-110svh"])
  const nameTilt = useTrack<number>(p, [0, introEnd], [-2, -7])
  const hintOpacity = useTrack<number>(p, [0, introEnd * 0.15], [1, 0])

  // How many sheets lie on the stack, the contact sheet included. A count
  // rather than a motion value, so React renders once per sheet.
  const landedAt = (v: number) => {
    let count = 0
    while (count <= n && v >= landAt(count)) count++
    return count
  }
  const [landedNow, setLanded] = useState(0)
  const [awayNow, setAway] = useState(false)
  useMotionValueEvent(p, "change", (v) => {
    setLanded(landedAt(v))
    setAway(v > introEnd * 0.5)
  })
  const landed = still ? 0 : landedNow
  /** The opening screen is mostly off the stage: its links leave the tab order. */
  const away = !still && awayNow

  // The longest word sets the size, so a longer name still fits the width.
  const longest = Math.max(...copy.home.heroName.split(/\s+/).map((word) => word.length))
  const reel = projects.flatMap((project) => (project.imageSrc ? [project.imageSrc] : [])).slice(0, 3)

  return (
    <section
      ref={ref}
      className={s.journey}
      data-still={still || undefined}
      style={{ height: `calc(${total + 1} * 100svh)` }}
    >
      {/* Without scripts nothing can advance the stage, so it is not pinned. */}
      <noscript>
        <style>{`.${s.journey}{height:auto!important}`}</style>
      </noscript>
      {/* Remounted when the preference flips, so no half-played value sticks. */}
      <div className={s.stage} key={still ? "still" : "moving"} data-field="signal">
        {/* Project artwork, printed into the field in one colour. */}
        <div className={s.reel} data-count={reel.length} aria-hidden="true">
          {reel.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              style={{ animationDelay: `${i * 7}s` }}
            />
          ))}
        </div>

        <motion.div className={s.intro} style={still ? undefined : { y: introY }} inert={away}>
          {n > 0 && (
            <p className={s.counter} aria-hidden="true">
              {two(n)} <span>{copy.projects.title}</span>
            </p>
          )}

          <div className={s.meta}>
            <ul className={s.services} aria-label={copy.nav.services}>
              {services.map((service) => (
                <li key={service.key}>
                  <Link href={service.href}>{service.label}</Link>
                </li>
              ))}
            </ul>
            <p className={s.status}>
              {status && (
                <span>
                  <i aria-hidden="true" />
                  {status}
                </span>
              )}
              <span>{location}</span>
            </p>
          </div>

          <motion.div className={s.lockup} style={still ? undefined : { rotate: nameTilt }}>
            {copy.home.heroHeadline !== copy.home.heroName && (
              <p className={s.company}>{copy.home.heroHeadline}</p>
            )}
            <h1 className={s.name} style={{ "--chars": longest } as React.CSSProperties}>
              {copy.home.heroName}
              <span className="sr-only">: {copy.home.heroOffer}</span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Decorative: the same projects are the grid under "Selected work". */}
        <div className={s.sheets} aria-hidden="true">
          {projects.map((project, i) => (
            <Sheet
              key={project.slug}
              index={i}
              progress={p}
              from={startAt(i)}
              to={landAt(i)}
              // Three sheets down nothing shows any more.
              buried={landed - i > 3}
            >
              <div className={s.sheetHead}>
                <span className={s.sheetNo}>
                  {two(i + 1)}
                  <small>/{two(n)}</small>
                </span>
                <span className={s.sheetTitle}>{project.title}</span>
                <Link
                  href={localizePath(`/projects/${project.slug}`, locale)}
                  tabIndex={-1}
                  className={s.sheetLink}
                >
                  {copy.home.viewProject}
                  <ArrowRight className="h-[0.9em] w-[0.9em]" />
                </Link>
              </div>
              <div className={s.frame}>
                <span>viewport</span>
                <span>1440 × 900</span>
                <div className={s.frame}>
                  <span>[16:10]</span>
                  <span>1280 × 800</span>
                  <div className={s.shot}>
                    {project.imageSrc ? (
                      <Image src={project.imageSrc} alt="" fill sizes="(min-width: 1024px) 960px, 90vw" />
                    ) : (
                      <span>{two(i + 1)}</span>
                    )}
                  </div>
                </div>
              </div>
              <p className={s.sheetText}>
                {project.tags[0] && <span>{project.tags[0]}</span>}
                {project.shortDescription}
              </p>
            </Sheet>
          ))}
        </div>

        {/* The last sheet is real content: the way to get in touch. */}
        <div className={s.sheets}>
          <Sheet index={n} progress={p} from={startAt(n)} to={landAt(n)} dark inert={landed <= n}>
            <p className={s.askLabel}>{copy.nav.contact}</p>
            <p className={s.ask}>{copy.home.ctaTitle}</p>
            <Link href={localizePath("/contact", locale)} className={s.askLink}>
              {copy.home.ctaButton}
              <ArrowRight className="h-[0.8em] w-[0.8em]" aria-hidden="true" />
            </Link>
          </Sheet>
        </div>

        <motion.p className={s.hint} style={{ opacity: hintOpacity }} aria-hidden="true">
          {copy.common.scroll}
        </motion.p>
      </div>
    </section>
  )
}

/**
 * One sheet of paper: comes up from below the stage, turning as it travels,
 * and stays where it lands.
 */
function Sheet({
  index,
  progress,
  from,
  to,
  dark = false,
  buried = false,
  inert = false,
  children,
}: {
  index: number
  progress: MotionValue<number>
  from: number
  to: number
  /** The contact sheet is ink instead of paper. */
  dark?: boolean
  /** Far enough down the stack to skip painting. */
  buried?: boolean
  inert?: boolean
  children: React.ReactNode
}) {
  const rest = TILT[index % TILT.length]
  // Most of the way quickly, the last stretch slowly: it settles.
  const y = useTrack(progress, [from, from + (to - from) * 0.55, to], ["115svh", "14svh", "0svh"])
  const rotate = useTrack<number>(progress, [from, to], [rest + (rest < 0 ? -9 : 9), rest])

  return (
    <motion.div
      className={s.sheet}
      data-dark={dark || undefined}
      data-buried={buried || undefined}
      inert={inert}
      style={{ y, rotate }}
    >
      {children}
    </motion.div>
  )
}
