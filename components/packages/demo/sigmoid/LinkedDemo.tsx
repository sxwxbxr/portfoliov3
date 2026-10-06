"use client"

import { useEffect, useRef } from "react"
import { reveal } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.linked

/** One tall stage drives two sticky captions elsewhere: reveal() with a subject. */
export function LinkedDemo() {
  const stage = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLParagraphElement>(null)
  const second = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!stage.current) return
    const controllers = [
      reveal(first.current, { subject: stage.current, keyframes: "fade-up", range: "cover 5% cover 30%" }),
      reveal(second.current, { subject: stage.current, keyframes: "blur-in", range: "cover 35% cover 60%" }),
    ]
    return () => controllers.forEach((c) => c.cancel())
  }, [])

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div ref={stage} className="cast flex h-[90vh] items-end p-6">
        <p className="annotate">{t.stage}</p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="sticky top-24 flex flex-col gap-6">
          <p ref={first} className="display text-balance text-3xl md:text-4xl">
            {t.first}
          </p>
          <p ref={second} className="display text-balance text-3xl md:text-4xl">
            {t.second}
          </p>
        </div>
      </div>
    </div>
  )
}
