"use client"

import { useEffect, useRef } from "react"
import { copy } from "@/lib/copy"

interface ColdStartProps {
  /**
   * True once the hero renderer has painted, or has definitively given up.
   * This is the gate that matters: without it the first thing a visitor sees is
   * the CSS poster being swapped for the WebGL object.
   */
  heroReady: boolean
}

/**
 * Whether the splash has already played in THIS document.
 *
 * Module scope on purpose, and deliberately not `sessionStorage`. A session flag
 * was the first attempt and it was wrong: on a reload the hero has to fetch its
 * chunk and render again, so the poster-to-object swap is visible again — which
 * is the exact thing the splash exists to cover. Gating per session meant the
 * splash protected only the first load of a session and then stopped doing its
 * job.
 *
 * A module variable has precisely the right lifetime instead. It resets when the
 * document loads, so the splash plays on every real page load; and it survives a
 * client-side navigation, so it does NOT replay when someone browses to /about
 * and back, where nothing is being loaded and a splash would be pure obstruction.
 *
 * On the server this stays false for every request — it is only ever written from
 * an effect — so the server-rendered markup always contains the splash and
 * hydration cannot mismatch.
 */
let playedThisPageLoad = false

/** Below this a splash reads as a flicker rather than as a deliberate beat. */
const MIN_MS = 900
/** Above this it stops being a splash and becomes a wait. Never exceeded. */
const MAX_MS = 4500
/** Must match the transition duration on .cold-start in globals.css. */
const EXIT_MS = 620

/**
 * The entry beat.
 *
 * It exists for a concrete reason rather than for drama. The hero's renderer is
 * a lazy chunk that arrives after hydration, so for the first second the page
 * shows a CSS poster and then swaps it for the real object — and that swap was
 * visible. This holds the frame until the fonts, the page load and the renderer
 * have all settled, so the swap happens behind it and is never seen.
 *
 * Which is also why the progress it reports is real. Three gates, a third each:
 * `document.fonts.ready`, the window `load` event, and the hero. It is not a
 * fake bar animating to 100 on a timer.
 *
 * Three ways out, and it can never trap anyone:
 * - all three gates settle (the normal path),
 * - MAX_MS elapses regardless,
 * - or it never runs at all: reduced motion or no JavaScript, both handled in
 *   CSS so neither can flash the overlay first.
 *
 * It plays once per document load — see `playedThisPageLoad`.
 */
export default function ColdStart({ heroReady }: ColdStartProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  // Read inside the loop rather than through a dependency, so the effect runs
  // exactly once and the animation is never restarted by a parent re-render.
  const heroReadyRef = useRef(heroReady)
  heroReadyRef.current = heroReady

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // A CSS rule already removes the splash under reduced motion before first
    // paint; this is the belt to that braces. The page-load check is what stops
    // a client-side navigation back to the homepage from replaying it.
    if (
      playedThisPageLoad ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.dataset.phase = "gone"
      return
    }

    const started = performance.now()
    const gates = { fonts: false, load: false, hero: false }
    let shown = 0
    let raf = 0
    let exiting = false
    let exitTimer = 0

    document.fonts.ready.then(() => {
      gates.fonts = true
    })

    if (document.readyState === "complete") gates.load = true
    const onLoad = () => {
      gates.load = true
    }
    window.addEventListener("load", onLoad)

    const paint = (value: number, complete: boolean) => {
      const pct = Math.round(Math.min(value, 1) * 100)
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${(pct / 100).toFixed(3)})`
      }
      if (countRef.current) countRef.current.textContent = String(pct).padStart(3, "0")
      if (labelRef.current) {
        labelRef.current.textContent = complete
          ? copy.coldStart.ready
          : copy.coldStart.label
      }
    }

    const tick = (now: number) => {
      const elapsed = now - started
      gates.hero = heroReadyRef.current

      const settled = (gates.fonts ? 1 : 0) + (gates.load ? 1 : 0) + (gates.hero ? 1 : 0)
      const timedOut = elapsed >= MAX_MS
      const complete = (settled === 3 && elapsed >= MIN_MS) || timedOut

      // Ease toward the real figure rather than jumping, so a gate settling does
      // not make the counter lurch.
      shown += ((complete ? 1 : settled / 3) - shown) * 0.12
      paint(shown, complete)

      if (complete && shown > 0.985) {
        if (!exiting) {
          exiting = true
          paint(1, true)
          root.dataset.phase = "leaving"
          // Set at the exit rather than at the start, so React strict mode's
          // mount → cleanup → mount can still play it.
          playedThisPageLoad = true
          exitTimer = window.setTimeout(() => {
            root.dataset.phase = "gone"
          }, EXIT_MS)
        }
        return
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (exitTimer) clearTimeout(exitTimer)
      window.removeEventListener("load", onLoad)
    }
  }, [])

  return (
    <>
      {/* Without JavaScript nothing would ever take this down, and it covers
          the whole page. The style element is the only thing standing between
          a no-JS visitor and a blank screen. */}
      <noscript>
        <style>{`.cold-start{display:none!important}`}</style>
      </noscript>
      <div
        ref={rootRef}
        className="cold-start"
        // "gone" from the outset when this document has already played it, so a
        // client-side navigation back to the homepage renders nothing rather
        // than an overlay that an effect then removes a frame later. During
        // hydration of a fresh document the flag is still false, so this matches
        // what the server rendered.
        data-phase={playedThisPageLoad ? "gone" : "running"}
        // Decorative: the page underneath is already complete and announced.
        aria-hidden="true"
      >
        <div className="cold-start-frame">
          <span className="cold-start-rule cold-start-rule-top" />
          <span className="cold-start-rule cold-start-rule-bottom" />
          <span className="cold-start-rule cold-start-rule-left" />

          <div className="cold-start-body">
            <span className="cold-start-name">Seya Weber</span>
            <div className="cold-start-meter">
              <span ref={labelRef} className="annotate">
                {copy.coldStart.label}
              </span>
              <span className="cold-start-track">
                <span ref={fillRef} className="cold-start-fill" />
              </span>
              <span ref={countRef} className="annotate tabular">
                000
              </span>
              <span className="annotate">%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
