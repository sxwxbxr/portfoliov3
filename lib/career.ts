/**
 * Merges the work and education tables into one timeline model.
 *
 * They were two pages and they should not have been. In the Swiss
 * apprenticeship model the two run CONCURRENTLY — an EFZ is a job and a school
 * at the same time — so a work-only view shows unexplained gaps where a
 * full-time school year sat, and an education-only view shows nothing about
 * what was being done alongside it. Neither page was wrong; both were partial.
 *
 * Two consequences shape everything here:
 *
 * 1. Entries OVERLAP, so the timeline needs lanes rather than a single line.
 *    Collapsing them onto one axis would misrepresent the biography.
 * 2. Positions come from the `startDate` / `endDate` "YYYY-MM" columns, which
 *    are the source of truth. `period` is a derived display string and must
 *    never be parsed back.
 */

import { formatMonthYear } from "./period-range"

export type CareerLane = "work" | "education"

export interface CareerEntry {
  id: string
  lane: CareerLane
  /** Employer, or institution. The line the eye lands on first. */
  title: string
  /** Role, or qualification. */
  subtitle: string
  description: string
  bullets: string[]
  /** Formatted for display — recomputed here, see displayPeriod(). */
  period: string
  /** "YYYY-MM", source of truth. */
  startDate: string
  endDate: string
  /** Ongoing right now. */
  current: boolean
  /** Starts after today — planned rather than done. */
  future: boolean
  /** Fractions of the axis, 0..1. */
  from: number
  to: number
}

export interface CareerTimeline {
  entries: CareerEntry[]
  /** Whole years spanned by the axis, for the tick labels. */
  years: number[]
  /** Fraction of the axis where today sits, or null if outside it. */
  todayAt: number | null
  firstYear: number
  lastYear: number
}

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/

/**
 * Renders the date range for display instead of using the stored `period`.
 *
 * `period` is derived and persisted on save, and rows written before
 * `isCurrentRange` learned to check the START date still read "Present" for
 * ranges that have not begun — a degree starting next month showed as
 * "Sep 2026 -- Present". Recomputing here means existing rows render correctly
 * without anyone having to re-save them in the admin.
 */
function displayPeriod(
  startDate: string,
  endDate: string,
  current: boolean,
  fallback: string
): string {
  if (!MONTH_RE.test(startDate)) return fallback
  const start = formatMonthYear(startDate)
  if (current) return `${start} -- Present`
  if (!MONTH_RE.test(endDate)) return start
  return `${start} -- ${formatMonthYear(endDate)}`
}

/** Months since year 0. Comparable, and cheap to subtract. */
function toMonths(value: string): number | null {
  const m = MONTH_RE.exec(value)
  if (!m) return null
  return parseInt(m[1], 10) * 12 + (parseInt(m[2], 10) - 1)
}

function nowMonths(now: Date): number {
  return now.getFullYear() * 12 + now.getMonth()
}

interface WorkRow {
  id: number
  company: string
  role: string
  description: string
  responsibilities: string[]
  period: string
  startDate: string
  endDate: string
  current: boolean
}

interface EduRow {
  id: number
  title: string
  institution: string
  description: string
  period: string
  startDate: string
  endDate: string
}

/**
 * @param now injected so the result is deterministic in tests and so a
 *        statically rendered page cannot bake in a stale "today".
 */
export function buildCareerTimeline(
  work: WorkRow[],
  education: EduRow[],
  now: Date = new Date()
): CareerTimeline {
  const today = nowMonths(now)

  type Raw = Omit<CareerEntry, "from" | "to"> & { startM: number; endM: number }
  const raw: Raw[] = []

  for (const w of work) {
    const startM = toMonths(w.startDate)
    if (startM === null) continue // undated rows cannot be placed on an axis
    const endM = toMonths(w.endDate)
    // A role that has not started cannot be current, whatever the stored flag
    // says — `current` is persisted on save and can be stale by the time the
    // page renders.
    const future = startM > today
    const current = !future && (w.current || endM === null || endM >= today)
    raw.push({
      id: `work-${w.id}`,
      lane: "work",
      title: w.company,
      subtitle: w.role,
      description: w.description,
      bullets: w.responsibilities ?? [],
      period: displayPeriod(w.startDate, w.endDate, current, w.period),
      startDate: w.startDate,
      endDate: w.endDate,
      current,
      future,
      // A current role runs to today even if its stored end month is earlier.
      startM,
      endM: current ? Math.max(endM ?? today, today) : (endM ?? startM),
    })
  }

  for (const e of education) {
    const startM = toMonths(e.startDate)
    if (startM === null) continue
    const endM = toMonths(e.endDate)
    const future = startM > today
    const current = !future && (endM === null || endM >= today)
    raw.push({
      id: `edu-${e.id}`,
      lane: "education",
      title: e.institution || e.title,
      subtitle: e.institution ? e.title : "",
      description: e.description,
      bullets: [],
      period: displayPeriod(e.startDate, e.endDate, current, e.period),
      startDate: e.startDate,
      endDate: e.endDate,
      current,
      future,
      startM,
      endM: endM ?? startM,
    })
  }

  if (raw.length === 0) {
    return { entries: [], years: [], todayAt: null, firstYear: 0, lastYear: 0 }
  }

  // Snap the axis to whole years so the ticks are round numbers, and always
  // include today — otherwise a purely historical CV loses its "now" marker.
  const minM = Math.min(...raw.map((r) => r.startM), today)
  const maxM = Math.max(...raw.map((r) => r.endM), today)
  const firstYear = Math.floor(minM / 12)
  const lastYear = Math.floor(maxM / 12) + 1
  const axisStart = firstYear * 12
  const axisEnd = lastYear * 12
  const span = Math.max(1, axisEnd - axisStart)

  const at = (m: number) => (m - axisStart) / span

  const entries: CareerEntry[] = raw
    .map(({ startM, endM, ...rest }) => ({
      ...rest,
      from: at(startM),
      // Floor at roughly one month so a single-month entry is still visible.
      to: Math.max(at(endM), at(startM) + 1 / span),
    }))
    .sort((a, b) => b.from - a.from || a.lane.localeCompare(b.lane))

  const years: number[] = []
  for (let y = firstYear; y <= lastYear; y++) years.push(y)

  return {
    entries,
    years,
    todayAt: at(today),
    firstYear,
    lastYear,
  }
}

export function laneEntries(timeline: CareerTimeline, lane: CareerLane) {
  return timeline.entries.filter((e) => e.lane === lane)
}
