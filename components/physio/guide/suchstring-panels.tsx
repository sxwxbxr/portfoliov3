"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, Copy, Download, Printer } from "lucide-react"
import { guideCopy } from "@/lib/physio/copy/guide"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { whereLabel, type CriterionKind, type CriterionWhere, type ResolvedCriterion } from "@/lib/physio/guide/criteria"
import { countBySeverity, explainFinding, sortFindings, type LintGuideCtx } from "@/lib/physio/guide/lint-guide"
import { PICO_KEYS, type PicoKey } from "@/lib/physio/guide/pico"
import { worksheetOf, type SuchstringGuideCtx } from "@/lib/physio/guide/suchstring"
import { PICO_LABEL, WORKSHEET_DRAFT_NOTE, worksheetMarkdown, worksheetText, type Worksheet } from "@/lib/physio/guide/worksheet"
import { cn } from "@/lib/utils"
import { copyText, downloadText } from "./file"
import type { GuidePanelProps } from "./GuideProvider"

const p = guideCopy.suchstring.panels

const subheading = "annotate text-sm font-medium text-fg"
const area = "field w-full resize-y px-3 py-2 text-sm leading-relaxed"
const smallBtn = "inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs text-fg-muted underline underline-offset-4 hover:text-fg"

/* ── PICO ────────────────────────────────────────────────────────── */

