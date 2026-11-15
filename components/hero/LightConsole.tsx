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
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { useCopy, useLocale } from "@/components/LocaleProvider"
import { localizePath } from "@/lib/i18n"
import { renderKnot } from "./asciiKnot"
import s from "./LightConsole.module.css"

export interface ConsoleProject {
  slug: string
  title: string
  shortDescription: string
  tags: string[]
  imageSrc?: string | null
}

export interface ConsoleService {
  key: string
  label: string
  href: string
}

interface LightConsoleProps {
  projects: ConsoleProject[]
  services: ConsoleService[]
  /** Availability line from site settings; omitted when not available. */
  status?: string
}

/** Scroll length of each act, in viewport heights. */
const INTRO = 1
const LIST = 0.7
const FLIGHT = 1.1
const CONTACT = 1

const KNOT = { cols: 72, rows: 40 }
/** The frame that is server-rendered and shown under reduced motion. */
const KNOT_REST = 1.4

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * A value that follows `source` through keyframes.
 *
 * Deliberately the function form of useTransform. Given the ranges directly,
 * framer-motion hands opacity and filter to a native scroll timeline, and a
 * range that does not start at 0 and end at 1 then runs back to the resting
 * value after its last keyframe: the name faded out and came back.
 */
function useTrack<T extends number | string>(source: MotionValue<number>, input: number[], output: T[]) {
  return useTransform(source, transform(input, output))
}

/**
 * The home hero: a pinned stage that scroll moves through.
 *
 * At rest the name stands in the light with the knot behind it and a glass
 * terminal that lists the services. Scrolling flies through the name, lists
 * the projects in the terminal, then brings each project out of the depth to
 * the centre of the screen, holds it there, and lets it pass. The last act
 * is the contact command.
 *
 * Everything that moves is decoration over real content: the services are
 * links at rest, the projects exist again as the grid below the hero, and
 * under reduced motion the stage is a single unpinned screen.
 */
