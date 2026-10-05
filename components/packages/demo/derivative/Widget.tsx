"use client"

import { useEffect, useRef } from "react"
import type { Feed, WidgetElement } from "./runtime"

/**
 * Mounts <derivative-widget> imperatively, so React never has to know the
 * custom element's types. Attributes are kept in sync on every change.
 */
export function Widget({
  feed,
  attrs,
  className,
}: {
  feed: Feed
  attrs: Record<string, string | undefined>
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const el = useRef<WidgetElement | null>(null)

  useEffect(() => {
    const node = document.createElement("derivative-widget") as WidgetElement
    el.current = node
    host.current?.append(node)
    return () => {
      node.remove()
      el.current = null
    }
  }, [])

  useEffect(() => {
    const node = el.current
    if (!node) return
    for (const [name, value] of Object.entries(attrs)) {
      if (value === undefined) node.removeAttribute(name)
      else node.setAttribute(name, value)
    }
  })

  useEffect(() => {
    if (el.current) el.current.feed = feed
  }, [feed])

  return <div ref={host} className={className} />
}
