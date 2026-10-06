"use client"

import { useId, useState, type FormEvent } from "react"
import { X } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  BLOCKS,
  TERMINOLOGY,
  addConceptFromTerminology,
  addCustomConcept,
  addFreeText,
  moveConcept,
  removeConcept,
  setBlockIncluded,
  setFreeTextRemoved,
  setMeshRemoved,
  toggleExplode,
  type Block,
  type Candidate,
  type Category,
  type Concept,
  type Notice,
  type SearchModel,
} from "@/lib/physio/search-string"
import { Notices } from "./Notices"

const t = ssCopy.concepts

interface Props {
  model: SearchModel
  onChange: (model: SearchModel) => void
  candidates: Candidate[]
  onCandidatesChange: (candidates: Candidate[]) => void
  notices: Notice[]
}

export function ConceptsPanel({ model, onChange, candidates, onCandidatesChange, notices }: Props) {
  const empty = model.concepts.length === 0
  return (
    <div className="flex flex-col gap-10">
      <Notices notices={notices} heading={t.notices} />

      {empty && (
        <div className="well flex flex-col gap-1 px-5 py-4" role="status">
          <p className="text-fg">{t.emptyTitle}</p>
          <p className="text-sm text-fg-muted">{t.emptyBody}</p>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {BLOCKS.map((block) => (
          <BlockGroup key={block} block={block} model={model} onChange={onChange} />
        ))}
      </div>

      {candidates.length > 0 && (
        <CandidateList model={model} onChange={onChange} candidates={candidates} onCandidatesChange={onCandidatesChange} />
      )}

      <AddConcept model={model} onChange={onChange} />
    </div>
  )
}

function BlockGroup({ block, model, onChange }: { block: Block; model: SearchModel; onChange: (m: SearchModel) => void }) {
  const copy = t.blocks[block]
  const concepts = model.concepts.filter((c) => c.block === block)
  const included = model.includedBlocks[block]
  const checkId = useId()
  return (
    <section aria-label={copy.title} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h3 className="text-xl tracking-tight">{copy.title}</h3>
          <p className="text-sm text-fg-muted">{copy.sub}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            id={checkId}
            type="checkbox"
            checked={included}
            onChange={(e) => onChange(setBlockIncluded(model, block, e.target.checked))}
            className="size-4 accent-white"
          />
          <label htmlFor={checkId} className="text-sm text-fg">
            {t.blockInclude}
          </label>
        </div>
      </div>
      {block === "comparison" && !included && <p className="text-sm text-fg-muted">{t.comparisonNote}</p>}
      {block !== "comparison" && !included && <p className="text-sm text-fg-muted">{t.blockExcluded}</p>}

      {concepts.length === 0 ? (
        <p className="text-sm text-fg-muted">{t.emptyBlock}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {concepts.map((c) => (
            <li key={c.id}>
              <ConceptCard concept={c} model={model} onChange={onChange} dimmed={!included} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ConceptCard({
  concept,
  model,
  onChange,
  dimmed,
}: {
  concept: Concept
  model: SearchModel
  onChange: (m: SearchModel) => void
  dimmed: boolean
}) {
  const uid = useId()
  const activeMesh = concept.mesh.filter((m) => !m.removed)
  const activeText = concept.freeText.filter((f) => !f.removed)
  const removedMesh = concept.mesh.filter((m) => m.removed)
  const removedText = concept.freeText.filter((f) => f.removed)

  return (
    <article aria-labelledby={`${uid}-h`} className={`cast flex flex-col gap-6 p-5 md:p-6 ${dimmed ? "opacity-70" : ""}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h4 id={`${uid}-h`} className="text-lg tracking-tight">
            {concept.label}
          </h4>
          <p className="annotate text-fg-muted mt-0.5 [overflow-wrap:anywhere]">
            {concept.origin === "custom" ? t.custom : concept.matchedText ? `${t.detectedFrom} «${concept.matchedText}»` : " "}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`${uid}-block`} className="text-sm text-fg-muted">
            {t.moveTo}
          </label>
          <select
            id={`${uid}-block`}
            value={concept.block}
            onChange={(e) => onChange(moveConcept(model, concept.id, e.target.value as Block))}
            className="field min-h-11 px-2.5 text-base md:text-sm"
          >
            {BLOCKS.map((b) => (
              <option key={b} value={b}>
                {t.blocks[b].title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onChange(removeConcept(model, concept.id))}
            className="control min-h-11 px-4 text-sm"
            aria-label={`${t.removeConcept}: ${concept.label}`}
          >
            {t.removeConceptButton}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-2.5">
        <h5 className="annotate text-fg-muted">{t.schlagworte}</h5>
        {activeMesh.length === 0 ? (
          <p className="text-sm text-fg-muted">{concept.mesh.length === 0 ? t.noMesh : t.allMeshRemoved}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {activeMesh.map((m) => {
              const chipId = `${uid}-m-${m.heading.replace(/\W+/g, "-")}`
              return (
                <li
                  key={m.heading}
                  className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-[0.5rem] border border-edge-mid py-1 pr-1 pl-3 text-sm"
                >
                  <span id={chipId} className="text-fg [overflow-wrap:anywhere]">
                    {m.heading}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={m.explode}
                    aria-describedby={chipId}
                    onClick={() => onChange(toggleExplode(model, concept.id, m.heading))}
                    className={`relative rounded-full border px-2.5 py-0.5 text-xs after:absolute after:-inset-1.5 after:content-[''] ${
                      m.explode ? "border-edge bg-plate-hi text-fg" : "border-edge-mid text-fg-muted"
                    }`}
                    title={t.explodeHelp}
                  >
                    {m.explode ? t.explodeOn : t.explodeOff}
                  </button>
                  <RemoveButton
                    label={`${t.removeTerm}: ${m.heading}`}
                    onClick={() => onChange(setMeshRemoved(model, concept.id, m.heading, true))}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <h5 className="annotate text-fg-muted">{t.stichworte}</h5>
        {activeText.length === 0 ? (
          <p className="text-sm text-fg-muted">{t.allTextRemoved}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {activeText.map((f) => (
              <li
                key={f.text}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-edge-mid py-1 pr-1 pl-3 text-sm"
              >
                <span className="text-fg [overflow-wrap:anywhere]">{f.text}</span>
                <RemoveButton
                  label={`${t.removeTerm}: ${f.text}`}
                  onClick={() => onChange(setFreeTextRemoved(model, concept.id, f.text, true))}
                />
              </li>
            ))}
          </ul>
        )}
        <AddTermForm concept={concept} model={model} onChange={onChange} />
      </div>

      {(removedMesh.length > 0 || removedText.length > 0) && (
        <details className="text-sm">
          <summary className="cursor-pointer text-fg-muted">
            {t.removedTerms} ({removedMesh.length + removedText.length})
          </summary>
          <ul className="mt-3 flex flex-wrap gap-2">
            {removedMesh.map((m) => (
              <li key={`m-${m.heading}`}>
                <button
                  type="button"
                  className="control min-h-9 px-3 text-sm text-fg-muted line-through decoration-fg-muted"
                  onClick={() => onChange(setMeshRemoved(model, concept.id, m.heading, false))}
                  aria-label={`${t.restore}: ${m.heading}`}
                >
                  {m.heading}
                </button>
              </li>
            ))}
            {removedText.map((f) => (
              <li key={`f-${f.text}`}>
                <button
                  type="button"
                  className="control min-h-9 px-3 text-sm text-fg-muted line-through decoration-fg-muted"
                  onClick={() => onChange(setFreeTextRemoved(model, concept.id, f.text, false))}
                  aria-label={`${t.restore}: ${f.text}`}
                >
                  {f.text}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative grid size-7 shrink-0 place-items-center rounded-full text-fg-muted after:absolute after:-inset-2 after:content-[''] hover:bg-plate-hi hover:text-fg"
    >
      <X className="size-3.5" aria-hidden="true" />
    </button>
  )
}

function AddTermForm({ concept, model, onChange }: { concept: Concept; model: SearchModel; onChange: (m: SearchModel) => void }) {
  const uid = useId()
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const r = addFreeText(model, concept.id, value)
    if (r.error) {
      setError(r.error)
      return
    }
    setError(null)
    setValue("")
    onChange(r.model)
  }

  return (
    <form onSubmit={submit} className="mt-1 flex flex-col gap-1.5">
      <label htmlFor={`${uid}-term`} className="text-sm text-fg-muted">
        {t.addTermLabel}
      </label>
      <div className="flex gap-2">
        <input
          id={`${uid}-term`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          placeholder={t.addTermPlaceholder}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${uid}-hint`}
          className="field min-h-11 min-w-0 flex-1 px-3 text-base md:text-sm"
        />
        <button type="submit" className="control min-h-11 shrink-0 px-4 text-sm">
          {t.addTermButton}
        </button>
      </div>
      <p id={`${uid}-hint`} className={`text-xs ${error ? "text-destructive" : "text-fg-muted"}`} role={error ? "alert" : undefined}>
        {error ?? t.addTermHint}
      </p>
    </form>
  )
}

function CandidateList({
  model,
  onChange,
  candidates,
  onCandidatesChange,
}: {
  model: SearchModel
  onChange: (m: SearchModel) => void
  candidates: Candidate[]
  onCandidatesChange: (c: Candidate[]) => void
}) {
  const [blocks, setBlocks] = useState<Record<string, Block>>({})
  const [error, setError] = useState<string | null>(null)

  function adopt(c: Candidate) {
    const r = addCustomConcept(model, c.text, blocks[c.id] ?? c.block)
    if (r.error) {
      setError(r.error)
      return
    }
    setError(null)
    onChange(r.model)
    onCandidatesChange(candidates.filter((x) => x.id !== c.id))
  }

  return (
    <section aria-labelledby="ss-candidates" className="flex flex-col gap-4">
      <div>
        <h3 id="ss-candidates" className="text-xl tracking-tight">
          {t.candidatesHeading}
        </h3>
        <p className="measure mt-1 text-sm leading-relaxed text-fg-muted">{t.candidatesHint}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {candidates.map((c) => (
          <li key={c.id} className="well flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[0.375rem] px-4 py-3">
            <span className="min-w-[6rem] flex-1 font-mono text-sm text-fg [overflow-wrap:anywhere]">{c.text}</span>
            <label htmlFor={`cand-${c.id}`} className="sr-only">
              {t.candidateBlock}
            </label>
            <select
              id={`cand-${c.id}`}
              value={blocks[c.id] ?? c.block}
              onChange={(e) => setBlocks((prev) => ({ ...prev, [c.id]: e.target.value as Block }))}
              className="field min-h-11 px-2.5 text-base md:text-sm"
            >
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {t.blocks[b].title}
                </option>
              ))}
            </select>
            <button type="button" className="control control-primary min-h-11 px-4 text-sm" onClick={() => adopt(c)}>
              {t.candidateAdd}
            </button>
            <button
              type="button"
              className="control min-h-11 px-4 text-sm"
              onClick={() => onCandidatesChange(candidates.filter((x) => x.id !== c.id))}
              aria-label={`${t.candidateDismiss}: ${c.text}`}
            >
              {t.candidateDismiss}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  )
}

const CATEGORY_ORDER: Category[] = ["population", "setting", "intervention", "comparison", "outcome"]

function AddConcept({ model, onChange }: { model: SearchModel; onChange: (m: SearchModel) => void }) {
  const uid = useId()
  const [termId, setTermId] = useState("")
  const [custom, setCustom] = useState("")
  const [customBlock, setCustomBlock] = useState<Block>("population")
  const [error, setError] = useState<string | null>(null)

  const present = new Set(model.concepts.map((c) => c.id))
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: TERMINOLOGY.concepts.filter((c) => c.category === cat && !present.has(c.id)),
  })).filter((g) => g.items.length > 0)

  function addFromList(e: FormEvent) {
    e.preventDefault()
    if (!termId) return
    onChange(addConceptFromTerminology(model, termId))
    setTermId("")
  }

  function addCustom(e: FormEvent) {
    e.preventDefault()
    const r = addCustomConcept(model, custom, customBlock)
    if (r.error) {
      setError(r.error)
      return
    }
    setError(null)
    setCustom("")
    onChange(r.model)
  }

  return (
    <section aria-labelledby={`${uid}-h`} className="flex flex-col gap-5 border-t border-edge-soft pt-8">
      <h3 id={`${uid}-h`} className="text-xl tracking-tight">
        {t.addConceptHeading}
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form onSubmit={addFromList} className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-list`} className="text-sm text-fg-muted">
            {t.addFromList}
          </label>
          <div className="flex gap-2">
            <select
              id={`${uid}-list`}
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              className="field min-h-11 min-w-0 flex-1 px-2.5 text-base md:text-sm"
            >
              <option value="">{t.addFromListPlaceholder}</option>
              {grouped.map((g) => (
                <optgroup key={g.cat} label={t.categories[g.cat]}>
                  {g.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button type="submit" disabled={!termId} className="control min-h-11 shrink-0 px-4 text-sm">
              {t.addFromListButton}
            </button>
          </div>
        </form>

        <form onSubmit={addCustom} className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-custom`} className="text-sm text-fg-muted">
            {t.addCustomLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`${uid}-custom`}
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value)
                setError(null)
              }}
              placeholder={t.addCustomPlaceholder}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              className="field min-h-11 min-w-0 flex-1 basis-40 px-3 text-base md:text-sm"
            />
            <label htmlFor={`${uid}-cblock`} className="sr-only">
              {t.candidateBlock}
            </label>
            <select
              id={`${uid}-cblock`}
              value={customBlock}
              onChange={(e) => setCustomBlock(e.target.value as Block)}
              className="field min-h-11 px-2.5 text-base md:text-sm"
            >
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {t.blocks[b].title}
                </option>
              ))}
            </select>
            <button type="submit" className="control min-h-11 shrink-0 px-4 text-sm">
              {t.addCustomButton}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