export function PicoPanel({ ctx }: GuidePanelProps<SuchstringGuideCtx>) {
  const uid = useId()
  if (!ctx.hasCase) return null
  const { resolved } = ctx
  const setCell = (k: PicoKey, value: string | undefined) =>
    ctx.setEdits?.((e) => {
      const cells = { ...e.pico.cells }
      if (value === undefined) delete cells[k]
      else cells[k] = value
      return { ...e, pico: { ...e.pico, cells } }
    })
  const setQuestion = (value: string | undefined) => ctx.setEdits?.((e) => ({ ...e, pico: { ...e.pico, question: value } }))

  return (
    <div className="flex flex-col gap-5">
      <h3 className={subheading}>{p.pico.table}</h3>
      <div className="flex flex-col gap-4">
        {PICO_KEYS.map((k) => {
          const cell = resolved.cells[k]
          const copy = p.pico.letters[k]
          return (
            <div key={k} className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-${k}`} className="flex items-baseline justify-between gap-2 text-sm text-fg">
                <span>
                  <span className="font-medium">{copy.label}</span>
                  <span className="ml-2 text-xs text-fg-muted">{copy.hint}</span>
                </span>
              </label>
              <textarea
                id={`${uid}-${k}`}
                rows={2}
                value={cell.text}
                placeholder={p.pico.placeholder}
                onChange={(e) => setCell(k, e.target.value)}
                className={area}
              />
              {cell.edited && (
                <button type="button" onClick={() => setCell(k, undefined)} className={cn(smallBtn, "self-start")}>
                  {p.pico.reset}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-q`} className="text-sm font-medium text-fg">
          {p.pico.question}
        </label>
        <p className="text-xs text-fg-muted">{p.pico.questionHint}</p>
        <textarea id={`${uid}-q`} rows={5} value={resolved.question.text} onChange={(e) => setQuestion(e.target.value)} className={area} />
        {resolved.question.edited && (
          <button type="button" onClick={() => setQuestion(undefined)} className={cn(smallBtn, "self-start")}>
            {p.pico.reset}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Criteria ────────────────────────────────────────────────────── */

export function CriteriaPanel({ ctx }: GuidePanelProps<SuchstringGuideCtx>) {
  const uid = useId()
  const [kind, setKind] = useState<CriterionKind>("include")
  const [text, setText] = useState("")
  const [reason, setReason] = useState("")
  if (!ctx.hasCase) return null
  const c = p.criteria

  const patch = (fn: (e: SuchstringGuideCtx["edits"]) => SuchstringGuideCtx["edits"]) => ctx.setEdits?.(fn)
  const toggleRemoved = (id: string, removed: boolean) =>
    patch((e) => {
      const set = new Set(e.criteria.removed ?? [])
      if (removed) set.add(id)
      else set.delete(id)
      return { ...e, criteria: { ...e.criteria, removed: [...set] } }
    })
  const setField = (field: "text" | "reason", id: string, value: string) =>
    patch((e) => ({ ...e, criteria: { ...e.criteria, [field]: { ...(e.criteria[field] ?? {}), [id]: value } } }))
  const addCustom = () => {
    if (!text.trim()) return
    const id = `custom-${Date.now().toString(36)}`
    patch((e) => ({
      ...e,
      criteria: {
        ...e.criteria,
        custom: [...(e.criteria.custom ?? []), { id, kind, text: text.trim(), reason: reason.trim(), where: "screening" as CriterionWhere, custom: true }],
      },
    }))
    setText("")
    setReason("")
  }

  const group = (k: CriterionKind, title: string) => {
    const items = ctx.criteria.filter((x) => x.kind === k)
    return (
      <section className="flex flex-col gap-3" aria-label={title}>
        <h3 className={subheading}>{title}</h3>
        {items.length === 0 && <p className="text-xs text-fg-muted">{c.empty}</p>}
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <CriterionItem
              key={item.id}
              item={item}
              uid={uid}
              onText={(v) => setField("text", item.id, v)}
              onReason={(v) => setField("reason", item.id, v)}
              onRemoved={(r) => toggleRemoved(item.id, r)}
            />
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {group("include", c.include)}
      {group("exclude", c.exclude)}

      <section className="flex flex-col gap-2 border-t border-edge-soft pt-4" aria-label={c.addHeading}>
        <h3 className={subheading}>{c.addHeading}</h3>
        <label htmlFor={`${uid}-kind`} className="text-xs text-fg-muted">
          {c.addKind}
        </label>
        <select id={`${uid}-kind`} value={kind} onChange={(e) => setKind(e.target.value as CriterionKind)} className="field min-h-11 px-2.5 text-base md:text-sm">
          <option value="include">{c.include}</option>
          <option value="exclude">{c.exclude}</option>
        </select>
        <label htmlFor={`${uid}-new`} className="text-xs text-fg-muted">
          {c.addText}
        </label>
        <input id={`${uid}-new`} value={text} onChange={(e) => setText(e.target.value)} className="field min-h-11 px-3 text-base md:text-sm" />
        <label htmlFor={`${uid}-why`} className="text-xs text-fg-muted">
          {c.addReason}
        </label>
        <input id={`${uid}-why`} value={reason} onChange={(e) => setReason(e.target.value)} className="field min-h-11 px-3 text-base md:text-sm" />
        <button type="button" onClick={addCustom} disabled={!text.trim()} className="control mt-1 min-h-11 self-start px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          {c.addButton}
        </button>
      </section>
    </div>
  )
}

function CriterionItem({
  item,
  uid,
  onText,
  onReason,
  onRemoved,
}: {
  item: ResolvedCriterion
  uid: string
  onText: (v: string) => void
  onReason: (v: string) => void
  onRemoved: (removed: boolean) => void
}) {
  const c = p.criteria
  return (
    <li className={cn("cast flex flex-col gap-2 p-3", item.removed && "opacity-60")}>
      <label htmlFor={`${uid}-${item.id}-t`} className="sr-only">
        {item.kind === "include" ? c.include : c.exclude}
      </label>
      <textarea id={`${uid}-${item.id}-t`} rows={2} value={item.text} disabled={item.removed} onChange={(e) => onText(e.target.value)} className={area} />
      <label htmlFor={`${uid}-${item.id}-r`} className="text-xs text-fg-muted">
        {c.reasonLabel}
      </label>
      <textarea id={`${uid}-${item.id}-r`} rows={3} value={item.reason} disabled={item.removed} onChange={(e) => onReason(e.target.value)} className={cn(area, "text-xs")} />
      <p className="text-xs text-fg-muted">
        <span className="tab rounded-full px-2 py-0.5 text-xs">{c.where[item.where]}</span>
        {item.custom && <span className="ml-2">{c.myOwn}</span>}
      </p>
      {item.note && <p className="text-xs leading-relaxed text-fg-muted">{item.note}</p>}
      <button type="button" onClick={() => onRemoved(!item.removed)} className={cn(smallBtn, "self-start")}>
        {item.removed ? c.restore : c.remove}
      </button>
    </li>
  )
}

/* ── RefHunter table ─────────────────────────────────────────────── */

export function TermsPanel({ ctx }: GuidePanelProps<SuchstringGuideCtx>) {
  const built = ctx.built
  if (!built || built.empty) return null
  const t = p.terms
  return (
    <div className="flex flex-col gap-3">
      <h3 className={subheading}>{t.heading}</h3>
      <p className="text-xs text-fg-muted">{t.caption}</p>
      <ol className="flex flex-col gap-3">
        {built.components.map((comp, i) => (
          <li key={comp.conceptId} className="cast flex flex-col gap-2.5 p-3">
            <p className="text-sm text-fg">
              <span className="annotate mr-1.5 text-xs">{i + 1}</span>
              {comp.label}
            </p>
            <dl className="flex flex-col gap-2 text-xs">
              <div>
                <dt className="annotate text-fg-muted">{t.keywords}</dt>
                <dd className="leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{comp.stichworte.join(", ") || t.none}</dd>
              </div>
              <div>
                <dt className="annotate text-fg-muted">{t.subjectHeadings}</dt>
                <dd className={cn("leading-relaxed [overflow-wrap:anywhere]", comp.schlagworte.length ? "text-fg-muted" : "text-fg")}>
                  {comp.schlagworte.join(", ") || t.noMesh}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── Worksheet ───────────────────────────────────────────────────── */

export function WorksheetPanel({ ctx }: GuidePanelProps<SuchstringGuideCtx>) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  if (!ctx.hasCase) return null
  const w = p.worksheet
  const ws = worksheetOf(ctx)
  const text = worksheetText(ws)

  async function copy() {
    const ok = await copyText(text)
    setStatus(ok ? "copied" : "failed")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("idle"), 2400)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className={subheading}>{w.heading}</h3>
      <p className="text-xs text-fg-muted" role="note">
        {w.draft}
      </p>
      {ws.empty ? (
        <p className="text-sm text-fg-muted">{w.empty}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className="control control-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm">
              {status === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {status === "copied" ? w.copied : w.copy}
            </button>
            <button type="button" onClick={() => downloadText(`${w.fileBase}.txt`, text, "text/plain")} className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm">
              <Download className="size-4" aria-hidden="true" />
              {w.downloadTxt}
            </button>
            <button type="button" onClick={() => downloadText(`${w.fileBase}.md`, worksheetMarkdown(ws), "text/markdown")} className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm">
              <Download className="size-4" aria-hidden="true" />
              {w.downloadMd}
            </button>
            <button type="button" onClick={() => window.print()} className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm">
              <Printer className="size-4" aria-hidden="true" />
              {w.print}
            </button>
          </div>
          <span role="status" aria-live="polite" className={status === "failed" ? "text-xs text-fg-muted" : "sr-only"}>
            {status === "failed" ? w.copyFailed : status === "copied" ? w.copied : ""}
          </span>
          <details open className="group">
            <summary className="inline-flex min-h-9 cursor-pointer items-center text-sm text-fg">{w.preview}</summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded-md border border-edge-soft bg-(--plate-hi) p-3 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-fg-muted [overflow-wrap:anywhere]">
              {text}
            </pre>
          </details>
          <PrintSheet ws={ws} />
        </>
      )}
    </div>
  )
}

/**
 * The print version: mounted straight under <body> and hidden on screen. physio.css hides
 * everything else while printing (".guide-print-sheet"), so window.print() prints this sheet only.
 */
function PrintSheet({ ws }: { ws: Worksheet }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const crit = (list: ResolvedCriterion[]) =>
    list.length ? (
      <table>
        <thead>
          <tr>
            <th>Kriterium</th>
            <th>Begründung</th>
            <th>Umsetzung</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.text}</td>
              <td>{c.reason}</td>
              <td>{whereLabel(c.where)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>–</p>
    )
  return createPortal(
    <div className="guide-print-sheet" aria-hidden="true">
      <h1>Arbeitsblatt Literaturrecherche (Entwurf)</h1>
      <p className="meta">Suchstring-Generator, Geführter Modus, physio.sweber.dev · {ws.date}</p>
      <p className="draft">{WORKSHEET_DRAFT_NOTE}</p>

      {ws.questionText && (
        <>
          <h2>1. Fragestellung</h2>
          <p>{ws.questionText}</p>
        </>
      )}

      <h2>2. PICO</h2>
      <table>
        <tbody>
          {PICO_KEYS.map((k) => (
            <tr key={k}>
              <th scope="row">
                {k} · {PICO_LABEL[k]}
              </th>
              <td>{ws.pico[k] || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <strong>Überarbeitete Fragestellung:</strong> {ws.question || "–"}
      </p>

      <h2>3. Ein- und Ausschlusskriterien</h2>
      <h3>Einschluss</h3>
      {crit(ws.include)}
      <h3>Ausschluss</h3>
      {crit(ws.exclude)}

      <h2>4. Suchkomponenten</h2>
      <table>
        <thead>
          <tr>
            <th>Suchkomponente</th>
            <th>Stichworte</th>
            <th>Schlagwort(e) (MeSH)</th>
          </tr>
        </thead>
        <tbody>
          {ws.components.map((c) => (
            <tr key={c.n}>
              <td>
                {c.n}. {c.label} ({c.block})
              </td>
              <td>{c.stichworte.join(", ") || "–"}</td>
              <td>{c.schlagworte.join(", ") || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>5. Suchstring</h2>
      {ws.structure && <p>Aufbau: {ws.structure}</p>}
      {ws.queries.map((q) => (
        <div key={q.databaseId}>
          <h3>{q.label}</h3>
          <pre>{q.lines?.length ? q.lines.map((l) => `#${l.n} ${l.query}`).join("\n") : q.query}</pre>
        </div>
      ))}
      {ws.filterClauses.length > 0 && <p>Filter im String: {ws.filterClauses.join(" | ")}</p>}

      {ws.counts && (
        <>
          <h2>6. Trefferzahlen (PubMed)</h2>
          <table>
            <tbody>
              {ws.counts.map((c, i) => (
                <tr key={i}>
                  <td>{c.label}</td>
                  <td>{c.count?.toLocaleString("de-CH") ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p className="draft">{WORKSHEET_DRAFT_NOTE}</p>
    </div>,
    document.body,
  )
}

/* ── Lint findings ───────────────────────────────────────────────── */

export function LintFindingsPanel({ ctx }: GuidePanelProps<LintGuideCtx>) {
  const [index, setIndex] = useState(0)
  const l = guideCopy.lint.panels.findings
  const sorted = sortFindings(ctx.findings)
  if (!ctx.text.trim()) return null
  if (!sorted.length) return <p className="text-sm text-fg-muted">{l.none}</p>
  const i = Math.min(index, sorted.length - 1)
  const f = sorted[i]
  const ex = explainFinding(f.code)
  const counts = countBySeverity(ctx.findings)
  const raw = ctx.text.slice(f.start, f.end).replace(/\s+/g, " ").trim()
  const snippet = raw.length > 60 ? `${raw.slice(0, 59)}…` : raw

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <h3 className={subheading}>{l.of(i + 1, sorted.length)}</h3>
        <span className={cn("rounded-md border px-2 py-0.5 text-xs", f.severity === "error" ? "border-destructive bg-destructive font-medium text-destructive-foreground" : f.severity === "warning" ? "border-fg bg-fg font-medium text-plate" : "border-edge-mid text-fg-muted")}>
          {ssCopy.severity[f.severity]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-fg">{f.message}</p>
      {snippet && (
        <p className="text-xs text-fg-muted">
          {l.place}: <code className="rounded bg-(--plate-hi) px-1 py-0.5 font-mono [overflow-wrap:anywhere]">{snippet}</code>
        </p>
      )}
      <div className="flex flex-col gap-1">
        <h4 className="annotate text-xs font-medium text-fg">{l.meaning}</h4>
        <p className="text-sm leading-relaxed text-fg-muted">{ex.meaning}</p>
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="annotate text-xs font-medium text-fg">{l.todo}</h4>
        <p className="text-sm leading-relaxed text-fg-muted">{ex.todo}</p>
        <p className="text-xs leading-relaxed text-fg-muted">{f.fix ? l.autoFix(f.fix.label) : l.manual}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setIndex(Math.max(i - 1, 0))} disabled={i === 0} className="control min-h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          {l.prev}
        </button>
        <button type="button" onClick={() => setIndex(Math.min(i + 1, sorted.length - 1))} disabled={i === sorted.length - 1} className="control min-h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          {l.next}
        </button>
      </div>
      <p className="text-xs text-fg-muted">{guideCopy.lint.obs.summary(counts.error, counts.warning, counts.info)}</p>
    </div>
  )
}

