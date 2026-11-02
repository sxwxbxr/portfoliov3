"use client"

import { useId, useMemo, useState } from "react"
import { isomorphismDemo as copy } from "@/lib/demo/isomorphism-copy"
import { Block } from "@/components/site/Block"
import { useIsomorphism } from "./runtime"

const t = copy.anonymize
const r = copy.restore
const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
const area = "well w-full px-3 py-2 font-mono text-sm leading-relaxed text-fg"

export function IsomorphismDemo() {
  const { status, runtime, start } = useIsomorphism()
  const [text, setText] = useState(t.sampleList[0].text)
  const [keep, setKeep] = useState("")
  const [answer, setAnswer] = useState(r.sample)
  const ids = { text: useId(), keep: useId(), answer: useId() }

  const result = useMemo(() => (runtime ? runtime.run(text, keep) : null), [runtime, text, keep])
  // Depends on the mapping from the run above, so it must follow `result`.
  const restored = useMemo(() => (runtime && result ? runtime.restore(answer) : ""), [runtime, result, answer])

  return (
    <>
      <Block id="start" label={copy.start.label} title={copy.start.title} sub={copy.start.sub} lede={<p>{copy.start.lede}</p>}>
        <div aria-live="polite" className="flex flex-col items-start gap-3">
          {status === "idle" && (
            <button type="button" onClick={start} className={btn + " control-primary"}>
              {copy.start.button}
            </button>
          )}
          {status === "loading" && <p className="text-sm text-fg-muted">{copy.start.loading}</p>}
          {status === "failed" && (
            <>
              <p className="text-sm text-fg" role="alert">
                {copy.start.failed}
              </p>
              <button type="button" onClick={start} className={btn}>
                {copy.start.button}
              </button>
            </>
          )}
          {status === "ready" && runtime && <p className="text-sm text-fg-muted">{copy.start.version(runtime.version)}</p>}
        </div>
      </Block>

      <Block id="anonymize" label={t.label} title={t.title} sub={t.sub} lede={<p>{t.lede}</p>}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="annotate">{t.samples}:</span>
            {t.sampleList.map((s) => (
              <button key={s.id} type="button" className={btn} onClick={() => setText(s.text)}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-4">
              <label htmlFor={ids.text} className="flex flex-col gap-1.5">
                <span className="annotate">{t.input}</span>
                <textarea id={ids.text} className={area} rows={11} spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
              </label>
              <label htmlFor={ids.keep} className="flex flex-col gap-1.5">
                <span className="annotate">{t.keep}</span>
                <textarea id={ids.keep} className={area} rows={2} spellCheck={false} value={keep} onChange={(e) => setKeep(e.target.value)} />
                <span className="text-xs text-fg-muted">{t.keepHint}</span>
              </label>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5" aria-live="polite">
              <span className="annotate">{t.output}</span>
              <pre className="well min-h-40 overflow-x-auto whitespace-pre-wrap px-3 py-2 font-mono text-sm leading-relaxed text-fg">
                {result ? result.text : "…"}
              </pre>
            </div>
          </div>

          {result && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2">
                <p className="annotate">{t.findings}</p>
                <p className="text-xs text-fg-muted">{t.findingsHint}</p>
                {result.findings.length === 0 ? (
                  <p className="text-sm text-fg-muted">{t.none}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="annotate">
                          <th className="py-1 pr-4 font-normal">{t.columns.kind}</th>
                          <th className="py-1 pr-4 font-normal">{t.columns.position}</th>
                          <th className="py-1 pr-4 font-normal">{t.columns.confidence}</th>
                          <th className="py-1 pr-4 font-normal">{t.columns.detector}</th>
                          <th className="py-1 font-normal">{t.columns.checksum}</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[13px]">
                        {result.findings.map((f, i) => (
                          <tr key={`${f.start}-${i}`} className="border-t border-line">
                            <td className="py-1 pr-4">{f.placeholder}</td>
                            <td className="py-1 pr-4">
                              {f.start}–{f.end}
                            </td>
                            <td className="py-1 pr-4">{f.confidence.toFixed(2)}</td>
                            <td className="py-1 pr-4">{f.detector}</td>
                            <td className="py-1">{f.checksum_ok === null ? t.checks.none : f.checksum_ok ? t.checks.true : t.checks.false}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p className="annotate">{t.mapping}</p>
                <p className="text-xs text-fg-muted">{t.mappingHint}</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 font-mono text-[13px]">
                  {Object.entries(result.mapping).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-fg-muted">{k}</dt>
                      <dd className="break-all">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </Block>

      <Block id="restore" label={r.label} title={r.title} sub={r.sub} lede={<p>{r.lede}</p>}>
        <div className="grid gap-8 lg:grid-cols-2">
          <label htmlFor={ids.answer} className="flex min-w-0 flex-col gap-1.5">
            <span className="annotate">{r.input}</span>
            <textarea id={ids.answer} className={area} rows={5} spellCheck={false} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <div className="flex min-w-0 flex-col gap-1.5" aria-live="polite">
            <span className="annotate">{r.output}</span>
            <pre className="well min-h-24 overflow-x-auto whitespace-pre-wrap px-3 py-2 font-mono text-sm leading-relaxed text-fg">
              {runtime ? restored : "…"}
            </pre>
          </div>
        </div>
      </Block>
    </>
  )
}
