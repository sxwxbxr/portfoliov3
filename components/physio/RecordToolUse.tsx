"use client"

import { useEffect } from "react"
import { recordToolUse } from "@/lib/physio/recent-tools"

/** Renders nothing. Remembers on this device that the visitor opened a tool (feeds "Zuletzt verwendet" on /tools). */
export function RecordToolUse({ slug }: { slug: string }) {
  useEffect(() => recordToolUse(slug), [slug])
  return null
}
