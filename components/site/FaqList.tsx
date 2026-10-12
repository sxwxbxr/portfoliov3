import { ChevronDown } from "lucide-react"

/**
 * Questions as native disclosures: keyboard and screen-reader accessible without
 * script, and the answers stay in the HTML whether or not they are open.
 */
export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="border-t border-edge-soft">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-b border-edge-soft">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-sm py-5 text-lg tracking-tight [&::-webkit-details-marker]:hidden">
            <span>{q}</span>
            <ChevronDown
              className="mt-1.5 h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="measure pb-5 leading-relaxed text-fg-muted">{a}</p>
        </details>
      ))}
    </div>
  )
}
