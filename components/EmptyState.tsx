import type React from "react"

/**
 * The one empty-state shape.
 *
 * An empty region is a recess in the ground, never a bare paragraph. This
 * existed in two hand-assembled variants — a one-liner (`well p-10 text-center
 * text-sm`) on /, /projects and /experience, and a fuller label + heading +
 * measure block on /education and /skills — with the padding already drifting
 * between p-10 and p-12. globals.css owns no `.empty` composite and is not
 * ours to edit, so the composite lives here instead.
 *
 * Pass only `children` for the one-liner; add `label` and `title` when the
 * emptiness deserves an explanation.
 */
export function EmptyState({
  label,
  title,
  children,
  className = "",
}: {
  label?: string
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={
        "well flex flex-col items-center gap-3 p-10 text-center md:p-14 " +
        className
      }
    >
      {label && <span className="annotate">{label}</span>}
      {title && (
        <p className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </p>
      )}
      {children && (
        <p className="measure text-sm leading-relaxed text-fg-muted">{children}</p>
      )}
    </div>
  )
}
