"use client"

import { useCallback, useId, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { summandDemoCopy } from "@/lib/demo/summand-copy"
import { SAMPLES_URL, TONE, type ValidationMessage, type ValidationResult, useSummand } from "./runtime"

const t = summandDemoCopy.validate
const MAX_BYTES = 5 * 1024 * 1024

type Loaded = { name: string; bytes: Uint8Array }

const SEVERITY_TONE: Record<ValidationMessage["severity"], string> = {
  error: TONE.fail,
  warning: TONE.warn,
  info: "text-fg-muted",
}

/** Validate a sample or your own invoice with the real @sweberdev/summand build. */
export function ValidateDemo() {
  const mod = useSummand()
  const [file, setFile] = useState<Loaded | null>(null)
  const [xrechnung, setXrechnung] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputId = useId()
  const optionId = useId()

  const run = useCallback(
    (loaded: Loaded, forceXrechnung: boolean) => {
      if (!mod) return
      setBusy(true)
      setProblem(null)
      // Let the "Validating…" state paint before the synchronous check runs.
      setTimeout(() => {
        try {
          setResult(mod.validateInvoice(loaded.bytes, { xrechnung: forceXrechnung }))
        } catch {
          setProblem(summandDemoCopy.failed)
          setResult(null)
        } finally {
          setBusy(false)
        }
      }, 20)
    },
    [mod],
  )

  const open = useCallback(
    (loaded: Loaded) => {
      if (loaded.bytes.length > MAX_BYTES) {
        setProblem(t.tooLarge)
        return
      }
      setFile(loaded)
      run(loaded, xrechnung)
    },
    [run, xrechnung],
  )

  const loadSample = async (name: string) => {
    try {
      const res = await fetch(SAMPLES_URL + name)
      if (!res.ok) throw new Error(String(res.status))
      open({ name, bytes: new Uint8Array(await res.arrayBuffer()) })
    } catch {
      setProblem(summandDemoCopy.failed)
    }
  }

  const loadFile = async (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_BYTES) {
      setProblem(t.tooLarge)
      return
    }
    open({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })
  }

  if (mod === false) return <p className="text-sm text-fg-muted">{summandDemoCopy.failed}</p>

  const messages = result ? [...result.errors, ...result.warnings, ...result.infos] : []
  const s = result?.summary

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="annotate mr-2">{t.samples}:</span>
          {t.sampleList.map((sample) => (
            <button
              key={sample.file}
              type="button"
              className={`control px-4 py-2 text-sm ${file?.name === sample.file ? "control-primary" : ""}`}
              onClick={() => loadSample(sample.file)}
              disabled={!mod || busy}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void loadFile(e.dataTransfer.files[0])
          }}
          className={`well flex flex-wrap items-center justify-center gap-2 px-5 py-8 text-sm text-fg-muted ${
            dragging ? "outline-2 outline-offset-[-2px] outline-signal" : ""
          }`}
        >
          <span>{t.drop}</span>
          <label htmlFor={inputId} className="cursor-pointer text-fg underline underline-offset-2">
            {t.choose}
          </label>
          <input
            id={inputId}
            type="file"
            accept=".xml,.pdf,application/xml,text/xml,application/pdf"
            className="sr-only"
            onChange={(e) => {
              void loadFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>

        <label htmlFor={optionId} className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <input
            id={optionId}
            type="checkbox"
            checked={xrechnung}
            onChange={(e) => {
              setXrechnung(e.target.checked)
              if (file) run(file, e.target.checked)
            }}
          />
          {t.xrechnung}
        </label>
      </div>

      <div aria-live="polite" className="flex flex-col gap-8">
        {!mod && <p className="text-sm text-fg-muted">{summandDemoCopy.loading}</p>}
        {busy && <p className="text-sm text-fg-muted">{t.running}</p>}
        {problem && <p className={`text-sm ${TONE.fail}`}>{problem}</p>}

        {result && !busy && (
          <>
            <div className="flex flex-col gap-1">
              <p className={`text-lg font-semibold ${result.valid ? TONE.pass : TONE.fail}`}>
                {result.valid ? `✓ ${t.valid}` : `✗ ${t.invalid}`}
                <span className="ml-3 text-sm font-normal text-fg-muted">{file?.name}</span>
              </p>
              <p className="text-sm text-fg-muted">
                {result.valid && result.warnings.length === 0 ? `${t.validText} ` : ""}
                {t.counts(result.errors.length, result.warnings.length, result.infos.length)} ·{" "}
                {t.duration(result.durationMs)}
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <dl className="grid grid-cols-[max-content_1fr] content-start gap-x-6 gap-y-1 text-sm">
                <dt className="text-fg-muted">{t.profile}</dt>
                <dd>{result.profile?.label ?? "–"}</dd>
                <dt className="text-fg-muted">{t.syntax}</dt>
                <dd>{result.syntax ?? "–"}</dd>
                <dt className="text-fg-muted">{t.source}</dt>
                <dd>{result.source.type === "pdf" ? t.pdf(result.source.attachmentName) : t.xml}</dd>
                <dt className="text-fg-muted">{t.ruleSets}</dt>
                <dd>
                  {result.ruleSets.length
                    ? result.ruleSets.map((r) => (
                        <span key={r.id} className="block">
                          {r.name} {r.version}
                        </span>
                      ))
                    : "–"}
                </dd>
              </dl>
              {s && (
                <dl className="grid grid-cols-[max-content_1fr] content-start gap-x-6 gap-y-1 text-sm">
                  <dt className="text-fg-muted">{t.summaryFields.number}</dt>
                  <dd>{s.number ?? "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.issueDate}</dt>
                  <dd>{s.issueDate ?? "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.seller}</dt>
                  <dd>{s.seller.name ?? "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.buyer}</dt>
                  <dd>{s.buyer.name ?? "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.buyerReference}</dt>
                  <dd className="font-mono">{s.buyerReference ?? "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.payable}</dt>
                  <dd>{s.payableAmount ? `${s.payableAmount} ${s.currency ?? ""}` : "–"}</dd>
                  <dt className="text-fg-muted">{t.summaryFields.lines}</dt>
                  <dd>{s.lineCount}</dd>
                </dl>
              )}
            </div>

            {messages.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="annotate">{t.findings}</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-edge text-fg-muted">
                        <th className="py-2 pr-4 font-medium">{t.rule}</th>
                        <th className="py-2 pr-4 font-medium">{t.message}</th>
                        <th className="py-2 font-medium">{t.where}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m, i) => (
                        <tr key={`${m.id}-${i}`} className="border-b border-edge-soft align-top">
                          <td className={`py-2 pr-4 font-mono whitespace-nowrap ${SEVERITY_TONE[m.severity]}`}>
                            {m.id}
                          </td>
                          <td className="py-2 pr-4 text-fg">{m.message}</td>
                          <td className="py-2 font-mono text-xs break-all text-fg-muted">
                            {m.line ? `${t.line} ${m.line}` : ""}
                            {m.location && <span className="block">{m.location}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <details className="group">
              <summary className="annotate cursor-pointer underline underline-offset-2 hover:text-fg">{t.json}</summary>
              <div className="mt-3">
                <CodeBlock code={JSON.stringify(result, null, 2)} label={t.json} />
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
