"use client"

import { contractEndDate, formatDate, withdrawalStatus } from "@sweberdev/inverse"
import { useId, useMemo, useState } from "react"
import { inverseDemoCopy } from "@/lib/demo/inverse-copy"

/* withdrawalStatus() and contractEndDate() from @sweberdev/inverse. */

const t = inverseDemoCopy.deadlines

const today = () => new Date().toISOString().slice(0, 10)
const valid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)

export function DeadlineCalc() {
  const ids = { start: useId(), informed: useId(), received: useId(), notice: useId(), term: useId() }
  const [start, setStart] = useState(today)
  const [informed, setInformed] = useState(true)
  const [received, setReceived] = useState(today)
  const [notice, setNotice] = useState(1)
  const [termEnd, setTermEnd] = useState("")

  const status = useMemo(
    () => (valid(start) ? withdrawalStatus({ start, informed }) : null),
    [start, informed],
  )
  const endsOn = useMemo(
    () =>
      valid(received)
        ? contractEndDate({
            received,
            notice: { months: Math.max(0, notice) },
            termEnd: valid(termEnd) ? termEnd : undefined,
          })
        : null,
    [received, notice, termEnd],
  )

  const input =
    "well h-11 w-full min-w-0 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-edge-soft bg-plate p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.start} className="annotate">
            {t.delivered}
          </label>
          <input id={ids.start} type="date" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
        </div>
        <label htmlFor={ids.informed} className="inline-flex items-center gap-2 text-sm text-fg">
          <input id={ids.informed} type="checkbox" checked={informed} onChange={(e) => setInformed(e.target.checked)} />
          {t.informed}
        </label>
        <p className="text-sm text-fg-muted" aria-live="polite">
          {t.lastDay}:{" "}
          <strong className="text-lg text-fg">{status ? formatDate(status.deadline, "en") : "–"}</strong>
          {status && (
            <span className="block">
              {status.open ? t.daysLeft.replace("{n}", String(status.daysLeft)) : t.closed}
            </span>
          )}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-edge-soft bg-plate p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.received} className="annotate">
            {t.received}
          </label>
          <input id={ids.received} type="date" value={received} onChange={(e) => setReceived(e.target.value)} className={input} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.notice} className="annotate">
            {t.notice}
          </label>
          <input
            id={ids.notice}
            type="number"
            min={0}
            max={24}
            value={notice}
            onChange={(e) => setNotice(Number(e.target.value))}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.term} className="annotate">
            {t.termEnd}
          </label>
          <input id={ids.term} type="date" value={termEnd} onChange={(e) => setTermEnd(e.target.value)} className={input} />
        </div>
        <p className="text-sm text-fg-muted" aria-live="polite">
          {t.endsOn}: <strong className="text-lg text-fg">{endsOn ? formatDate(endsOn, "en") : "–"}</strong>
        </p>
      </div>
    </div>
  )
}
