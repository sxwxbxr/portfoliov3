"use client"

import { useId, useState } from "react"
import { Check } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  DATABASES,
  LANGUAGES,
  selectedDatabases,
  setFilters,
  toggleAgeGroup,
  toggleStudyType,
  type DatabaseId,
  type FilterSuggestion,
  type SearchModel,
  type SexFilter,
  type StudyTypeId,
} from "@/lib/physio/search-string"

const t = ssCopy.database
const STUDY_TYPES: StudyTypeId[] = ["rct", "systematic-review", "meta-analysis"]

function parseYear(raw: string): number | null {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1000 && n <= 3000 ? n : null
}

/** Names of the filters that are switched on, in the order the Filter area shows them. */
export function activeFilterNames(model: SearchModel): string[] {
  const f = model.filters
  const n = ssCopy.sections.filters.names
  const out: string[] = []
  if (f.language) out.push(n.language)
  if (f.yearFrom !== null || f.yearTo !== null) out.push(n.years)
  if (f.studyTypes.length) out.push(n.studyTypes)
  if (f.humansOnly) out.push(n.humans)
  if (f.ageGroups.length) out.push(n.age)
  if (f.sex) out.push(n.sex)
  return out
}

/** The databases as small toggle chips. Every available database in DATABASES gets one. */
export function DatabaseChips({ selected, onChange }: { selected: DatabaseId[]; onChange: (ids: DatabaseId[]) => void }) {
  const uid = useId()
  const available = DATABASES.filter((d) => d.available)
  return (
    <fieldset className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <legend className="sr-only">{t.legend}</legend>
      <span aria-hidden="true" className="text-sm text-fg-muted">
        {t.legend}
      </span>
      {available.map((db) => {
        const on = selected.includes(db.id)
        const last = on && selected.length === 1
        return (
          <label key={db.id} className={last ? "cursor-default" : "cursor-pointer"}>
            <input
              type="checkbox"
              name={`${uid}-db`}
              value={db.id}
              checked={on}
              disabled={last}
              aria-describedby={last ? `${uid}-last` : undefined}
              onChange={() => onChange(on ? selected.filter((x) => x !== db.id) : [...selected, db.id])}
              className="peer sr-only"
            />
            <span
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal ${
                on ? "border-signal bg-signal text-signal-fg" : "border-edge-mid bg-plate text-fg hover:border-signal hover:text-signal-hi"
              }`}
            >
              {on && <Check className="size-3.5" aria-hidden="true" />}
              {db.label}
            </span>
          </label>
        )
      })}
      <span id={`${uid}-last`} className="sr-only">
        {t.atLeastOne}
      </span>
    </fieldset>
  )
}

interface Props {
  model: SearchModel
  onChange: (m: SearchModel) => void
  /** Optional age and sex filters found in the case. Off until the user switches them on. */
  suggestions?: FilterSuggestion[]
}

export function FilterPanel({ model, onChange, suggestions = [] }: Props) {
  const uid = useId()
  const f = model.filters
  const cochrane = selectedDatabases(model).includes("cochrane")
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-fg-muted">{t.filtersHint}</p>
      {cochrane && (
        <div className="well px-5 py-4" role="note">
          <p className="measure text-sm leading-relaxed text-fg-muted">{t.cochraneFilters}</p>
        </div>
      )}
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
                className="size-4 accent-signal"
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
            className="size-4 accent-signal"
            aria-describedby={`${uid}-humans`}
          />
          <span className="text-sm">{t.humans}</span>
        </label>
        <p id={`${uid}-humans`} className="pl-7 text-xs text-fg-muted">
          {t.humansHint}
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="well flex flex-col gap-3 px-5 py-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-lg tracking-tight">{t.caseHeading}</h4>
            <p className="measure text-sm leading-relaxed text-fg-muted">{t.caseHint}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            {suggestions.map((sg) => {
              const on = sg.kind === "age" ? f.ageGroups.includes(sg.value) : f.sex === sg.value
              const label = sg.kind === "age" ? (t.ageLabels[sg.value] ?? sg.value) : (t.sexLabels[sg.value] ?? sg.value)
              return (
                <label key={sg.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-fg">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      onChange(sg.kind === "age" ? toggleAgeGroup(model, sg.value) : setFilters(model, { sex: on ? "" : (sg.value as SexFilter) }))
                    }
                    className="size-4 shrink-0 accent-signal"
                  />
                  <span className="text-sm">
                    {label} <span className="text-fg-muted">({t.fromCase(sg.evidence)})</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}
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
