"use client"

import Link from "next/link"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useCopy, useLocale } from "@/components/LocaleProvider"
import { smoothScroll } from "@/components/SmoothScroll"
import { localizePath } from "@/lib/i18n"
import JourneyScene from "./JourneyScene"
import { flight, presence, progressAt, route as planRoute, type Route } from "./journey"
import type { LandmarkKind } from "./landmarks"
import { useScrollSpeed, useStill } from "./motion"
import { NameSlab } from "./NameSlab"
import s from "./JourneyStage.module.css"

export interface StageService {
  key: string
  label: string
  href: string
}

/** One stop of the flight: a landmark in the landscape and the card shown with it. */
export interface JourneyStation {
  key: string
  kind: LandmarkKind
  /** Height of a pagoda. */
  floors?: number
  label: string
  title: string
  children: React.ReactNode
}

interface JourneyStageProps {
  stations: JourneyStation[]
  services: StageService[]
  location: string
  /** Availability line from site settings; omitted when not available. */
  status?: string
  email: string
  /** Small links under the invitation: the footer cannot be scrolled to while the page loops. */
  legal: { label: string; href: string }[]
}

const two = (n: number) => String(n).padStart(2, "0")
const REST = [-1.6, 1.3, -0.9, 1.7, -1.2, 1]

/**
 * The home page: a pinned stage in front of a drawn scene that scroll
 * flies through (see JourneyScene and journey.ts).
 *
 * It opens above a sea of clouds with the name across the bottom. Scrolling
 * sinks through the clouds and flies low over a landscape. At each landmark
 * a sheet of paper comes up with one piece of the page: the services, each
 * project, the person, the career, the questions. At the end stands a
 * shrine gate with the invitation to get in touch. Flying through it climbs
 * back above the clouds, where the picture is the opening one, and the
 * scroll starts over.
 *
 * All of it is real content in reading order. A sheet that is not on the
 * stage can still be focused, and focusing it flies there. Under reduced
 * motion, and without scripts, the stage is not pinned and the sheets
 * simply follow each other down the page.
 */
