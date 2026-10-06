"use client"

import { useEffect, useState } from "react"
import { reducedMotion } from "@sweberdev/lagrangian"
import { lagrangianDemo } from "@/lib/demo/lagrangian-copy"

/** Tells users with reduced motion what changes for them. */
export function LagrangianStatus() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(reducedMotion()), [])
  if (!reduced) return null
  return <p className="well max-w-2xl px-5 py-4 text-sm text-fg-muted">{lagrangianDemo.reduced}</p>
}
