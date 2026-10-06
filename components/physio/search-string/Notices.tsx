import { ssCopy } from "@/lib/physio/copy/search-string"
import type { Notice } from "@/lib/physio/search-string/types"

/** Warnings and hints. The severity word is part of the text, so colour is never the only signal. */
export function Notices({ notices, heading }: { notices: Notice[]; heading?: string }) {
  if (!notices.length) return null
  const ordered = [...notices].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "warning" ? -1 : 1))
  return (
    <section aria-label={heading} className="flex flex-col gap-3">
      {heading && <h3 className="annotate text-fg-muted">{heading}</h3>}
      <ul className="flex flex-col gap-2.5">
        {ordered.map((n, i) => (
          <li key={`${n.code}-${i}`} className="flex gap-3 text-sm leading-relaxed">
            <span
              className={`mt-0.5 h-fit shrink-0 rounded-full border px-2 py-px text-xs ${
                n.severity === "warning" ? "border-fg text-fg" : "border-edge-mid text-fg-muted"
              }`}
            >
              {ssCopy.severity[n.severity]}
            </span>
            <span className="min-w-0 text-fg-muted [overflow-wrap:anywhere]">{n.message}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