export default function JourneyStage({
  stations,
  services,
  location,
  status,
  email,
  legal,
}: JourneyStageProps) {
  const copy = useCopy()
  const locale = useLocale()
  const still = useStill()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const count = stations.length
  const route = useMemo(() => planRoute(count), [count])
  const scene = useMemo(() => stations.map(({ kind, floors }) => ({ kind, floors })), [stations])

  // The opening screen leaves over the top as the camera sinks, and comes
  // back the same way once it has climbed out again.
  const leave = 1 / route.total
  const back = 1 - 0.75 / route.total
  const introAt = (v: number) => (v < 0.5 ? Math.min(1, v / leave) : Math.max(0, 1 - (v - back) / (1 - back - 0.04 / route.total)))
  const introY = useTransform(p, (v) => `${-110 * Math.min(1, Math.max(0, introAt(v)))}svh`)
  const nameTilt = useTransform(p, (v) => -2 - 5 * Math.min(1, Math.max(0, introAt(v))))
  const hintOpacity = useTransform(p, (v) => 1 - Math.min(1, introAt(v) / 0.15))

  // How fast the page is moving, eased. The scene streaks with it and
  // everything on the stage leans into the direction of travel.
  const speed = useScrollSpeed()
  const lean = useTransform(speed, (v) => Math.max(-2.4, Math.min(2.4, v / 700)))
  const nameLean = useTransform(speed, (v) => Math.max(-10, Math.min(10, v / -160)))

  const [awayNow, setAway] = useState(false)
  useMotionValueEvent(p, "change", (v) => setAway(introAt(v) > 0.5))
  /** The opening screen is mostly off the stage: its links leave the tab order. */
  const away = !still && awayNow

  // The shrine's invitation: up from below, then flown through.
  const gate = useTransform(p, (v) => presence(route.shrine - flight(v, route).z, 15.5, 6.5))
  const gateY = useTransform(gate, (q) => `${q < 0 ? -q * 70 : 0}svh`)
  // Passed on the left, so it never lies across the gate as that fills the frame.
  const gateX = useTransform(gate, (q) => `${q > 0 ? -q * 45 : 0}vw`)
  const gateScale = useTransform(gate, (q) => (q > 0 ? 1 + q * 0.25 : 1))
  const gateOpacity = useTransform(gate, (q) => 1 - Math.abs(q))
  const gateShown = useTransform(gate, (q) => (Math.abs(q) >= 1 ? "hidden" : "visible"))

  /** Scroll so that the landmark at `z` is `distance` ahead. */
  const flyTo = (z: number, distance: number) => {
    const section = ref.current
    if (!section || still) return
    const top = section.offsetTop + progressAt(z, distance, route) * (section.offsetHeight - window.innerHeight)
    if (smoothScroll.current) smoothScroll.current.scrollTo(top)
    else window.scrollTo({ top, behavior: "smooth" })
  }

  // The loop: the last picture is the first one, so reaching the end by
  // scrolling starts the page over. Arriving any other way (a jump to the
  // footer, focus moving into it) leaves the page alone.
  useEffect(() => {
    if (still) return
    let last = window.scrollY
    const onScroll = () => {
      const section = ref.current
      if (!section) return
      const y = window.scrollY
      const start = section.offsetTop
      const end = start + section.offsetHeight - window.innerHeight
      if (y >= end - 1 && last < end - 1 && last > end - window.innerHeight) {
        if (smoothScroll.current) smoothScroll.current.scrollTo(start, { immediate: true, force: true })
        else window.scrollTo(0, start)
        last = start
        return
      }
      last = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [still])

  return (
    <section
      ref={ref}
      className={s.journey}
      data-still={still || undefined}
      style={{ height: `calc(${route.total + 1} * 100svh)` }}
    >
      {/* Without scripts nothing can advance the stage: it reads as a page. */}
      <noscript>
        <style>{`.${s.journey}{height:auto!important}.${s.stage}{position:relative;height:auto;overflow:visible}.${s.scene}{height:100svh}.${s.intro}{min-height:calc(100svh - 6.75rem)}.${s.cards}{position:static;display:grid;gap:1rem;padding:3rem 0}.${s.card},.${s.shrine}{position:static;translate:none;transform:none!important;opacity:1!important;visibility:visible!important;width:auto;max-width:none}.${s.shrine}{padding:3rem 0 5rem}.${s.hint}{display:none}`}</style>
      </noscript>
      {/* Remounted when the preference flips, so no half-played value sticks. */}
      <div className={s.stage} key={still ? "still" : "moving"} data-field="signal">
        <JourneyScene className={s.scene} progress={p} velocity={speed} still={still} route={route} stations={scene} />

        <motion.div className={s.intro} style={still ? undefined : { y: introY }} inert={away}>
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

          <motion.div className={s.lockup} style={still ? undefined : { rotate: nameTilt, skewX: nameLean }}>
            <NameSlab as="h1" name={copy.home.heroName} company={copy.home.heroHeadline}>
              <span className="sr-only">: {copy.home.heroOffer}</span>
            </NameSlab>
          </motion.div>
        </motion.div>

        <div className={s.cards}>
          {stations.map((station, i) => (
            <Card
              key={station.key}
              index={i}
              count={count}
              station={station}
              progress={p}
              route={route}
              lean={lean}
              still={still}
              onFocus={() => flyTo(route.stations[i], 9)}
            />
          ))}
        </div>

        <motion.div
          className={s.shrine}
          style={still ? undefined : { x: gateX, y: gateY, scale: gateScale, opacity: gateOpacity, visibility: gateShown }}
        >
          <p className={s.askLabel}>{copy.home.ctaEyebrow}</p>
          <h2 className={s.ask}>{copy.home.ctaTitle}</h2>
          <p className={s.askLinks}>
            <Link href={localizePath("/contact", locale)}>
              {copy.home.ctaButton}
              <ArrowRight className="h-[0.8em] w-[0.8em]" aria-hidden="true" />
            </Link>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
          <ul className={s.legal}>
            {legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.p className={s.hint} style={{ opacity: hintOpacity }} aria-hidden="true">
          {copy.common.scroll}
        </motion.p>
      </div>
    </section>
  )
}

/**
 * The sheet for one station: comes up from below as its landmark nears,
 * lies there while the landmark is in view, and is carried off over the top
 * as the camera passes.
 */
function Card({
  index,
  count,
  station,
  progress,
  route,
  lean,
  still,
  onFocus,
}: {
  index: number
  count: number
  station: JourneyStation
  progress: MotionValue<number>
  route: Route
  /** Skew from the scroll speed, in degrees. */
  lean: MotionValue<number>
  still: boolean
  onFocus: () => void
}) {
  const rest = REST[index % REST.length]
  const q = useTransform(progress, (v) => presence(route.stations[index] - flight(v, route).z))
  const y = useTransform(q, (v) => `${v < 0 ? -v * 95 : -v * 115}svh`)
  const rotate = useTransform(q, (v) => rest + (v < 0 ? v * -7 : v * -10))

  return (
    <motion.article
      className={s.card}
      style={still ? undefined : { y, rotate, skewY: lean }}
      // Reached by keyboard while off the stage: fly there.
      onFocusCapture={() => {
        if (Math.abs(q.get()) > 0.5) onFocus()
      }}
    >
      <header className={s.cardHead}>
        <span className={s.cardNo} aria-hidden="true">
          {two(index + 1)}
          <small>/{two(count)}</small>
        </span>
        <p className={s.cardLabel}>{station.label}</p>
      </header>
      <h2 className={s.cardTitle}>{station.title}</h2>
      <div className={s.cardBody}>{station.children}</div>
    </motion.article>
  )
}
