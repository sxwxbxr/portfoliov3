import type { Certificate } from "./CertificateCard"
import { formatMonth, getReadableTextColor } from "@/lib/utils"
import { copy } from "@/lib/copy"

const STATUS_LABEL: Record<string, string> = {
  completed: copy.education.statusCompleted,
  "in-progress": copy.education.statusInProgress,
  planned: copy.education.statusPlanned,
}

function parseMonth(value: string): number | null {
  if (!value) return null
  const [yearStr, monthStr] = value.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null
  return year * 12 + (month - 1)
}

interface RoadmapEntry {
  cert: Certificate
  startOffset: number
  span: number
  startLabel: string
  endLabel: string
}

function buildRoadmap(certs: Certificate[]) {
  const entries: { cert: Certificate; startIdx: number; endIdx: number }[] = []
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const cert of certs) {
    if (cert.status === "completed") continue
    const start = parseMonth(cert.plannedStart)
    if (start === null) continue
    const end = parseMonth(cert.plannedEnd) ?? start
    if (end < start) continue
    entries.push({ cert, startIdx: start, endIdx: end })
    if (start < min) min = start
    if (end > max) max = end
  }

  if (entries.length === 0) {
    return { entries: [] as RoadmapEntry[], months: [] as string[] }
  }

  const totalMonths = max - min + 1
  const months: string[] = []
  for (let i = 0; i < totalMonths; i++) {
    const absolute = min + i
    const year = Math.floor(absolute / 12)
    const month = (absolute % 12) + 1
    const key = `${year}-${String(month).padStart(2, "0")}`
    months.push(key)
  }

  const built: RoadmapEntry[] = entries
    .sort((a, b) => a.startIdx - b.startIdx)
    .map((e) => ({
      cert: e.cert,
      startOffset: e.startIdx - min,
      span: e.endIdx - e.startIdx + 1,
      startLabel: formatMonth(e.cert.plannedStart),
      endLabel: e.cert.plannedEnd ? formatMonth(e.cert.plannedEnd) : "",
    }))

  return { entries: built, months }
}

function getTodayPosition(months: string[]) {
  if (months.length === 0) return null
  const [firstY, firstM] = months[0].split("-").map(Number)
  const minMonthIdx = firstY * 12 + (firstM - 1)
  const totalMonths = months.length

  const now = new Date()
  const todayMonthIdx = now.getFullYear() * 12 + now.getMonth()
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const dayFrac = (now.getDate() - 1) / daysInMonth
  const offset = todayMonthIdx - minMonthIdx + dayFrac
  if (offset < 0 || offset > totalMonths) return null
  return (offset / totalMonths) * 100
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/**
 * The roadmap as a milled gantt.
 *
 * Every row is the same object twice over: a sunken channel for the month
 * range, and a raised bar seated in it for the phase. The scale, the "Today"
 * marker and every track share one grid column and one horizontal padding, so
 * a percentage means the same distance in all three — none of the underlying
 * geometry changed, only what the percentages are measured against.
 *
 * Bars are never scaled or transformed: the label lives inside the bar, so any
 * horizontal scaling would smear it. Narrow bars truncate instead.
 */
export default function CertificatesRoadmap({
  certs,
}: {
  certs: Certificate[]
}) {
  const { entries, months } = buildRoadmap(certs)
  if (entries.length === 0) return null

  const totalMonths = months.length
  const todayLeft = getTodayPosition(months)
  const nowKey = currentMonthKey()

  // A month column narrower than ~44px cannot hold "Jan" at annotation size,
  // so the chart scrolls rather than squeezing itself illegible.
  const chartMinWidth = 200 + totalMonths * 44

  return (
    <div className="cast rim flex flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">
          {copy.education.roadmapHeading(entries.length)}
        </h3>
        <p className="annotate">
          {copy.education.roadmapRange(
            formatMonth(months[0]),
            formatMonth(months[months.length - 1])
          )}
        </p>
      </header>

      <div className="overflow-x-auto pb-1">
        <div
          className="flex flex-col gap-4"
          style={{ minWidth: `${chartMinWidth}px` }}
        >
          {/* Month scale — a sunken track, current month raised out of it. */}
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[180px_1fr] md:gap-5">
            <p className="annotate hidden md:block md:text-right">
              {copy.education.roadmapAxis}
            </p>
            <div
              className="well grid p-1.5 text-center"
              style={{
                gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))`,
              }}
            >
              {months.map((m, i) => {
                const [y, mo] = m.split("-")
                const date = new Date(Number(y), Number(mo) - 1, 1)
                const isNow = m === nowKey
                return (
                  <div
                    key={m}
                    className={
                      "flex flex-col gap-0.5 px-1 py-2 " +
                      (isNow
                        ? "cast-sm"
                        : "border-r border-edge-soft last:border-r-0")
                    }
                  >
                    <span
                      className={
                        "font-display text-xs font-semibold tabular " +
                        (isNow ? "text-signal" : "text-fg")
                      }
                    >
                      {copy.education.roadmapMonthIndex(i + 1)}
                    </span>
                    <span className="annotate">
                      {date.toLocaleString("en-US", { month: "short" })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* "Today" sits in the same column and the same inset as the tracks,
              so the tab stands directly over the line in every row. */}
          {todayLeft !== null && (
            <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[180px_1fr] md:gap-5">
              <div className="hidden md:block" aria-hidden="true" />
              <div className="px-1.5">
                <div className="relative h-7">
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${todayLeft}%` }}
                  >
                    <span className="tab whitespace-nowrap">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-bright"
                        aria-hidden="true"
                      />
                      <span className="annotate text-signal">
                        {copy.education.roadmapToday}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase bars */}
          <div className="flex flex-col gap-3">
            {entries.map(({ cert, startOffset, span, startLabel, endLabel }) => {
              const left = (startOffset / totalMonths) * 100
              const width = (span / totalMonths) * 100
              const hasAccent = Boolean(cert.accentColor)
              const isCurrent = cert.status === "in-progress"
              // No fill means the bar keeps the plate of .cast-sm: planned work
              // is a raised seat, the accent stays with the current thing.
              const fill =
                cert.accentColor || (isCurrent ? "var(--signal)" : undefined)
              const textColor = hasAccent
                ? getReadableTextColor(cert.accentColor)
                : isCurrent
                  ? "var(--signal-fg)"
                  : undefined

              return (
                <div
                  key={cert.id}
                  className="grid grid-cols-1 items-center gap-2 md:grid-cols-[180px_1fr] md:gap-5"
                >
                  <div className="flex flex-col gap-1 md:text-right">
                    <span
                      className={
                        "font-display text-sm font-semibold tracking-tight " +
                        (isCurrent ? "text-signal" : "")
                      }
                    >
                      {cert.name}
                    </span>
                    <span className="annotate">
                      {copy.education.roadmapRowMeta(
                        STATUS_LABEL[cert.status] ?? cert.status,
                        startLabel,
                        endLabel
                      )}
                    </span>
                  </div>

                  <div className="well p-1.5">
                    <div className="relative h-8">
                      <div
                        className={
                          "cast-sm annotate absolute inset-y-0 flex items-center overflow-hidden px-3 " +
                          (fill ? "" : "text-fg-muted")
                        }
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: fill,
                          color: textColor,
                        }}
                      >
                        <span className="min-w-0 truncate">
                          {copy.education.roadmapBar(
                            span,
                            cert.category || cert.provider || cert.name
                          )}
                        </span>
                      </div>
                      {todayLeft !== null && (
                        <div
                          className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-signal"
                          style={{ left: `${todayLeft}%` }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
