"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  EXAMPLES,
  STUDENT_SEARCH_STRING,
  analyzeAsync,
  createModel,
  type AnalysisResult,
  type Candidate,
  type Filters,
  type PicoInput,
  type SearchModel,
} from "@/lib/physio/search-string"
import { getMeshIndex, type MeshMeta } from "@/lib/physio/search-string/mesh-index"
import { ConceptsPanel } from "./ConceptsPanel"
import { DatabasePanel } from "./DatabasePanel"
import { LintPanel } from "./LintPanel"
import { QuestionPanel } from "./QuestionPanel"
import { ResultPanel } from "./ResultPanel"

interface Run {
  analysis: AnalysisResult
  candidates: Candidate[]
  model: SearchModel
  question: string
  edited: boolean
}

async function makeRun(text: string, pico: PicoInput, filters?: Partial<Filters>): Promise<Run> {
  const analysis = await analyzeAsync({ text, pico })
  return {
    analysis,
    candidates: analysis.candidates,
    model: createModel(analysis, filters),
    question: [text, ...Object.values(pico)].filter((x) => x && x.trim()).join(" | "),
    edited: false,
  }
}

function Step({ n, title, hint, children }: { n?: number; title: string; hint: string; children: ReactNode }) {
  const id = `ss-step-${n ?? "lint"}`
  return (
    <section aria-labelledby={id} className="grid grid-cols-1 gap-x-12 gap-y-6 border-t border-edge-soft py-10 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <header className="lg:sticky lg:top-28 lg:self-start">
        {n !== undefined && (
          <p className="annotate text-fg-muted">
            {ssCopy.step.label} {n}
          </p>
        )}
        <h2 id={id} className="headline mt-1">
          {title}
        </h2>
        <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-fg-muted">{hint}</p>
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

const TAB_CLASS =
  "min-h-11 rounded-full border border-edge-mid px-5 text-sm text-fg-muted data-[state=active]:border-signal data-[state=active]:bg-signal data-[state=active]:text-signal-fg data-[state=active]:shadow-none hover:text-fg"

/** Source line with the index version, once the dictionary's meta file has arrived. */
function Attribution() {
  const [meta, setMeta] = useState<MeshMeta | null>(null)
  useEffect(() => {
    let cancelled = false
    getMeshIndex()
      .getMeta()
      .then((m) => !cancelled && m?.version && setMeta(m))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])
  const c = meta?.counts as Record<string, number> | undefined
  return (
    <footer className="mt-10 flex flex-col gap-1 border-t border-edge-soft pt-6">
      <p className="annotate text-fg-muted">{ssCopy.attribution.source}</p>
      {meta && c && <p className="annotate text-fg-muted">{ssCopy.attribution.version(meta.version, c.descriptors ?? 0, c.descriptorsWithGerman ?? 0)}</p>}
    </footer>
  )
}

/**
 * The Suchstring-Generator. The question is analysed in the browser by
 * lib/physio/search-string and never leaves this component. The only network
 * traffic is the loading of public dictionary files (shard names, not text) and
 * the opt-in PubMed count (search string only).
 *
 * `demo` locks the free input to the shipped examples. The dictionary search
 * and the PubMed count stay usable in the demo: neither needs an own question.
 */
export function SearchStringTool({ mode }: { mode: "full" | "demo" }) {
  const demo = mode === "demo"
  const first = demo ? EXAMPLES[0] : undefined

  const [exampleId, setExampleId] = useState(first?.id ?? "")
  const [text, setText] = useState(first?.text ?? "")
  const [pico, setPico] = useState<PicoInput>(first?.pico ?? {})
  const [run, setRun] = useState<Run | null>(null)
  const [busy, setBusy] = useState(demo)
  const [error, setError] = useState<string | null>(null)
  const ticket = useRef(0)

  const analyse = useCallback(async (t: string, p: PicoInput, filters?: Partial<Filters>) => {
    const mine = ++ticket.current
    setBusy(true)
    try {
      const next = await makeRun(t, p, filters)
      if (mine !== ticket.current) return
      setRun(next)
      setError(null)
    } catch {
      if (mine === ticket.current) setError(ssCopy.question.failError)
    } finally {
      if (mine === ticket.current) setBusy(false)
    }
  }, [])

  // The demo shows the first example right away.
  useEffect(() => {
    if (first) void analyse(first.text, first.pico ?? {}, first.filters)
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickExample(id: string) {
    setExampleId(id)
    setError(null)
    const ex = EXAMPLES.find((e) => e.id === id)
    if (!ex) return
    setText(ex.text)
    setPico(ex.pico ?? {})
    void analyse(ex.text, ex.pico ?? {}, ex.filters)
  }

  function submit() {
    const filled = text.trim() || Object.values(pico).some((v) => v && v.trim())
    if (!filled) {
      setError(ssCopy.question.emptyError)
      return
    }
    void analyse(text, pico)
  }

  function updateModel(model: SearchModel) {
    setRun((r) => (r ? { ...r, model, edited: true } : r))
  }

  return (
    <div className="sheet pb-24 md:pb-32">
      <p className="annotate text-fg-muted mb-6 max-w-[72ch]">{ssCopy.privacy}</p>

      <Tabs defaultValue="generate" className="gap-0">
        <TabsList className="mb-2 h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="generate" className={TAB_CLASS}>
            {ssCopy.tabs.generate}
          </TabsTrigger>
          <TabsTrigger value="lint" className={TAB_CLASS}>
            {ssCopy.tabs.lint}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-8">
          <Step n={1} title={ssCopy.question.heading} hint={ssCopy.question.hint}>
            <QuestionPanel
              locked={demo}
              exampleId={exampleId}
              onExample={pickExample}
              text={text}
              onText={setText}
              pico={pico}
              onPico={setPico}
              onSubmit={demo ? () => pickExample(exampleId || EXAMPLES[0].id) : submit}
              error={error}
              edited={!!run?.edited}
              busy={busy}
            />
          </Step>

          {run ? (
            <div aria-busy={busy} className={busy ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <Step n={2} title={ssCopy.concepts.heading} hint={ssCopy.concepts.hint}>
                <ConceptsPanel
                  model={run.model}
                  onChange={updateModel}
                  candidates={run.candidates}
                  onCandidatesChange={(candidates) => setRun((r) => (r ? { ...r, candidates } : r))}
                  notices={run.analysis.notices}
                />
              </Step>
              <Step n={3} title={ssCopy.database.heading} hint={ssCopy.database.hint}>
                <DatabasePanel model={run.model} onChange={updateModel} suggestions={run.analysis.filterSuggestions} />
              </Step>
              <Step n={4} title={ssCopy.result.heading} hint={ssCopy.result.hint}>
                <ResultPanel model={run.model} question={run.question} />
              </Step>
            </div>
          ) : (
            <div className="border-t border-edge-soft py-10">
              {busy ? (
                <p role="status" className="inline-flex items-center gap-2 text-sm text-fg-muted">
                  <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-signal-bright" />
                  {ssCopy.attribution.loading}
                </p>
              ) : (
                <p className="text-sm text-fg-muted">{ssCopy.concepts.waiting}</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lint" className="mt-8">
          <Step title={ssCopy.lint.heading} hint={ssCopy.lint.hint}>
            <LintPanel locked={demo} exampleString={STUDENT_SEARCH_STRING} />
          </Step>
        </TabsContent>
      </Tabs>

      <Attribution />
    </div>
  )
}
