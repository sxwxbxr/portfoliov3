import { siteCopy } from "@/lib/physio/copy/site"
import { EXAMPLES, analyze, buildQuery, createModel } from "@/lib/physio/search-string"
import { QueryView } from "./search-string/QueryView"

const t = siteCopy.landing.preview

/**
 * The landing hero: one real question and what the engine makes of it.
 * Rendered on the server from lib/physio/search-string, so the string shown is
 * exactly what the tool produces, not a mock-up that can drift.
 */
export function HeroPreview() {
  const ex = EXAMPLES.find((e) => e.id === t.exampleId) ?? EXAMPLES[0]
  const built = buildQuery(createModel(analyze({ text: ex.text, pico: ex.pico }), ex.filters))

  return (
    <figure className="p-doc flex flex-col" aria-label={t.caption}>
      <div className="flex flex-col gap-2 p-5 md:p-6">
        <p className="annotate">{t.questionLabel}</p>
        <p className="font-[family-name:var(--font-physio-serif)] text-lg leading-snug text-fg md:text-xl">{ex.text}</p>
      </div>

      <div className="relative border-t border-edge-soft bg-plate-hi px-5 py-4 md:px-6">
        {/* The arrow sits on the dividing line: question above, result below. */}
        <span
          aria-hidden="true"
          className="absolute -top-3.5 left-5 grid size-7 place-items-center rounded-full border border-edge-soft bg-plate text-signal md:left-6"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10m0 0L3 8m4 4l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="annotate mb-2">{t.componentsLabel}</p>
        <ul className="flex flex-wrap gap-2">
          {built.components.map((c, i) => (
            <li
              key={c.conceptId}
              className="flex items-center gap-2 rounded-md border border-edge-soft bg-plate py-1 pr-3 pl-1.5 text-sm text-fg"
            >
              <span className="grid size-5 place-items-center rounded bg-(--wash) text-xs font-semibold text-signal tabular">
                {i + 1}
              </span>
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-edge-soft p-5 md:p-6">
        <p className="annotate">{t.stringLabel}</p>
        <QueryView query={built.query} label={t.stringLabel} />
      </div>

      <figcaption className="flex flex-col gap-2 border-t border-edge-soft px-5 py-4 text-sm text-fg-muted md:px-6">
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <span className="rounded-[3px] border border-edge-mid bg-(--wash) px-1 font-mono text-xs text-(--signal-hi)">[Mesh]</span>
            {t.legendMesh}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg-muted">[tiab]</span>
            {t.legendTiab}
          </span>
        </span>
        <span>{t.caption}</span>
      </figcaption>
    </figure>
  )
}
