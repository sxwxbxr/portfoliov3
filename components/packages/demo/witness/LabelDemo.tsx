"use client"

import { useId, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { witnessDemoCopy } from "@/lib/demo/witness-copy"
import { Element } from "./Element"
import { useDarkTheme, useWitness, witnessTheme } from "./runtime"

const t = witnessDemoCopy
const LOCALES = ["en", "de", "fr", "it"] as const
const KINDS = ["generated", "edited", "deepfake"] as const
type Kind = (typeof KINDS)[number]

/** An article teaser with an inline label and an image with an overlay label. */
export function LabelDemo() {
  const mod = useWitness()
  const palette = witnessTheme(useDarkTheme())
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("en")
  const [kind, setKind] = useState<Kind>("generated")
  const [generator, setGenerator] = useState("Image model (example)")
  const [reviewed, setReviewed] = useState(true)
  const ids = { locale: useId(), kind: useId(), generator: useId(), reviewed: useId() }

  if (mod === false) return <p className="text-sm text-fg-muted">{t.failed}</p>

  const common = {
    kind,
    locale,
    generator: generator.trim() || undefined,
    created: "2026-10-05",
  }
  const markup = [
    `<witness-label kind="${kind}" locale="${locale}"${reviewed ? " reviewed" : ""}></witness-label>`,
    "",
    `<figure style="position: relative">`,
    `  <img src="/lagoon.jpg" alt="…">`,
    `  <witness-label variant="overlay" kind="${kind}" locale="${locale}"${common.generator ? `\n    generator="${common.generator}"` : ""} created="2026-10-05">`,
    `  </witness-label>`,
    `</figure>`,
  ].join("\n")

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <article
        lang={locale}
        className="flex min-w-0 flex-col gap-4 rounded-lg border p-5"
        style={{ borderColor: palette["--witness-border"], background: palette["--witness-bg"], color: palette["--witness-fg"] }}
      >
        <figure className="relative m-0 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- static demo asset, shown as is */}
          <img src="/demos/witness/lagoon.jpg" alt={t.labels.imageAlt} width={960} height={600} className="block h-auto w-full" />
          {mod && <Element tag="witness-label" attrs={{ ...common, variant: "overlay" }} vars={palette} />}
        </figure>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">{t.labels.articleTitle}</h3>
          {mod ? (
            <Element
              tag="witness-label"
              attrs={{ ...common, generator: undefined, reviewed: reviewed ? "" : undefined }}
              vars={palette}
            />
          ) : (
            <span className="text-sm opacity-70">{t.loading}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed">{t.labels.articleBody}</p>
      </article>

      <div className="flex min-w-0 flex-col gap-5">
        <label htmlFor={ids.locale} className="flex flex-col gap-1.5">
          <span className="annotate">{t.language}</span>
          <select
            id={ids.locale}
            className="control w-full px-3 py-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t.languages[l]}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={ids.kind} className="flex flex-col gap-1.5">
          <span className="annotate">{t.labels.kind}</span>
          <select id={ids.kind} className="control w-full px-3 py-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t.labels.kinds[k]}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={ids.generator} className="flex flex-col gap-1.5">
          <span className="annotate">{t.labels.generator}</span>
          <input
            id={ids.generator}
            className="well w-full px-3 py-2 text-sm text-fg"
            value={generator}
            onChange={(e) => setGenerator(e.target.value)}
          />
        </label>
        <label htmlFor={ids.reviewed} className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <input id={ids.reviewed} type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
          {t.labels.reviewed}
        </label>
        <CodeBlock title={t.labels.markup} code={markup} />
      </div>
    </div>
  )
}
