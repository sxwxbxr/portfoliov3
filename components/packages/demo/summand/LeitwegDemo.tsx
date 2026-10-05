"use client"

import { useId, useState } from "react"
import { summandDemoCopy } from "@/lib/demo/summand-copy"
import { TONE, useSummand } from "./runtime"

const t = summandDemoCopy.leitweg

/** Type a Leitweg-ID and see its parts and whether the check digits fit. */
export function LeitwegDemo() {
  const mod = useSummand()
  const [value, setValue] = useState(t.sample)
  const id = useId()

  if (mod === false) return <p className="text-sm text-fg-muted">{summandDemoCopy.failed}</p>

  const parsed = mod ? mod.parseLeitwegId(value) : undefined
  const valid = mod ? mod.isValidLeitwegId(value) : false
  const expected = mod && parsed && !valid ? mod.leitwegCheckDigits(parsed.coarse, parsed.fine) : null

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <label htmlFor={id} className="flex flex-col gap-1.5">
        <span className="annotate">{t.input}</span>
        <input
          id={id}
          className="well w-full px-3 py-2 font-mono text-sm text-fg"
          value={value}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <div aria-live="polite" className="flex flex-col gap-3">
        {!mod ? (
          <p className="text-sm text-fg-muted">{summandDemoCopy.loading}</p>
        ) : (
          <>
            <p className={`text-sm font-semibold ${valid ? TONE.pass : TONE.fail}`}>
              {valid ? `✓ ${t.valid}` : `✗ ${t.invalid}`}
            </p>
            {parsed && (
              <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-sm">
                <dt className="text-fg-muted">{t.parts.coarse}</dt>
                <dd className="font-mono">{parsed.coarse}</dd>
                {parsed.fine && (
                  <>
                    <dt className="text-fg-muted">{t.parts.fine}</dt>
                    <dd className="font-mono">{parsed.fine}</dd>
                  </>
                )}
                <dt className="text-fg-muted">{t.parts.check}</dt>
                <dd className="font-mono">{parsed.checkDigits}</dd>
              </dl>
            )}
            {expected && <p className="text-sm text-fg-muted">{t.expected(expected)}</p>}
          </>
        )}
      </div>
    </div>
  )
}
