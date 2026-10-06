"use client"

import { useEffect, useRef, useState } from "react"
import { draggable, nearest, projectRest } from "@sweberdev/lagrangian"
import { lagrangianDemo } from "@/lib/demo/lagrangian-copy"

const t = lagrangianDemo.throwing
const GAP = 12

/** A strip of cards that snaps, and a puck that only has walls. */
export function ThrowDeck() {
  const frame = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const puck = useRef<HTMLDivElement>(null)
  const [deck, setDeck] = useState<{ velocity: number; card: number } | null>(null)
  const [free, setFree] = useState<number | null>(null)

  useEffect(() => {
    const f = frame.current
    const s = strip.current
    const b = box.current
    const p = puck.current
    if (!f || !s || !b || !p) return
    const count = t.cards.length
    // One card is 70 % of the frame, so the next one peeks in.
    const step = () => f.clientWidth * 0.7 + GAP
    const points = () => Array.from({ length: count }, (_, i) => -i * step())
    for (const card of s.children) (card as HTMLElement).style.width = `${f.clientWidth * 0.7}px`

    const cards = draggable(s, {
      axis: "x",
      bounds: () => ({ left: -(count - 1) * step(), right: 0 }),
      snap: { x: (rest) => nearest(points(), rest) },
      onEnd: ({ velocityX, x }) => {
        const target = nearest(points(), projectRest(x, velocityX))
        setDeck({ velocity: velocityX, card: Math.round(-target / step()) })
      },
    })
    const thrown = draggable(p, {
      bounds: b,
      onEnd: ({ velocityX, velocityY }) => setFree(Math.hypot(velocityX, velocityY)),
    })
    const onResize = () => {
      for (const card of s.children) (card as HTMLElement).style.width = `${f.clientWidth * 0.7}px`
      cards.x.jump(nearest(points(), cards.x.get()))
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      cards.destroy()
      thrown.destroy()
    }
  }, [])

  const speed = (v: number) => `${Math.round(Math.abs(v)).toLocaleString("en")} px/s`

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="annotate">{t.deckLabel}</p>
        <div ref={frame} className="well overflow-hidden p-4">
          <div ref={strip} className="flex cursor-grab touch-pan-y select-none active:cursor-grabbing" style={{ gap: GAP }}>
            {t.cards.map((name, i) => (
              <div key={name} className="cast flex h-48 shrink-0 flex-col justify-between p-5">
                <span className="annotate">0{i + 1}</span>
                <span className="display text-3xl md:text-4xl">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="min-h-5 text-sm text-fg-muted" aria-live="polite">
          {deck ? (
            <>
              {t.released} <span className="font-mono text-fg">{speed(deck.velocity)}</span>, {t.landed}{" "}
              <span className="text-fg">{t.cards[deck.card]}</span>
            </>
          ) : (
            t.hint
          )}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <p className="annotate">{t.puckLabel}</p>
        <div ref={box} className="well relative h-[17rem] overflow-hidden">
          <div
            ref={puck}
            className="absolute top-6 left-6 size-16 cursor-grab touch-none rounded-full bg-fg shadow-lg select-none active:cursor-grabbing"
          />
        </div>
        <p className="min-h-5 text-sm text-fg-muted" aria-live="polite">
          {free !== null ? (
            <>
              {t.released} <span className="font-mono text-fg">{speed(free)}</span>
            </>
          ) : (
            t.hint
          )}
        </p>
      </div>
    </div>
  )
}
