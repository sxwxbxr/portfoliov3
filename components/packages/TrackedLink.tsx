"use client"

import type { ReactNode } from "react"
import { track } from "@vercel/analytics"

/** External link that reports a cookieless analytics event on click. */
export function TrackedLink({
  href,
  event,
  data,
  className,
  children,
}: {
  href: string
  event?: string
  data?: Record<string, string>
  className?: string
  children: ReactNode
}) {
  const external = /^https?:/.test(href)
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={event ? () => track(event, data) : undefined}
    >
      {children}
    </a>
  )
}
