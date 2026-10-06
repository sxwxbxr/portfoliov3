"use client"

import { useState, type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  EXAMPLES,
  STUDENT_SEARCH_STRING,
  analyze,
  createModel,
  type AnalysisResult,
  type Candidate,
  type Filters,
  type PicoInput,
  type SearchModel,
} from "@/lib/physio/search-string"
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

function makeRun(text: string, pico: PicoInput, filters?: Partial<Filters>): Run {
  const analysis = analyze({ text, pico })
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
    <section aria-labelledby={id} className="grid gap-x-12 gap-y-6 border-t border-edge-soft py-10 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)]">
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

/**
 * The Suchstring-Generator. Everything runs in the browser: the question is
 * analysed by lib/physio/search-string and never leaves this component.
 * `demo` locks the free input to the shipped examples.
 */
export function SearchStringTool({ mode }: { mode: "full" | "demo" }) {
  const demo = mode === "demo"
  const first = demo ? EXAMPLES[0] : undefined

  const [exampleId, setExampleId] = useState(first?.id ?? "")
  const [text, setText] = useState(first?.text ?? "")
  const [pico, setPico] = useState<PicoInput>(first?.pico ?? {})
  const [run, setRun] = useState<Run | null>(() => (first ? makeRun(first.text, first.pico ?? {}, first.filters) : null))
  const [error, setError] = useState<string | null>(null)

  function pickExample(id: string) {
    setExampleId(id)
    setError(null)
    const ex = EXAMPLES.find((e) => e.id === id)
    if (!ex) return
    setText(ex.text)
    setPico(ex.pico ?? {})
    setRun(makeRun(ex.text, ex.pico ?? {}, ex.filters))
  }

  function submit() {
    const filled = text.trim() || Object.values(pico).some((v) => v && v.trim())
    if (!filled) {
      setError(ssCopy.question.emptyError)
      return
    }
    try {
      setRun(makeRun(text, pico))
      setError(null)
    } catch {
      setError(ssCopy.question.failError)
    }
  }

  function updateModel(model: SearchModel) {
    setRun((r) => (r ? { ...r, model, edited: true } : r))
  }

  return (
    <div className="sheet pb-24 md:pb-32">
      <p className="annotate text-fg-muted mb-6 max-w-[62ch]">{ssCopy.privacy}</p>

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
            />
          </Step>

          {run ? (
            <>
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
                <DatabasePanel model={run.model} onChange={updateModel} />
              </Step>
              <Step n={4} title={ssCopy.result.heading} hint={ssCopy.result.hint}>
                <ResultPanel model={run.model} question={run.question} />
              </Step>
            </>
          ) : (
            <div className="border-t border-edge-soft py-10">
              <p className="text-sm text-fg-muted">{ssCopy.concepts.waiting}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lint" className="mt-8">
          <Step title={ssCopy.lint.heading} hint={ssCopy.lint.hint}>
            <LintPanel locked={demo} exampleString={STUDENT_SEARCH_STRING} />
          </Step>
        </TabsContent>
      </Tabs>
    </div>
  )
}
