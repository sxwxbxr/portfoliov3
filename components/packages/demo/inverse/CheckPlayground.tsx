"use client"

import { checkHtml, type Verdict } from "@sweberdev/inverse"
import { useId, useMemo, useState } from "react"
import { inverseDemoCopy } from "@/lib/demo/inverse-copy"

/* Runs checkHtml() from @sweberdev/inverse on the HTML in the text area. */

const t = inverseDemoCopy.check

const PRESETS: Record<keyof typeof t.presets, string> = {
  good: `<footer>
  <a href="/impressum">Impressum</a>
  <a href="/widerruf">Vertrag widerrufen</a>
  <a href="/kuendigen">Verträge hier kündigen</a>
</footer>`,
  similar: `<footer>
  <a href="/widerruf">Widerrufen</a>
  <button type="button">Abo kündigen</button>
</footer>`,
  info: `<footer>
  <a href="/widerrufsbelehrung">Widerrufsbelehrung</a>
  <a href="/agb#kuendigungsfrist">Kündigungsfrist</a>
</footer>`,
  login: `<footer>
  <a href="/login?next=/widerruf">Vertrag widerrufen</a>
  <a href="/konto/kuendigen">Verträge hier kündigen</a>
</footer>`,
}

const COLORS: Record<Verdict, string> = {
  pass: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  fail: "text-red-700 dark:text-red-400",
}

export function CheckPlayground() {
  const inputId = useId()
  const [html, setHtml] = useState(PRESETS.good)
  const result = useMemo(() => checkHtml(html), [html])
  const small =
    "control px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="annotate">{t.examples}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
              <button
                key={k}
                type="button"
                className={small + (html === PRESETS[k] ? " control-primary" : "")}
                aria-pressed={html === PRESETS[k]}
                onClick={() => setHtml(PRESETS[k])}
              >
                {t.presets[k]}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor={inputId} className="annotate">
          {t.input}
        </label>
        <textarea
          id={inputId}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          rows={10}
          className="well w-full min-w-0 p-3 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4" aria-live="polite">
        <p className="annotate">{t.result}</p>
        {result.results.map((r) => (
          <div key={r.kind} className="flex flex-col gap-2 rounded-xl border border-edge-soft bg-plate p-5">
            <p className="text-base font-medium text-fg">
              {r.kind === "withdrawal" ? t.withdrawal : t.cancellation}:{" "}
              <span className={COLORS[r.verdict]}>{t.verdict[r.verdict]}</span>
            </p>
            <p className="text-sm text-fg-muted">{r.message}</p>
            {r.matches.length > 0 && (
              <ul className="flex flex-col gap-1 text-sm">
                {r.matches.map((m, i) => (
                  <li key={`${m.label}-${i}`} className="text-fg">
                    <span className={COLORS[m.verdict]}>{t.verdict[m.verdict]}</span>{" "}
                    <code className="font-mono">
                      &lt;{m.tag}&gt; {m.label}
                    </code>
                    {m.href ? <span className="text-fg-muted"> → {m.href}</span> : null}
                    <span className="block text-fg-muted">{m.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