export default function LightConsole({ projects, services, status }: LightConsoleProps) {
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
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const n = projects.length
  const total = INTRO + (n ? LIST + n * FLIGHT : 0) + CONTACT
  const introEnd = INTRO / total
  const l = n ? LIST / total : 0
  const f = FLIGHT / total
  const c = CONTACT / total
  const listEnd = introEnd + l
  const contactStart = 1 - c

  // ── Act 1: through the name ──────────────────────────────────────
  const nameScale = useTrack(p, [0, introEnd], [1, 3.6])
  const nameOpacity = useTrack(p, [introEnd * 0.4, introEnd * 0.85], [1, 0])
  const nameBlur = useTrack(p, [introEnd * 0.3, introEnd * 0.85], ["blur(0px)", "blur(14px)"])
  const hintOpacity = useTrack(p, [0, introEnd * 0.15], [1, 0])
  const knotScale = useTrack(p, [0, introEnd, contactStart, 1], [1, 1.35, 1.35, 1.15])
  const knotOpacity = useTrack<number>(
    p,
    n ? [0, introEnd, listEnd, contactStart, 1] : [0, introEnd, 1],
    n ? [0.55, 0.9, 0.3, 0.3, 0.75] : [0.55, 0.9, 0.75],
  )

  // ── The terminal: rises, leaves for the flights, returns ─────────
  const termIn = n
    ? [introEnd * 0.25, introEnd, listEnd, listEnd + 0.3 * f, contactStart, contactStart + 0.3 * c]
    : [introEnd * 0.25, introEnd]
  const termY = useTrack(
    p,
    termIn,
    n ? ["0svh", "-22svh", "-22svh", "45svh", "45svh", "-22svh"] : ["0svh", "-22svh"],
  )
  const termOpacity = useTrack<number>(p, termIn, n ? [1, 1, 1, 0, 0, 1] : [1, 1])
  const barOpacity = useTrack<number>(
    p,
    [listEnd + 0.1 * f, listEnd + 0.3 * f, contactStart - 0.05 * f, contactStart + 0.1 * f],
    [0, 1, 1, 0],
  )

  // Discrete steps, so React renders a handful of times across the journey
  // instead of on every scroll frame.
  const stepAt = (v: number) =>
    v >= contactStart - 0.05 * c ? 3 : n && v >= introEnd + 0.5 * l ? 2 : n && v >= introEnd * 0.8 ? 1 : 0
  const activeAt = (v: number) => (n ? Math.min(n - 1, Math.max(0, Math.floor((v - listEnd) / f))) : 0)
  const [step, setStep] = useState(0)
  const [active, setActive] = useState(0)
  // While the projects pass, the terminal is faded out below the stage. Its
  // links must not take focus there, so it is inert for that stretch.
  const [away, setAway] = useState(false)
  useMotionValueEvent(p, "change", (v) => {
    setStep(stepAt(v))
    setActive(activeAt(v))
    setAway(n > 0 && v > listEnd + 0.25 * f && v < contactStart)
  })

  // The longest word sets the size, so a longer name still fits the width.
  const longest = Math.max(...copy.home.heroName.split(/\s+/).map((word) => word.length))
  const lockup = (
    <>
      <h1 className={s.name} style={{ "--chars": longest } as React.CSSProperties}>
        {copy.home.heroName}
        <span className="sr-only">: {copy.home.heroOffer}</span>
      </h1>
      {copy.home.heroHeadline !== copy.home.heroName && (
        <p className={s.company}>{copy.home.heroHeadline}</p>
      )}
    </>
  )
  const boot = (
    <>
      <p aria-hidden="true">
        <span className={s.prompt}>$</span> {copy.home.console.boot}
      </p>
      <ul className={s.services} aria-label={copy.nav.services}>
        {services.map((service) => (
          <li key={service.key}>
            <span className={s.ok} aria-hidden="true">
              ✓
            </span>
            <Link href={service.href} className={s.serviceLink}>
              {service.label}
            </Link>
            <span className={s.leader} aria-hidden="true" />
            <span className={s.ready} aria-hidden="true">
              {copy.home.console.ready}
            </span>
          </li>
        ))}
      </ul>
      {status && (
        <p className={s.status}>
          <span className={s.live} aria-hidden="true" />
          {status}
        </p>
      )}
    </>
  )
  const titleBar = (
    <div className={s.titleBar} aria-hidden="true">
      <span className={s.dots}>
        <i />
        <i />
        <i />
      </span>
      {copy.home.console.title}
    </div>
  )

  const shownStep = still ? 0 : step

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
      <div className={s.stage} key={still ? "still" : "moving"}>
        <Backdrop />

        <motion.div
          className={s.knotWrap}
          style={still ? undefined : { scale: knotScale, opacity: knotOpacity }}
        >
          <Knot animate={!still} progress={p} />
        </motion.div>

        <motion.div
          className={s.lockup}
          style={still ? undefined : { scale: nameScale, opacity: nameOpacity, filter: nameBlur }}
        >
          {lockup}
        </motion.div>

        {/* Decorative: the same projects are the grid under "Selected work". */}
        <div className={s.flights} aria-hidden="true">
          {projects.map((project, i) => (
            <Flight
              key={project.slug}
              project={project}
              index={i}
              count={n}
              progress={p}
              from={listEnd + (i - 0.12) * f}
              to={listEnd + (i + 1.12) * f}
              href={localizePath(`/projects/${project.slug}`, locale)}
            />
          ))}
        </div>

        <div className={s.termDock}>
          <motion.div
            className={s.terminal}
            style={still ? undefined : { y: termY, opacity: termOpacity }}
            inert={!still && away}
          >
            {titleBar}
            <div className={s.termBody}>
              {shownStep < 3 ? (
                <>
                  {boot}
                  {shownStep >= 1 && (
                    <p aria-hidden="true">
                      <span className={s.prompt}>$</span>{" "}
                      <Typed
                        progress={p}
                        from={introEnd * 0.8}
                        to={introEnd + 0.45 * l}
                        text={copy.home.console.list}
                      />
                      {shownStep === 1 && <span className={s.cursor} />}
                    </p>
                  )}
                  {shownStep >= 2 && (
                    <p className={s.listing} aria-hidden="true">
                      {projects.map((project) => (
                        <span key={project.slug}>{project.slug}</span>
                      ))}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p aria-hidden="true">
                    <span className={s.prompt}>$</span>{" "}
                    <Typed
                      progress={p}
                      from={contactStart + 0.25 * c}
                      to={contactStart + 0.45 * c}
                      text={copy.home.console.contact}
                    />
                    <span className={s.cursor} />
                  </p>
                  <p className={s.ask}>{copy.home.ctaTitle}</p>
                  <Link
                    href={localizePath("/contact", locale)}
                    className="control control-primary inline-flex items-center gap-1 self-start py-2.5 pr-4 pl-5 font-sans text-sm"
                  >
                    {copy.home.ctaButton}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {n > 0 && (
          <motion.div className={s.bar} style={{ opacity: barOpacity }} aria-hidden="true">
            <span>
              <span className={s.prompt}>$</span>{" "}
              <Typed
                progress={p}
                from={listEnd + (active + 0.02) * f}
                to={listEnd + (active + 0.3) * f}
                text={copy.home.console.open(projects[active].slug)}
              />
              <span className={s.cursor} />
            </span>
            <span className={s.count}>
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </motion.div>
        )}

        <motion.p className={s.hint} style={{ opacity: hintOpacity }} aria-hidden="true">
          {copy.common.scroll}
        </motion.p>
      </div>
    </section>
  )
}

/** Beams, floor grid and the glow the name stands in. CSS only. */
function Backdrop() {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <div className={s.beams} />
      <div className={s.core} />
      <div className={s.floor} />
    </div>
  )
}

function Knot({ animate, progress }: { animate: boolean; progress?: MotionValue<number> }) {
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !animate) return
    const small = window.matchMedia("(max-width: 640px)").matches
    const options = { ...KNOT, steps: small ? 440 : 640, ring: small ? 14 : 18 }
    let frame = 0
    let last = 0
    let start = 0
    let onScreen = true
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    observer.observe(el)
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      // About 30 frames a second is plenty for characters, and nothing is
      // drawn while the stage is off screen or the tab is hidden.
      if (!onScreen || document.hidden || now - last < 32) return
      if (!start) start = now
      last = now
      const v = clamp01((progress?.get() ?? 0) * 1.15)
      const morph = 0.5 - 0.5 * Math.cos(Math.PI * v)
      el.textContent = renderKnot(KNOT_REST + (now - start) / 1000, morph, options)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [animate, progress])

  return (
    <pre ref={ref} className={s.knot} aria-hidden="true" suppressHydrationWarning>
      {renderKnot(KNOT_REST, 0, KNOT)}
    </pre>
  )
}

