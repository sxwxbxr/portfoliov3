"use client"

import { createElement, useEffect, useId, useRef, useState } from "react"
import { cosineDemoCopy } from "@/lib/demo/cosine-copy"
import { pkgPath } from "@/lib/packages/urls"

/*
 * Loads the browser build of @sweberdev/cosine from /public and the docs
 * index next to it. The embedding model (transformers.js + all-MiniLM-L6-v2)
 * is downloaded only when the visitor asks for it.
 */

const t = cosineDemoCopy
const LIB_URL = "/demos/cosine/cosine-0.3.0.js"
const INDEX_URL = "/demos/cosine/cosine-index.json"
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0"

type Chunk = { id: number; doc: string; url: string; title: string; headings: string[]; text: string }
type Result = {
  chunk: Chunk
  matchedBy: Array<"lexical" | "semantic">
  snippet: string
  highlights: Array<[number, number]>
}
type Engine = {
  chunks: Chunk[]
  searchLexical(q: string, o?: object): Result[]
  search(q: string, o?: object): Promise<Result[]>
  warmup(): Promise<void>
}
type Lib = {
  Cosine: new (o: object) => Engine
  VectorStore: { fromVectors(v: Float32Array[]): unknown }
  transformersEmbedder(o: object): { model: string; embed(t: string[], k: string): Promise<Float32Array[]> }
  passageText(c: Chunk): string
  highlightParts(s: string, h: Array<[number, number]>): Array<{ text: string; match: boolean }>
  defineCosineSearch(): void
}
type Manifest = { chunks: Chunk[] } & Record<string, unknown>
type ModelState = "idle" | "loading" | "ready" | "failed"

