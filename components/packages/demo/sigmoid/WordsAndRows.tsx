"use client"

import { useEffect, useRef } from "react"
import { reveal, splitText } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.words

/** A headline whose words arrive one after another, driven by splitText() and reveal(). */
export function SplitHeadline() {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const split = splitText(ref.current)
    const c = reveal(split.elements, { subject: split.parent, keyframes: "fade-up", stagger: 6, range: "entry 0% cover 45%" })
    return () => {
      c.cancel()
      split.revert()
    }
  }, [])

  return (
    <h3 ref={ref} className="display text-balance text-4xl md:text-6xl">
      {t.headline}
    </h3>
  )
}

/** Cards in a horizontal scroll container, revealed on the inline axis. */
export function HorizontalGallery() {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const cards = ref.current ? Array.from(ref.current.children) : []
    const c = reveal(cards, { axis: "inline", keyframes: "scale-in", range: "entry 0% cover 40%" })
    return () => c.cancel()
  }, [])

  return (
    <ul
      ref={ref}
      tabIndex={0}
      aria-label={t.galleryLabel}
      className="flex snap-x gap-4 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
    >
      {t.cards.map((c, i) => (
        <li key={c.title} className="cast flex h-56 w-64 shrink-0 snap-start flex-col justify-between p-6">
          <p className="annotate">{String(i + 1).padStart(2, "0")}</p>
          <div>
            <p className="text-xl text-fg">{c.title}</p>
            <p className="mt-1 text-sm text-fg-muted">{c.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
