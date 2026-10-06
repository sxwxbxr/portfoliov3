import type { ReactNode } from "react"
import type { ToolIconKey } from "@/lib/physio/tools"

/**
 * The icons of the tool registry, drawn for this site on a 24px grid: 1.75 stroke,
 * round caps, no fill except the single dot of `brackets` (the logo motif: the
 * field-tag brackets of a PubMed string around one point).
 * Decorative: the tool name always sits next to it, so the svg is hidden from screen readers.
 */
const PATHS: Record<ToolIconKey, ReactNode> = {
  brackets: (
    <>
      <path d="M9.5 5H6.25v14H9.5M14.5 5h3.25v14H14.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M14.75 14.75 19.5 19.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.75c2.6-.9 5.4-.6 8 1 2.6-1.6 5.4-1.9 8-1V18c-2.6-.9-5.4-.6-8 1-2.6-1.6-5.4-1.9-8-1z" />
      <path d="M12 6.75V19" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="15.5" rx="2" />
      <path d="M9 5V3.75h6V5M9 11h6M9 15h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10.5h16M8.5 4v4M15.5 4v4" />
    </>
  ),
  list: (
    <>
      <path d="M10 7h9M10 12h9M10 17h9" />
      <circle cx="5.5" cy="7" r=".9" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="12" r=".9" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="17" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
}

export function ToolIcon({ name, size = 22, className }: { name: ToolIconKey; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name] ?? PATHS.list}
    </svg>
  )
}

/** Padlock for paid tools. */
export function LockIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  )
}
