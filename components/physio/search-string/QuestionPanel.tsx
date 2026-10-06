"use client"

import { useId, type FormEvent } from "react"
import Link from "next/link"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { EXAMPLES, type PicoInput } from "@/lib/physio/search-string"
import { physioPath } from "@/lib/physio/urls"

const t = ssCopy.question

interface Props {
  locked: boolean
  exampleId: string
  onExample: (id: string) => void
  text: string
  onText: (v: string) => void
  pico: PicoInput
  onPico: (p: PicoInput) => void
  onSubmit: () => void
  error: string | null
  /** True once the concepts below were edited by hand. */
  edited: boolean
}

const PICO_KEYS = ["population", "intervention", "comparison", "outcome", "studyType"] as const

export function QuestionPanel({ locked, exampleId, onExample, text, onText, pico, onPico, onSubmit, error, edited }: Props) {
  const uid = useId()
  const example = EXAMPLES.find((e) => e.id === exampleId)
  const picoFilled = PICO_KEYS.some((k) => (pico[k] ?? "").trim())

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-example`} className="text-sm text-fg-muted">
          {t.exampleLabel}
        </label>
        <select
          id={`${uid}-example`}
          value={exampleId}
          onChange={(e) => onExample(e.target.value)}
          className="field min-h-11 w-full max-w-xl px-2.5 text-base md:text-sm"
        >
          <option value="">{t.examplePlaceholder}</option>
          {EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
        {example && <p className="measure mt-1 text-sm leading-relaxed text-fg-muted">{example.description}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-text`} className="text-sm text-fg-muted">
          {t.textLabel}
        </label>
        <textarea
          id={`${uid}-text`}
          value={text}
          onChange={(e) => onText(e.target.value)}
          readOnly={locked}
          rows={5}
          maxLength={1500}
          placeholder={t.textPlaceholder}
          aria-describedby={`${uid}-text-hint`}
          aria-invalid={error ? true : undefined}
          className="field w-full resize-y px-4 py-3 text-base leading-relaxed"
        />
        <p id={`${uid}-text-hint`} className="measure text-xs leading-relaxed text-fg-muted">
          {locked ? `${t.lockedTitle} ${t.lockedBody}` : t.textHint}
        </p>
        {locked && (
          <p className="text-sm">
            <Link href={physioPath("/abo")} className="text-fg underline underline-offset-4">
              {ssCopy.demo.ctaPrimary}
            </Link>
          </p>
        )}
      </div>

      <details key={exampleId} className="group" open={locked && picoFilled}>
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm text-fg">{t.picoSummary}</summary>
        <div className="mt-4 flex flex-col gap-5">
          <p className="text-sm text-fg-muted">{t.picoHint}</p>
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
        </div>
      </details>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="control control-primary min-h-11 px-6 text-sm">
            {locked ? t.reset : t.submit}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {edited && !error && <p className="text-xs text-fg-muted">{t.editedHint}</p>}
      </div>
    </form>
  )
}
