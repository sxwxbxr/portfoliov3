"use client"

import { useEffect, useId, useRef, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { ease, presets, reveal, type PresetName } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.reveal
const NAMES = Object.keys(presets) as PresetName[]
const CURVES = ["out", "bouncy", "wobbly", "sigmoid", "smooth"] as const
type Curve = (typeof CURVES)[number]

export function RevealGallery() {
  const [curve, setCurve] = useState<Curve>("bouncy")
  const [fallback, setFallback] = useState(false)
  const [stagger, setStagger] = useState(true)
  const staggerId = useId()
  const [native, setNative] = useState<boolean | null>(null)
  const cards = useRef<(HTMLLIElement | null)[]>([])
  const curveId = useId()
  const fallbackId = useId()

  useEffect(() => {
    const controllers = cards.current.map((el, i) =>
      // Cards in one row share a stagger index, so each row arrives left to right.
      reveal(el, { keyframes: NAMES[i], easing: ease[curve], fallback, shift: stagger ? (i % 4) * 8 : 0 })
    )
    setNative(controllers[0]?.animations.length ? controllers[0].native : null)
    return () => controllers.forEach((c) => c.cancel())
  }, [curve, fallback, stagger])

  const code = `reveal(".card", {\n  keyframes: "scale-in",\n  range: "entry 0% cover 40%",\n  easing: ease.${curve},${stagger ? "\n  stagger: 8," : ""}${fallback ? "\n  fallback: true," : ""}\n})`

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={curveId} className="text-sm text-fg">
            {t.easing}
          </label>
          <select
            id={curveId}
            value={curve}
            onChange={(e) => setCurve(e.target.value as Curve)}
            className="control px-3 py-2 text-sm"
          >
            {CURVES.map((c) => (
              <option key={c} value={c}>
                ease.{c}
              </option>
            ))}
          </select>
        </div>
        <label htmlFor={staggerId} className="flex items-center gap-2.5 py-2 text-sm text-fg">
          <input
            id={staggerId}
            type="checkbox"
            checked={stagger}
            onChange={(e) => setStagger(e.target.checked)}
            className="h-4 w-4 accent-[var(--signal)]"
          />
          {t.stagger}
        </label>
        <label htmlFor={fallbackId} className="flex items-center gap-2.5 py-2 text-sm text-fg">
          <input
            id={fallbackId}
            type="checkbox"
            checked={fallback}
            onChange={(e) => setFallback(e.target.checked)}
            className="h-4 w-4 accent-[var(--signal)]"
          />
          {t.fallback}
        </label>
        {native !== null && (
          <p className="annotate py-2" aria-live="polite">
            {native ? t.runningNative : t.runningFallback}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {NAMES.map((name, i) => (
          <li
            key={name}
            ref={(el) => {
              cards.current[i] = el
            }}
            className="cast flex aspect-[4/3] flex-col justify-between p-5"
          >
            <span className="annotate">{String(i + 1).padStart(2, "0")}</span>
            <code className="font-mono text-sm text-fg">{name}</code>
          </li>
        ))}
      </ul>

      <div className="max-w-xl">
        <CodeBlock title={t.codeHeading} code={code} />
      </div>
    </div>
  )
}