function Snippet({ lib, result }: { lib: Lib; result: Result }) {
  return (
    <>
      {lib.highlightParts(result.snippet, result.highlights).map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-transparent font-medium text-fg">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

function ResultList({ lib, results, empty }: { lib: Lib; results: Result[]; empty: string }) {
  if (!results.length) return <p className="text-sm text-fg-muted">{empty}</p>
  return (
    <ol className="flex flex-col divide-y divide-edge-soft border-t border-edge-soft">
      {results.map((r) => (
        <li key={r.chunk.id} className="flex flex-col gap-1 py-3">
          <a href={r.chunk.url} className="text-sm text-fg underline-offset-2 hover:underline">
            {[r.chunk.title, ...r.chunk.headings].join(" › ")}
          </a>
          <p className="text-sm leading-relaxed text-fg-muted">
            <Snippet lib={lib} result={r} />
          </p>
          <p className="annotate">
            {r.matchedBy.map((m) => (m === "lexical" ? t.compare.byLexical : t.compare.bySemantic)).join(" + ")}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function CosineDemo() {
  const [lib, setLib] = useState<Lib | null>(null)
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [lexical, setLexical] = useState<Engine | null>(null)
  const [hybrid, setHybrid] = useState<Engine | null>(null)
  const [model, setModel] = useState<ModelState>("idle")
  const [progress, setProgress] = useState<[number, number]>([0, 0])
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState<string>(t.compare.examples[0] as string)
  const [left, setLeft] = useState<Result[]>([])
  const [right, setRight] = useState<Result[]>([])
  const field = useRef<HTMLElement & { cosine?: Engine }>(null)
  const inputId = useId()

  useEffect(() => {
    let alive = true
    Promise.all([
      import(/* webpackIgnore: true */ LIB_URL) as Promise<Lib>,
      fetch(INDEX_URL).then((r) => (r.ok ? (r.json() as Promise<Manifest>) : Promise.reject(new Error(String(r.status))))),
    ])
      .then(([l, m]) => {
        if (!alive) return
        // Links work on the packages host and on previews under /packages.
        const fixed = { ...m, chunks: m.chunks.map((c) => ({ ...c, url: pkgPath(c.url) })) }
        l.defineCosineSearch()
        setLib(l)
        setManifest(fixed)
        setLexical(new l.Cosine({ manifest: fixed, loadModel: "never" }))
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  // The search field uses the best engine available.
  useEffect(() => {
    if (field.current && (hybrid ?? lexical)) field.current.cosine = (hybrid ?? lexical) as Engine
  }, [lexical, hybrid])

  useEffect(() => {
    if (!lexical) return
    let current = true
    setLeft(lexical.searchLexical(query, { limit: 4 }))
    if (hybrid)
      hybrid.search(query, { limit: 4 }).then((r) => {
        if (current) setRight(r)
      })
    return () => {
      current = false
    }
  }, [query, lexical, hybrid])

  async function loadModel() {
    if (!lib || !manifest || model === "loading" || model === "ready") return
    setModel("loading")
    setProgress([0, 0])
    try {
      const embedder = lib.transformersEmbedder({
        model: "english",
        load: () => import(/* webpackIgnore: true */ TRANSFORMERS_URL),
      })
      await embedder.embed(["warmup"], "query")
      const texts = manifest.chunks.map((c) => lib.passageText(c))
      const vectors: Float32Array[] = []
      for (let i = 0; i < texts.length; i += 16) {
        vectors.push(...(await embedder.embed(texts.slice(i, i + 16), "passage")))
        setProgress([Math.min(i + 16, texts.length), texts.length])
      }
      const engine = new lib.Cosine({
        manifest: { ...manifest, model: embedder.model, modelOptions: { minSimilarity: 0.2 }, vectors: "memory" },
        vectors: lib.VectorStore.fromVectors(vectors),
        embedder,
        loadModel: "eager",
      })
      await engine.warmup()
      setHybrid(engine)
      setModel("ready")
    } catch {
      setModel("failed")
    }
  }

  const status =
    model === "loading"
      ? t.model.loading(progress[0], progress[1])
      : model === "ready"
        ? t.model.ready
        : model === "failed"
          ? t.model.failed
          : t.model.idle

  if (failed) {
    return (
      <div className="well px-5 py-4" role="alert">
        <p className="text-sm text-fg">This part of the demo is not available right now.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="well p-4">
          {createElement("cosine-search", {
            ref: field,
            lang: "en",
            label: t.search.fieldLabel,
            limit: "6",
            "load-model": "never",
            style: { "--cosine-accent": "var(--color-accent, #2563eb)" },
            suppressHydrationWarning: true,
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={loadModel}
            disabled={!lib || model === "loading" || model === "ready"}
            className="control control-primary inline-flex items-center px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {t.model.load}
          </button>
          <p className="text-sm text-fg" role="status" aria-live="polite">
            {status}
          </p>
        </div>
        <p className="annotate max-w-2xl">{t.model.note}</p>
      </div>

      <section id="compare" style={{ scrollMarginTop: "6rem" }} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.compare.title}</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{t.compare.lede}</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="annotate">{t.compare.examplesLabel}</p>
          <div className="flex flex-wrap gap-2">
            {t.compare.examples.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                aria-pressed={q === query}
                className="control px-3 py-1.5 text-sm aria-pressed:border-fg"
              >
                {q}
              </button>
            ))}
          </div>
          <label htmlFor={inputId} className="annotate mt-2">
            {t.compare.inputLabel}
          </label>
          <input
            id={inputId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="control w-full max-w-xl px-3 py-2 text-sm"
          />
        </div>
        {lib && (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <section className="flex min-w-0 flex-col gap-3" aria-label={t.compare.keyword}>
              <h4 className="text-base tracking-tight">{t.compare.keyword}</h4>
              <ResultList lib={lib} results={left} empty={t.compare.none} />
            </section>
            <section className="flex min-w-0 flex-col gap-3" aria-label={t.compare.hybrid}>
              <h4 className="text-base tracking-tight">{t.compare.hybrid}</h4>
              {hybrid ? (
                <ResultList lib={lib} results={right} empty={t.compare.none} />
              ) : (
                <p className="text-sm text-fg-muted">{t.compare.needsModel}</p>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  )
}
