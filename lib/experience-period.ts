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

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/

export function formatMonthYear(value: string): string {
  const m = MONTH_RE.exec(value)
  if (!m) return value
  return `${MONTH_LABELS[parseInt(m[2], 10) - 1]} ${m[1]}`
}

function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function isCurrentRange(endDate: string): boolean {
  if (!endDate) return true
  if (!MONTH_RE.test(endDate)) return false
  return endDate >= currentYearMonth()
}

export function deriveExperiencePeriod(
  startDate: string,
  endDate: string,
): { period: string; current: boolean } {
  const current = isCurrentRange(endDate)
  if (!startDate || !MONTH_RE.test(startDate)) {
    return { period: "", current }
  }
  const start = formatMonthYear(startDate)
  const end = current ? "Present" : formatMonthYear(endDate)
  return { period: `${start} -- ${end}`, current }
}
