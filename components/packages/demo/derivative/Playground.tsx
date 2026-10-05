"use client"

import { useId, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { derivativeDemoCopy } from "@/lib/demo/derivative-copy"
import { useDerivative } from "./runtime"
import { CHANGESETS_SAMPLE, COMMITS_SAMPLE, KEEP_A_CHANGELOG_SAMPLE, parseOneline } from "./samples"
import { Widget } from "./Widget"

const t = derivativeDemoCopy.playground

const SOURCES = {
  changesets: CHANGESETS_SAMPLE,
  keepachangelog: KEEP_A_CHANGELOG_SAMPLE,
  commits: COMMITS_SAMPLE,
} as const
type Source = keyof typeof SOURCES

/** Paste a changelog, see the feed and the widget the build would produce. Runs only in the browser. */
export function Playground() {
  const mod = useDerivative()
  const { resolvedTheme } = useTheme()
  const [source, setSource] = useState<Source>("changesets")
  const [text, setText] = useState<string>(SOURCES.changesets)
  const [unreleased, setUnreleased] = useState(false)
  const ids = { source: useId(), input: useId(), unreleased: useId() }

  const feed = useMemo(() => {
    if (!mod) return null
    const releases =
      source === "commits"
        ? mod.parseCommits(parseOneline(text), { includeUnreleased: unreleased })
        : mod.parseChangelog(text, { includeUnreleased: unreleased })
    // `git log --oneline` has no dates; leave the field out rather than empty.
    for (const r of releases) if (!r.date) delete r.date
    return mod.createFeed(releases, { generatedAt: null })
  }, [mod, source, text, unreleased])

  const pick = (next: Source) => {
    setSource(next)
    setText(SOURCES[next])
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <label htmlFor={ids.source} className="flex flex-col gap-1.5">
          <span className="annotate">{t.source}</span>
          <select
            id={ids.source}
            className="control w-full px-3 py-2 text-sm"
            value={source}
            onChange={(e) => pick(e.target.value as Source)}
          >
            <option value="changesets">{t.sources.changesets}</option>
            <option value="keepachangelog">{t.sources.keepachangelog}</option>
            <option value="commits">{t.sources.commits}</option>
          </select>
        </label>
        <label htmlFor={ids.input} className="flex flex-col gap-1.5">
          <span className="annotate">{t.input}</span>
          <textarea
            id={ids.input}
            className="well min-h-[360px] w-full resize-y p-4 font-mono text-[13px] leading-relaxed text-fg focus-visible:outline-2 focus-visible:outline-signal"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label htmlFor={ids.unreleased} className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <input
            id={ids.unreleased}
            type="checkbox"
            checked={unreleased}
            onChange={(e) => setUnreleased(e.target.checked)}
          />
          {t.unreleased}
        </label>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="annotate">{t.preview}</p>
          <div className="well p-5" aria-live="polite">
            {feed ? (
              feed.releases.length ? (
                <Widget feed={feed} attrs={{
                    mode: "inline",
                    lang: "en",
                    theme: resolvedTheme === "dark" ? "dark" : "light",
                    "storage-key": "derivative-demo:playground",
                  }} />
              ) : (
                <p className="text-sm text-fg-muted">{t.empty}</p>
              )
            ) : (
              <p className="text-sm text-fg-muted">{mod === false ? t.error : t.loading}</p>
            )}
          </div>
        </div>
        {feed && <CodeBlock title={t.output} code={JSON.stringify(feed, null, 2)} label="changelog.json" />}
      </div>
    </div>
  )
}
