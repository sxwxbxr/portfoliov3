const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const MONTH_LABELS_DE = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
]

/** Word for an open-ended range, per language. */
export const PRESENT_LABEL = { en: "Present", de: "heute" } as const

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/

export function formatMonthYear(value: string, locale: "en" | "de" = "en"): string {
  const m = MONTH_RE.exec(value)
  if (!m) return value
  const labels = locale === "de" ? MONTH_LABELS_DE : MONTH_LABELS
  return `${labels[parseInt(m[2], 10) - 1]} ${m[1]}`
}

function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/**
 * A range is current when it has started AND has not finished.
 *
 * `startDate` used to be ignored here, so anything ending in the future was
 * labelled "Present" — including a degree that has not begun. A row reading
 * "Sep 2026 -- Present" in August 2026 is simply wrong, and it is the kind of
 * wrong a reader notices on a CV.
 *
 * `startDate` is optional so existing callers keep compiling; omitting it
 * restores the old end-only behaviour.
 */
export function isCurrentRange(endDate: string, startDate?: string): boolean {
  const now = currentYearMonth()
  if (startDate && MONTH_RE.test(startDate) && startDate > now) return false
  if (!endDate) return true
  if (!MONTH_RE.test(endDate)) return false
  return endDate >= now
}

/** True when the range has not started yet. */
export function isFutureRange(startDate: string): boolean {
  if (!startDate || !MONTH_RE.test(startDate)) return false
  return startDate > currentYearMonth()
}

export function derivePeriodRange(
  startDate: string,
  endDate: string,
  locale: "en" | "de" = "en",
): { period: string; current: boolean } {
  const current = isCurrentRange(endDate, startDate)
  if (!startDate || !MONTH_RE.test(startDate)) {
    return { period: "", current }
  }
  const start = formatMonthYear(startDate, locale)
  const end = current ? PRESENT_LABEL[locale] : formatMonthYear(endDate, locale)
  return { period: `${start} -- ${end}`, current }
}