/** Text that types itself as scroll moves from `from` to `to`. */
function Typed({
  progress,
  from,
  to,
  text,
}: {
  progress: MotionValue<number>
  from: number
  to: number
  text: string
}) {
  const count = (v: number) => Math.round(clamp01((v - from) / (to - from)) * text.length)
  const [shown, setShown] = useState(() => count(progress.get()))
  useMotionValueEvent(progress, "change", (v) => setShown(count(v)))
  useEffect(() => {
    setShown(count(progress.get()))
    // `count` closes over exactly these three.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, text])
  return <>{text.slice(0, shown)}</>
}

/**
 * One project on its way past the camera: out of the depth, held large in
 * the centre long enough to read, then on past the viewer.
 */
function Flight({
  project,
  index,
  count,
  progress,
  from,
  to,
  href,
}: {
  project: ConsoleProject
  index: number
  count: number
  progress: MotionValue<number>
  from: number
  to: number
  href: string
}) {
  const side = index % 2 === 0 ? 1 : -1
  const q = useTrack<number>(progress, [from, to], [0, 1])
  const z = useTrack(q, [0, 0.36, 0.7, 1], [-2400, 0, 30, 900])
  const x = useTrack(q, [0, 0.36, 0.7, 1], [`${side * 55}%`, "0%", "0%", `${-side * 85}%`])
  const y = useTrack(q, [0, 0.36], ["-10%", "0%"])
  const rotateY = useTrack(q, [0, 0.36, 0.7, 1], [side * -32, 0, 0, side * 26])
  const opacity = useTrack(q, [0, 0.12, 0.72, 0.94], [0, 1, 1, 0])
  const pointerEvents = useTransform(q, (v) => (v > 0.3 && v < 0.75 ? "auto" : "none"))
  const label = String(index + 1).padStart(2, "0")

  return (
    <div className={s.slot}>
      <motion.div className={s.card} style={{ z, x, y, rotateY, opacity, pointerEvents }}>
        <Link href={href} tabIndex={-1} className={s.cardLink}>
          <span className={s.cardImage}>
            {project.imageSrc ? (
              <Image src={project.imageSrc} alt="" fill sizes="(min-width: 768px) 640px, 90vw" />
            ) : (
              <span className={s.cardIndex}>{label}</span>
            )}
          </span>
          <span className={s.cardCopy}>
            <span className={s.cardMeta}>
              <span>
                {label} / {String(count).padStart(2, "0")}
                {project.tags[0] ? ` · ${project.tags[0]}` : ""}
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <span className={s.cardTitle}>{project.title}</span>
            <span className={s.cardText}>{project.shortDescription}</span>
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
