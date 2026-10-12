"use client"

/**
 * Collapsible wrapper for the German (/de) twin fields of an admin form.
 * Empty German fields fall back to the English value on the public site.
 */
export default function GermanSection({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-border p-4 [&_summary]:cursor-pointer"
    >
      <summary className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Deutsch
      </summary>
      <div className="mt-4 space-y-5">
        <p className="text-xs text-muted-foreground">
          Leave empty to fall back to English.
        </p>
        {children}
      </div>
    </details>
  )
}
