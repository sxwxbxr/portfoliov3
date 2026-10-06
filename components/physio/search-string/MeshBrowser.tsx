"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  BLOCKS,
  addMeshConcept,
  descriptorLabel,
  meshKind,
  treeLetters,
  type Block,
  type MeshChoice,
  type SearchModel,
} from "@/lib/physio/search-string"
import { getMeshIndex } from "@/lib/physio/search-string/mesh-index"
import { normalizeMeshTerm } from "@/lib/physio/search-string/mesh-normalize"
import { useNeighbours } from "./mesh-hooks"

const t = ssCopy.mesh
const blockCopy = ssCopy.concepts.blocks

const MIN_CHARS = 3
const MAX_SUGGESTIONS = 10
const MAX_CHILDREN_SHOWN = 24

interface Suggestion {
  descriptor: MeshChoice
  /** The indexed word the typed text matched, when it differs from the labels. */
  matched: string
}

type SuggestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Suggestion[]; for: string }

export function categoryLabel(d: Pick<MeshChoice, "treeNumbers">): string {
  const names = treeLetters(d.treeNumbers).map((l) => t.categories[l] ?? l)
  return names.length ? names.join(", ") : "-"
}

function defaultBlock(d: MeshChoice): Block {
  const kind = meshKind(d)
  return kind === "intervention" || kind === "activity" ? "intervention" : kind === "outcome" ? "outcome" : kind === "drug" ? "comparison" : "population"
}

/**
 * Search the MeSH dictionary by German or English word, read the definition,
 * walk the tree and add a heading as Suchkomponente. Only the shard of the
 * first two typed letters is fetched; nothing here is tied to the question.
 */
