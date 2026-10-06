"use client"

import { useId, useState } from "react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { DATABASES, LANGUAGES, setFilters, toggleStudyType, type SearchModel, type StudyTypeId } from "@/lib/physio/search-string"

const t = ssCopy.database
const STUDY_TYPES: StudyTypeId[] = ["rct", "systematic-review", "meta-analysis"]

function parseYear(raw: string): number | null {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1000 && n <= 3000 ? n : null
}

export function DatabasePanel({ model, onChange }: { model: SearchModel; onChange: (m: SearchModel) => void }) {
  const uid = useId()
  const f = model.filters
  return (
    <div className="flex flex-col gap-10">
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">{t.legend}</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DATABASES.map((db) => (
            <label
              key={db.id}
              className={`cast flex items-center justify-between gap-3 px-5 py-4 ${
                db.available ? "cursor-pointer has-[:checked]:bg-plate-hi has-[:checked]:outline has-[:checked]:outline-1 has-[:checked]:outline-fg" : "cursor-not-allowed opacity-60"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`${uid}-db`}
                  value={db.id}
                  checked={db.id === "pubmed"}
                  disabled={!db.available}
                  readOnly
                  className="size-4 accent-white"
                />
                <span className="text-fg">{db.label}</span>
              </span>
              {!db.available && <span className="tab text-xs text-fg-muted">{t.soon}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-1 text-xl tracking-tight">{t.filtersHeading}</legend>
        <p className="-mt-3 text-sm text-fg-muted">{t.filtersHint}</p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-lang`} className="text-sm text-fg-muted">
              {t.language}
            </label>
            <select
              id={`${uid}-lang`}
              value={f.language}
              onChange={(e) => onChange(setFilters(model, { language: e.target.value }))}
              className="field min-h-11 px-2.5 text-base md:text-sm"
            >
              <option value="">{t.languageAny}</option>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id={`${uid}-years`} className="text-sm text-fg-muted">
              {t.years}
            </span>
            <div role="group" aria-labelledby={`${uid}-years`} className="flex items-center gap-2">
              <YearInput
                id={`${uid}-from`}
                label={`${t.years} ${t.yearFrom}`}
                value={f.yearFrom}
                onValid={(yearFrom) => onChange(setFilters(model, { yearFrom }))}
              />
              <span aria-hidden="true" className="text-fg-muted">
                {t.yearTo}
              </span>
              <YearInput
                id={`${uid}-to`}
                label={`${t.years} ${t.yearTo}`}
                value={f.yearTo}
                onValid={(yearTo) => onChange(setFilters(model, { yearTo }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-fg-muted">{t.studyTypes}</span>
          <div className="flex flex-col gap-1">
            {STUDY_TYPES.map((id) => (
              <label key={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-fg">
                <input
                  type="checkbox"
                  checked={f.studyTypes.includes(id)}
                  onChange={() => onChange(toggleStudyType(model, id))}
                  className="size-4 accent-white"
                />
                <span className="text-sm">{t.studyTypeLabels[id]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-fg">
            <input
              type="checkbox"
              checked={f.humansOnly}
              onChange={(e) => onChange(setFilters(model, { humansOnly: e.target.checked }))}
              className="size-4 accent-white"
              aria-describedby={`${uid}-humans`}
            />
            <span className="text-sm">{t.humans}</span>
          </label>
          <p id={`${uid}-humans`} className="pl-7 text-xs text-fg-muted">
            {t.humansHint}
          </p>
        </div>
      </fieldset>
    </div>
  )
}

/** Keeps what the person types, even while it is not yet a valid year. */
function YearInput({ id, label, value, onValid }: { id: string; label: string; value: number | null; onValid: (n: number | null) => void }) {
  const [raw, setRaw] = useState(value === null ? "" : String(value))
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        maxLength={4}
        value={raw}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "")
          setRaw(next)
          onValid(next === "" ? null : parseYear(next))
        }}
        placeholder={t.yearPlaceholder}
        className="field min-h-11 w-full min-w-0 px-3 text-base md:text-sm"
      />
    </>
  )
}
