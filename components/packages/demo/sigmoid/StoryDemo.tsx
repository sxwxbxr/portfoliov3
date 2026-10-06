"use client"

import { useEffect, useRef, useState } from "react"
import { story } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.story

/** Shapes of the pinned figure, one per step. */
const SHAPES = ["rounded-md", "rounded-[2rem] rotate-45", "rounded-full"]

/** A pinned scroll story driven by story(): the step follows the scroll position. */
export function StoryDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const c = story(ref.current, { steps: t.steps.length, onStep: setStep })
    return () => c.cancel()
  }, [])

  return (
    <div ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <ol className="flex flex-col gap-6">
            {t.steps.map((s, i) => (
              <li
                key={s.title}
                aria-current={i === step ? "step" : undefined}
                className="transition-opacity duration-500"
                style={{ opacity: i === step ? 1 : 0.3 }}
              >
                <p className="annotate">{t.stepLabel(i + 1, t.steps.length)}</p>
                <p className="mt-1 text-xl text-fg md:text-2xl">{s.title}</p>
                <p className="mt-1 text-sm text-fg-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="cast flex aspect-square items-center justify-center p-10">
            <div
              className={`h-1/2 w-1/2 bg-fg ${SHAPES[step] ?? ""}`}
              style={{ transition: "border-radius 600ms var(--sigmoid-ease-bouncy), rotate 600ms var(--sigmoid-ease-bouncy), scale 600ms var(--sigmoid-ease-bouncy)", scale: step === 2 ? "0.8" : "1" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
