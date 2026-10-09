"use client"

import { useId, type FormEvent } from "react"
import Link from "next/link"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { EXAMPLES, type DatabaseId, type PicoInput } from "@/lib/physio/search-string"
import { physioPath } from "@/lib/physio/urls"
import { DatabaseChips } from "./DatabasePanel"

const t = ssCopy.question

/** Generous, so a pasted task sheet still fits. */
export const MAX_TEXT_LENGTH = 6000

export const PICO_KEYS = ["population", "intervention", "comparison", "outcome", "studyType"] as const

export function picoFilledCount(pico: PicoInput): number {
  return PICO_KEYS.filter((k) => (pico[k] ?? "").trim()).length
}

interface CaseProps {
  /** Demo: the question comes from the shipped examples and cannot be typed over. */
  locked: boolean
  exampleId: string
  onExample: (id: string) => void
  text: string
  onText: (v: string) => void
  databases: DatabaseId[]
  onDatabases: (ids: DatabaseId[]) => void
  onSubmit: () => void
  error: string | null
  /** True once the components were edited by hand. */
  edited: boolean
  /** An analysis is running (the dictionary is loading). */
  busy: boolean
}

/**
 * The first screen: one input, the databases as chips, one button.
 * Everything else (PICO fields, filters, components) lives in the folded areas under the result.
 */
export function QuestionPanel({ locked, exampleId, onExample, text, onText, databases, onDatabases, onSubmit, error, edited, busy }: CaseProps) {
  const uid = useId()

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  const exampleSelect = (
    <select
      id={`${uid}-example`}
      value={exampleId}
      onChange={(e) => onExample(e.target.value)}
      className={locked ? "field min-h-11 w-full max-w-xl px-2.5 text-base md:text-sm" : "field min-h-11 min-w-0 flex-1 px-2.5 text-base sm:w-72 sm:flex-none md:text-sm"}
    >
      <option value="">{t.examplePlaceholder}</option>
      {EXAMPLES.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.title}
        </option>
      ))}
    </select>
  )

  return (
    <section aria-label={t.textLabel} data-guide="ss-question" className="cast p-4 md:p-6">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {locked ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-example`} className="text-sm text-fg-muted">
              {t.exampleLabel}
            </label>
            {exampleSelect}
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-4">
            <label htmlFor={`${uid}-text`} className={locked ? "text-sm text-fg-muted" : "text-base text-fg"}>
              {locked ? t.textLabelDemo : t.textLabel}
            </label>
            {!locked && (
              <span className="flex min-w-0 items-center gap-2">
                <label htmlFor={`${uid}-example`} className="text-sm text-fg-muted">
                  {t.exampleLabel}
                </label>
                {exampleSelect}
              </span>
            )}
          </div>
          <textarea
            id={`${uid}-text`}
            value={text}
            onChange={(e) => onText(e.target.value)}
            readOnly={locked}
            rows={locked ? 3 : 5}
            maxLength={MAX_TEXT_LENGTH}
            placeholder={t.textPlaceholder}
            aria-describedby={error ? `${uid}-error` : locked ? `${uid}-locked` : `${uid}-hint`}
            aria-invalid={error ? true : undefined}
            className="field w-full resize-y px-4 py-3 text-base leading-relaxed"
          />
          {!locked && (
            <p id={`${uid}-hint`} className="text-sm text-fg-muted">
              {t.hint}
            </p>
          )}
          {locked && (
            <p id={`${uid}-locked`} className="text-sm text-fg-muted">
              {t.lockedBody}{" "}
              <Link href={physioPath("/abo")} className="text-fg underline underline-offset-4">
                {ssCopy.demo.ctaPrimary}
              </Link>
            </p>
          )}
        </div>

        <DatabaseChips selected={databases} onChange={onDatabases} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <button type="submit" disabled={busy} aria-disabled={busy} className="control control-primary min-h-12 w-full px-8 text-base sm:w-auto">
              {busy ? t.submitting : t.submit}
            </button>
            <span role="status" aria-live="polite" className="text-sm text-fg-muted">
              {busy ? t.analysing : ""}
            </span>
          </div>
          {error && (
            <p id={`${uid}-error`} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {edited && !error && <p className="text-xs text-fg-muted">{t.editedHint}</p>}
          <p className="text-xs text-fg-muted">{ssCopy.privacyShort}</p>
        </div>
      </form>
    </section>
  )
}

interface PicoProps {
  locked: boolean
  pico: PicoInput
  onPico: (p: PicoInput) => void
  onSubmit: () => void
  busy: boolean
  edited: boolean
}

/** The optional PICO fields and the writing tips. In the demo they show the example, read-only. */
export function PicoFields({ locked, pico, onPico, onSubmit, busy, edited }: PicoProps) {
  const uid = useId()
  return (
    <div className="flex flex-col gap-5">
      <p className="measure text-sm leading-relaxed text-fg-muted">{t.textHint}</p>
      <p className="measure text-sm leading-relaxed text-fg-muted">{t.picoHint}</p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PICO_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-${key}`} className="text-sm text-fg-muted">
              {t.pico[key].label}
            </label>
            <input
              id={`${uid}-${key}`}
              value={pico[key] ?? ""}
              onChange={(e) => onPico({ ...pico, [key]: e.target.value })}
              readOnly={locked}
              placeholder={t.pico[key].placeholder}
              className="field min-h-11 w-full px-3 text-base md:text-sm"
            />
          </div>
        ))}
      </div>
      {!locked && (
        <div className="flex flex-col gap-2">
          <div>
            <button type="button" onClick={onSubmit} disabled={busy} className="control min-h-11 px-5 text-sm">
              {t.resubmit}
            </button>
          </div>
          {edited && <p className="text-xs text-fg-muted">{t.editedHint}</p>}
        </div>
      )}
    </div>
  )
}
