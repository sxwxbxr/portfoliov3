"use client"

import { type CSSProperties, useEffect, useRef } from "react"

/**
 * Mounts a Witness custom element imperatively, so React never has to know its
 * types. Attributes and custom properties are kept in sync on every render.
 */
export function Element<T extends HTMLElement = HTMLElement>({
  tag,
  attrs,
  vars,
  onEvent,
  elementRef,
  className,
  style,
}: {
  tag: "witness-notice" | "witness-label"
  attrs: Record<string, string | undefined>
  vars?: Record<string, string>
  onEvent?: (type: string, detail: unknown) => void
  elementRef?: (el: T | null) => void
  className?: string
  style?: CSSProperties
}) {
  const host = useRef<HTMLDivElement>(null)
  const el = useRef<T | null>(null)
  const listener = useRef(onEvent)
  listener.current = onEvent
  const initial = useRef(attrs)
  initial.current = attrs

  useEffect(() => {
    const node = document.createElement(tag) as T
    const handle = (event: Event) => listener.current?.(event.type, (event as CustomEvent).detail)
    node.addEventListener("witness-shown", handle)
    node.addEventListener("witness-acknowledged", handle)
    // Attributes first, as the HTML parser would, so the element starts with its final state.
    for (const [name, value] of Object.entries(initial.current)) {
      if (value !== undefined) node.setAttribute(name, value)
    }
    for (const [name, value] of Object.entries(vars ?? {})) node.style.setProperty(name, value)
    el.current = node
    host.current?.append(node)
    elementRef?.(node)
    return () => {
      node.remove()
      el.current = null
      elementRef?.(null)
    }
    // The element is created once per tag; attributes follow below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag])

  useEffect(() => {
    const node = el.current
    if (!node) return
    for (const [name, value] of Object.entries(attrs)) {
      if (value === undefined) node.removeAttribute(name)
      else if (node.getAttribute(name) !== value) node.setAttribute(name, value)
    }
    for (const [name, value] of Object.entries(vars ?? {})) node.style.setProperty(name, value)
  })

  return <div ref={host} className={className} style={style} />
}
