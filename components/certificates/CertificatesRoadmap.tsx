import type { Certificate } from "./CertificateCard"
import { formatMonth, getReadableTextColor } from "@/lib/utils"

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
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

export default function CertificatesRoadmap({
  certs,
}: {
  certs: Certificate[]
}) {
  const { entries, months } = buildRoadmap(certs)
  if (entries.length === 0) return null

  const totalMonths = months.length

  return (
    <div className="glass rounded-xl p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 pb-5 border-b border-border mb-6">
        <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight">
          {entries.length} certificate{entries.length !== 1 ? "s" : ""} in motion
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {formatMonth(months[0])} -- {formatMonth(months[months.length - 1])}
        </p>
      </header>

      {/* Month grid */}
      <div
        className="grid border border-border rounded-lg overflow-hidden text-center"
        style={{ gridTemplateColumns: `repeat(${totalMonths}, minmax(0, 1fr))` }}
      >
        {months.map((m, i) => {
          const [y, mo] = m.split("-")
          const date = new Date(Number(y), Number(mo) - 1, 1)
          return (
            <div
              key={m}
              className="px-1 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground border-r border-border last:border-r-0"
            >
              <div className="font-display text-sm font-semibold text-foreground">
                M{i + 1}
              </div>
              {date.toLocaleString("en-US", { month: "short" })}
            </div>
          )
        })}
      </div>

      {/* Phase bars */}
      <div className="mt-6 space-y-3">
        {entries.map(({ cert, startOffset, span, startLabel, endLabel }) => {
          const left = (startOffset / totalMonths) * 100
          const width = (span / totalMonths) * 100
          const hasAccent = Boolean(cert.accentColor)
          const fill =
            cert.accentColor ||
            (cert.status === "in-progress"
              ? "var(--primary)"
              : "var(--muted-foreground)")
          const textColor = hasAccent
            ? getReadableTextColor(cert.accentColor)
            : cert.status === "in-progress"
              ? "var(--primary-foreground)"
              : "var(--background)"
          return (
            <div
              key={cert.id}
              className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-3 md:gap-5"
            >
              <div className="flex flex-col gap-1 md:text-right">
                <span className="font-display text-sm font-semibold tracking-tight">
                  {cert.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {STATUS_LABEL[cert.status] ?? cert.status}
                  {startLabel && ` · ${startLabel}`}
                  {endLabel && ` -- ${endLabel}`}
                </span>
              </div>
              <div className="relative h-8 bg-foreground/[0.04] rounded-md overflow-hidden border border-border">
                <div
                  className="absolute top-0 bottom-0 flex items-center px-3 text-[10px] font-mono uppercase tracking-[0.12em]"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: fill,
                    opacity:
                      hasAccent || cert.status === "in-progress" ? 1 : 0.65,
                    color: textColor,
                  }}
                >
                  <span className="truncate">
                    {span} mo · {cert.category || cert.provider || cert.name}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
