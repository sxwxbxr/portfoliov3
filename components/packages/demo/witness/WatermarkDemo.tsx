"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { witnessDemoCopy } from "@/lib/demo/witness-copy"
import { codePoints, useWitness } from "./runtime"

const t = witnessDemoCopy.text
const area =
  "well min-h-[140px] w-full resize-y p-4 text-sm leading-relaxed text-fg focus-visible:outline-2 focus-visible:outline-signal"

/** Watermark a text, copy it, and read the watermark back from any pasted text. */
export function WatermarkDemo() {
  const mod = useWitness()
  const [text, setText] = useState(t.sample)
  const [generator, setGenerator] = useState("Chat model (example)")
  const [check, setCheck] = useState("")
  const [copied, setCopied] = useState(false)
  const [paragraphs, setParagraphs] = useState(true)
  // Fixed per page view, so the output does not change on every keystroke.
  const [createdAt, setCreatedAt] = useState("")
  useEffect(() => setCreatedAt(new Date().toISOString().slice(0, 19) + "Z"), [])
  const ids = { input: useId(), generator: useId(), output: useId(), check: useId(), paragraphs: useId() }

  const marked = useMemo(
    () =>
      mod && text
        ? mod.watermarkText(text, { generator: generator.trim() || undefined, createdAt }, { paragraphs })
        : "",
    [mod, text, generator, createdAt, paragraphs],
  )
  const found = useMemo(() => (mod && check ? mod.readTextWatermark(check) : null), [mod, check])

  if (mod === false) return <p className="text-sm text-fg-muted">{witnessDemoCopy.failed}</p>

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(marked)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCheck(marked)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <label htmlFor={ids.input} className="flex flex-col gap-1.5">
          <span className="annotate">{t.input}</span>
          <textarea id={ids.input} className={area} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label htmlFor={ids.generator} className="flex flex-col gap-1.5">
          <span className="annotate">{t.generator}</span>
          <input
            id={ids.generator}
            className="well w-full px-3 py-2 text-sm text-fg"
            value={generator}
            onChange={(e) => setGenerator(e.target.value)}
          />
        </label>
        <label htmlFor={ids.paragraphs} className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <input
            id={ids.paragraphs}
            type="checkbox"
            checked={paragraphs}
            onChange={(e) => setParagraphs(e.target.checked)}
          />
          {t.paragraphs}
        </label>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.output} className="annotate">
            {t.output}
          </label>
          <textarea id={ids.output} className={area} value={marked} readOnly />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="control px-4 py-2 text-sm" onClick={copy} disabled={!marked}>
              {copied ? t.copied : t.copy}
            </button>
            {marked && <span className="text-sm text-fg-muted">{t.length(text.length, codePoints(marked))}</span>}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <label htmlFor={ids.check} className="flex flex-col gap-1.5">
          <span className="annotate">{t.check}</span>
          <textarea
            id={ids.check}
            className={area}
            value={check}
            placeholder={t.checkHint}
            onChange={(e) => setCheck(e.target.value)}
          />
        </label>
        <div aria-live="polite" className="flex flex-col gap-4">
          {check &&
            (found ? (
              <>
                <CodeBlock
                  title={t.found}
                  code={JSON.stringify(
                    { generator: found.generator, createdAt: found.createdAt, ...(found.id ? { id: found.id } : {}) },
                    null,
                    2,
                  )}
                />
                <button
                  type="button"
                  className="control self-start px-4 py-2 text-sm"
                  onClick={() => mod && setCheck(mod.stripTextWatermark(check))}
                >
                  {t.strip}
                </button>
              </>
            ) : (
              <p className="text-sm text-fg-muted">{t.none}</p>
            ))}
        </div>
      </div>
    </div>
  )
}