export function MeshBrowser({ model, onChange }: { model: SearchModel; onChange: (m: SearchModel) => void }) {
  const uid = useId()
  const [query, setQuery] = useState("")
  const [state, setState] = useState<SuggestState>({ status: "idle" })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<MeshChoice | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const normalised = normalizeMeshTerm(query)
  const tooShort = normalised.length < MIN_CHARS

  useEffect(() => {
    if (tooShort) return
    let cancelled = false
    const timer = setTimeout(async () => {
      setState((s) => (s.status === "ready" ? s : { status: "loading" }))
      try {
        const idx = getMeshIndex()
        const rows = await idx.suggestTerms(query, 80)
        const seen = new Map<string, string>()
        for (const row of rows) {
          for (const ref of row.refs) {
            if (ref.acronym && query !== query.toUpperCase()) continue
            if (!seen.has(ref.ui)) seen.set(ref.ui, row.term)
          }
          if (seen.size >= MAX_SUGGESTIONS) break
        }
        const uis = [...seen.keys()]
        const descriptors = uis.length ? await idx.getDescriptors(uis) : new Map()
        if (cancelled) return
        const items = uis.flatMap((ui) => (descriptors.has(ui) ? [{ descriptor: descriptors.get(ui)!, matched: seen.get(ui)! }] : []))
        setState({ status: "ready", items, for: query })
        setActive(0)
      } catch {
        if (!cancelled) setState({ status: "error" })
      }
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, tooShort])

  const items = !tooShort && state.status === "ready" ? state.items : []
  const showList = open && !tooShort && state.status === "ready" && items.length > 0
  const optionId = (i: number) => `${uid}-opt-${i}`

  function choose(s: Suggestion) {
    setSelected(s.descriptor)
    setOpen(false)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!items.length) return
      setOpen(true)
      setActive((a) => (open ? Math.min(items.length - 1, a + 1) : a))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === "Enter") {
      if (showList && items[active]) {
        e.preventDefault()
        choose(items[active])
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  const status =
    tooShort && query.trim() ? t.minChars : state.status === "loading" ? t.loading : state.status === "error" ? t.failed : state.status === "ready" && !tooShort ? (items.length ? t.results(items.length) : t.noResults) : ""

  return (
    <section aria-labelledby={`${uid}-h`} className="flex flex-col gap-5 border-t border-edge-soft pt-8">
      <div className="flex flex-col gap-1">
        <h3 id={`${uid}-h`} className="text-xl tracking-tight">
          {t.heading}
        </h3>
        <p className="measure text-sm leading-relaxed text-fg-muted">{t.hint}</p>
      </div>

      <div className="flex max-w-xl flex-col gap-1.5">
        <label htmlFor={`${uid}-q`} className="text-sm text-fg-muted">
          {t.label}
        </label>
        <input
          ref={inputRef}
          id={`${uid}-q`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList ? optionId(active) : undefined}
          aria-describedby={`${uid}-status`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            // Keep the list open while the pointer is inside it (incl. its scrollbar).
            if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest?.(`[data-mesh-list="${uid}"]`)) setOpen(false)
          }}
          onKeyDown={onKeyDown}
          placeholder={t.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="field min-h-11 w-full px-3 text-base md:text-sm"
        />
        <p id={`${uid}-status`} role="status" aria-live="polite" className="min-h-5 text-xs text-fg-muted">
          {state.status === "loading" && !tooShort ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-signal-bright" />
              {t.loading}
            </span>
          ) : (
            status
          )}
        </p>

        <ul
          id={`${uid}-list`}
          role="listbox"
          aria-label={t.heading}
          data-mesh-list={uid}
          // The page scrolls with Lenis, which would take the wheel; this list scrolls itself.
          data-lenis-prevent=""
          // Focusable so that grabbing the scrollbar moves focus here instead of
          // blurring the input into "nothing" (which closed the list).
          tabIndex={-1}
          onBlur={(e) => {
            if (e.relatedTarget !== inputRef.current && !(e.relatedTarget as HTMLElement | null)?.closest?.(`[data-mesh-list="${uid}"]`)) setOpen(false)
          }}
          // After scrolling or dragging, typing and arrow keys go back to the input.
          onMouseUp={() => inputRef.current?.focus({ preventScroll: true })}
          hidden={!showList}
          className="well max-h-80 divide-y divide-edge-soft overflow-y-auto overscroll-contain outline-none"
        >
          {items.map((s, i) => (
            <li
              key={s.descriptor.ui}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-plate-hi" : ""}`}
            >
              <span className="block text-fg [overflow-wrap:anywhere]">{descriptorLabel(s.descriptor)}</span>
              <span className="block text-xs text-fg-muted [overflow-wrap:anywhere]">
                {s.descriptor.name} · {categoryLabel(s.descriptor)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {selected && <DescriptorDetail key={selected.ui} descriptor={selected} model={model} onChange={onChange} onNavigate={setSelected} />}
    </section>
  )
}

function DescriptorDetail({
  descriptor,
  model,
  onChange,
  onNavigate,
}: {
  descriptor: MeshChoice
  model: SearchModel
  onChange: (m: SearchModel) => void
  onNavigate: (d: MeshChoice) => void
}) {
  const uid = useId()
  const neighbours = useNeighbours(descriptor)
  const [block, setBlock] = useState<Block>(() => defaultBlock(descriptor))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const present = model.concepts.some((c) => c.descriptor?.ui === descriptor.ui || c.mesh.some((m) => m.heading === descriptor.name))

  function add() {
    const r = addMeshConcept(model, descriptor, block)
    setFeedback(r.added ? t.added : t.alreadyThere)
    if (r.added) onChange(r.model)
  }

  const children = neighbours.status === "ready" ? neighbours.value.children : []
  const shown = showAll ? children : children.slice(0, MAX_CHILDREN_SHOWN)

  return (
    <article aria-labelledby={`${uid}-h`} className="cast flex flex-col gap-6 p-5 md:p-6">
      <header className="flex flex-col gap-1">
        <h4 id={`${uid}-h`} className="text-lg tracking-tight [overflow-wrap:anywhere]">
          {descriptorLabel(descriptor)}
        </h4>
        <p className="annotate text-fg-muted [overflow-wrap:anywhere]">
          {t.english}: {descriptor.name}
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
        <div className="min-w-0">
          <dt className="annotate text-fg-muted">{t.german}</dt>
          <dd className="mt-0.5 text-fg [overflow-wrap:anywhere]">{descriptor.german.length ? descriptor.german.join(", ") : t.noGerman}</dd>
        </div>
        <div className="min-w-0">
          <dt className="annotate text-fg-muted">{t.category}</dt>
          <dd className="mt-0.5 text-fg">{categoryLabel(descriptor)}</dd>
        </div>
        <div className="min-w-0 md:col-span-2">
          <dt className="annotate text-fg-muted">{t.scopeNote}</dt>
          <dd className="mt-0.5 leading-relaxed text-fg-muted">{descriptor.scopeNote || t.noScopeNote}</dd>
        </div>
        <div className="min-w-0 md:col-span-2">
          <dt className="annotate text-fg-muted">{t.treeNumbers}</dt>
          <dd className="mt-0.5 font-mono text-xs text-fg-muted [overflow-wrap:anywhere]">{descriptor.treeNumbers.join(", ")}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section aria-labelledby={`${uid}-up`} className="flex min-w-0 flex-col gap-2">
          <h5 id={`${uid}-up`} className="annotate text-fg-muted">
            {t.broader}
          </h5>
          {neighbours.status === "loading" && <p className="text-sm text-fg-muted">{t.loading}</p>}
          {neighbours.status === "error" && <p className="text-sm text-destructive">{t.failed}</p>}
          {neighbours.status === "ready" &&
            (neighbours.value.parents.length === 0 ? (
              <p className="text-sm text-fg-muted">{t.noBroader}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {neighbours.value.parents.map((p) => (
                  <li key={p.ui}>
                    <button type="button" className="control min-h-11 px-3 text-sm [overflow-wrap:anywhere]" onClick={() => onNavigate(p)}>
                      {descriptorLabel(p)}
                      <span className="text-fg-muted"> · {p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </section>

        <section aria-labelledby={`${uid}-down`} className="flex min-w-0 flex-col gap-2">
          <h5 id={`${uid}-down`} className="annotate text-fg-muted">
            {t.narrower}
          </h5>
          {neighbours.status === "ready" &&
            (children.length === 0 ? (
              <p className="text-sm text-fg-muted">{t.noNarrower}</p>
            ) : (
              <>
                <ul className="flex flex-wrap gap-2">
                  {shown.map((c) => (
                    <li key={c.ui}>
                      <button type="button" className="control min-h-11 px-3 text-sm [overflow-wrap:anywhere]" onClick={() => onNavigate(c)}>
                        {descriptorLabel(c)}
                        {descriptorLabel(c) !== c.name && <span className="text-fg-muted"> · {c.name}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                {!showAll && children.length > shown.length && (
                  <button type="button" className="control min-h-11 self-start px-4 text-sm" onClick={() => setShowAll(true)}>
                    + {children.length - shown.length}
                  </button>
                )}
              </>
            ))}
        </section>
      </div>

      <div className="flex flex-col gap-2 border-t border-edge-soft pt-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-block`} className="text-sm text-fg-muted">
              {t.addBlock}
            </label>
            <select
              id={`${uid}-block`}
              value={block}
              onChange={(e) => setBlock(e.target.value as Block)}
              className="field min-h-11 px-2.5 text-base md:text-sm"
            >
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {blockCopy[b].title}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="control control-primary min-h-11 px-5 text-sm" onClick={add} disabled={present && !feedback}>
            {t.add}
          </button>
        </div>
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-fg-muted">
          {feedback ?? (present ? t.alreadyThere : "")}
        </p>
      </div>
    </article>
  )
}
