"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { lintGuide, type LintGuideCtx } from "@/lib/physio/guide/lint-guide"
import { EMPTY_EDITS, makeSuchstringCtx, suchstringGuide, type WorksheetEdits } from "@/lib/physio/guide/suchstring"
import {
  EXAMPLES,
  STUDENT_SEARCH_STRING,
  analyzeAsync,
  createModel,
  setDatabases,
  type AnalysisResult,
  type BuiltQuery,
  type Candidate,
  type CountRow,
  type DatabaseId,
  type Filters,
  type LintFinding,
  type PicoInput,
  type SearchModel,
} from "@/lib/physio/search-string"
import { getMeshIndex, type MeshMeta } from "@/lib/physio/search-string/mesh-index"
import { GuideInvite, GuideToggle } from "@/components/physio/guide/GuideToggle"
import { GuideProvider } from "@/components/physio/guide/GuideProvider"
import { CriteriaPanel, LintFindingsPanel, PicoPanel, TermsPanel, WorksheetPanel } from "@/components/physio/guide/suchstring-panels"
import { ConceptsPanel } from "./ConceptsPanel"
import { FilterPanel, activeFilterNames } from "./DatabasePanel"
import { Disclosure, SectionsProvider } from "./Disclosure"
import { LintPanel } from "./LintPanel"
import { MeshBrowser } from "./MeshBrowser"
import { PicoFields, QuestionPanel, picoFilledCount, PICO_KEYS } from "./QuestionPanel"
import { ResultPanel, buildAll, mergeNotices } from "./ResultPanel"
import { ComponentTables, Differences, ExportList, otherDatabases } from "./ResultSections"
import { joinNames } from "./result-utils"

interface Run {
  /** The case as it was analysed (the guided mode reads this, not what is typed right now). */
  text: string
  pico: PicoInput
  analysis: AnalysisResult
  candidates: Candidate[]
  model: SearchModel
  question: string
  edited: boolean
}

async function makeRun(text: string, pico: PicoInput, databases: DatabaseId[], filters?: Partial<Filters>): Promise<Run> {
  const analysis = await analyzeAsync({ text, pico })
  return {
    text,
    pico,
    analysis,
    candidates: analysis.candidates,
    model: setDatabases(createModel(analysis, filters), databases),
    question: [text, ...Object.values(pico)].filter((x) => x && x.trim()).join(" | "),
    edited: false,
  }
}

/** Quiet tabs: the case is the main thing on the page, the second tab is a side door. */
const TAB_CLASS =
  "-mb-px min-h-11 rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 text-sm text-fg-muted shadow-none hover:text-fg data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:text-fg data-[state=active]:shadow-none"

const GENERATE_PANELS = { pico: PicoPanel, criteria: CriteriaPanel, terms: TermsPanel, worksheet: WorksheetPanel }
const LINT_PANELS = { "lint-findings": LintFindingsPanel }

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
      <p className="annotate text-fg-muted max-w-[72ch]">{ssCopy.privacy}</p>
      <p className="annotate text-fg-muted">{ssCopy.attribution.source}</p>
      {meta && c && <p className="annotate text-fg-muted">{ssCopy.attribution.version(meta.version, c.descriptors ?? 0, c.descriptorsWithGerman ?? 0)}</p>}
    </footer>
  )
}

/** One short line per folded area, so a student can tell whether it is worth opening. */
function statusLines(run: Run, builds: BuiltQuery[], demo: boolean, pico: PicoInput) {
  const s = ssCopy.sections
  const concepts = run.model.concepts
  const withoutMesh = concepts.filter((c) => !c.mesh.some((m) => !m.removed)).length
  const filterNames = activeFilterNames(run.model)
  const f = run.model.filters
  const open = run.analysis.filterSuggestions.filter((sg) => (sg.kind === "age" ? !f.ageGroups.includes(sg.value) : f.sex !== sg.value)).length
  const filters = filterNames.length
    ? `${s.filters.active(filterNames.length)}: ${filterNames.join(", ")}`
    : open
      ? `${s.filters.none}, ${s.filters.suggestions(open)}`
      : s.filters.none
  const filled = picoFilledCount(pico)
  return {
    concepts: concepts.length ? s.concepts.status(concepts.length, withoutMesh, run.candidates.length) : s.concepts.none,
    pico: demo ? s.pico.statusLocked(filled, PICO_KEYS.length) : s.pico.status(filled, PICO_KEYS.length),
    filters,
    table: s.table.status(builds[0]?.components.length ?? 0),
    diff: s.diff.status(joinNames(["PubMed", ...otherDatabases().map((d) => d.label)])),
  }
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
  const [databases, setDatabaseChoice] = useState<DatabaseId[]>(["pubmed"])
  const databasesRef = useRef(databases)
  const ticket = useRef(0)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const focusResult = useRef(false)

  const analyse = useCallback(async (t: string, p: PicoInput, filters?: Partial<Filters>) => {
    const mine = ++ticket.current
    setBusy(true)
    try {
      const next = await makeRun(t, p, databasesRef.current, filters)
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

  /** The chips: the choice is kept here, and a result that already exists is rewritten for it (edits stay). */
  function changeDatabases(ids: DatabaseId[]) {
    if (!ids.length) return
    databasesRef.current = ids
    setDatabaseChoice(ids)
    setRun((r) => (r ? { ...r, model: setDatabases(r.model, ids) } : r))
  }

  // After "Suchstring erstellen" the focus moves to the result, so keyboard and screen reader users land on it.
  useEffect(() => {
    if (run && !busy && focusResult.current) {
      focusResult.current = false
      resultHeading.current?.focus()
    }
  }, [run, busy])

  function submit() {
    const filled = text.trim() || Object.values(pico).some((v) => v && v.trim())
    if (!filled) {
      setError(ssCopy.question.emptyError)
      return
    }
    focusResult.current = true
    void analyse(text, pico)
  }

  function updateModel(model: SearchModel) {
    setRun((r) => (r ? { ...r, model, edited: true } : r))
  }

  // ── Guided mode: everything it shows is derived from this tool's own state and stays in memory.
  const [tab, setTab] = useState("generate")
  const [counts, setCounts] = useState<CountRow[]>([])
  const [lintState, setLintState] = useState<{ text: string; findings: LintFinding[] }>({ text: "", findings: [] })
  const [lintBaseline, setLintBaseline] = useState<number | null>(null)
  const [editsState, setEditsState] = useState<{ key: string; edits: WorksheetEdits }>({ key: "", edits: EMPTY_EDITS })
  const now = useMemo(() => new Date(), [])

  const caseKey = run?.question ?? ""
  const edits = editsState.key === caseKey ? editsState.edits : EMPTY_EDITS
  const setEdits = useCallback(
    (update: (e: WorksheetEdits) => WorksheetEdits) =>
      setEditsState((prev) => ({ key: caseKey, edits: update(prev.key === caseKey ? prev.edits : EMPTY_EDITS) })),
    [caseKey],
  )
  const resetEdits = useCallback(() => setEditsState({ key: "", edits: EMPTY_EDITS }), [])
  const onLintState = useCallback((state: { text: string; findings: LintFinding[] }) => {
    setLintState(state)
    setLintBaseline((prev) => (state.text.trim() ? (prev ?? state.findings.length) : null))
  }, [])

  const guideCtx = useMemo(
    () =>
      makeSuchstringCtx({
        mode,
        text: run?.text ?? "",
        pico: run?.pico ?? {},
        busy,
        analysis: run?.analysis ?? null,
        model: run?.model ?? null,
        counts,
        edits,
        now,
        setEdits,
        resetEdits,
      }),
    [mode, run, busy, counts, edits, now, setEdits, resetEdits],
  )
  const lintCtx: LintGuideCtx = useMemo(() => ({ mode, text: lintState.text, findings: lintState.findings, baseline: lintBaseline }), [mode, lintState, lintBaseline])

  const builds = useMemo(() => (run ? buildAll(run.model) : []), [run])
  const notices = useMemo(() => (run ? mergeNotices(run.analysis.notices, builds) : []), [run, builds])
  const sectionStatus = run ? statusLines(run, builds, demo, pico) : null

  function create() {
    if (demo) {
      focusResult.current = true
      pickExample(exampleId || EXAMPLES[0].id)
    } else submit()
  }

  const body = (
    <SectionsProvider>
      <Tabs value={tab} onValueChange={setTab} className="gap-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 border-b border-edge-soft">
          <TabsList aria-label={ssCopy.tabs.label} className="h-auto flex-wrap justify-start gap-x-6 rounded-none bg-transparent p-0">
            <TabsTrigger value="generate" className={TAB_CLASS}>
              {ssCopy.tabs.generate}
            </TabsTrigger>
            <TabsTrigger value="lint" className={TAB_CLASS}>
              {ssCopy.tabs.lint}
            </TabsTrigger>
          </TabsList>
          <GuideToggle className="control-ghost shrink-0" />
        </div>

        <TabsContent value="generate" className="mt-0 flex max-w-4xl flex-col gap-6">
          <QuestionPanel
            locked={demo}
            exampleId={exampleId}
            onExample={pickExample}
            text={text}
            onText={setText}
            databases={databases}
            onDatabases={changeDatabases}
            onSubmit={create}
            error={error}
            edited={!!run?.edited}
            busy={busy}
          />

          {run && sectionStatus ? (
            <>
              <div aria-busy={busy} className={busy ? "flex flex-col gap-6 opacity-60 transition-opacity" : "flex flex-col gap-6 transition-opacity"}>
                <ResultPanel model={run.model} builds={builds} notices={notices} onCountsChange={setCounts} headingRef={resultHeading} onChange={updateModel} />
              </div>

              <GuideInvite />

              <section aria-labelledby="ss-adjust-h" aria-busy={busy} className={busy ? "flex flex-col gap-4 opacity-60 transition-opacity" : "flex flex-col gap-4 transition-opacity"}>
                <div className="flex flex-col gap-1">
                  <h2 id="ss-adjust-h" className="headline">
                    {ssCopy.sections.heading}
                  </h2>
                  <p className="text-sm text-fg-muted">{ssCopy.sections.hint}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Disclosure id="sec-concepts" guide="ss-concepts" title={ssCopy.sections.concepts.title} status={sectionStatus.concepts}>
                    <ConceptsPanel
                      model={run.model}
                      onChange={updateModel}
                      candidates={run.candidates}
                      onCandidatesChange={(candidates) => setRun((r) => (r ? { ...r, candidates } : r))}
                    />
                  </Disclosure>
                  <Disclosure id="sec-pico" guide="ss-pico" title={ssCopy.sections.pico.title} status={sectionStatus.pico}>
                    <PicoFields locked={demo} pico={pico} onPico={setPico} onSubmit={submit} busy={busy} edited={!!run.edited} />
                  </Disclosure>
                  <Disclosure id="sec-filters" guide="ss-filters" title={ssCopy.sections.filters.title} status={sectionStatus.filters}>
                    <FilterPanel model={run.model} onChange={updateModel} suggestions={run.analysis.filterSuggestions} />
                  </Disclosure>
                  <Disclosure id="sec-mesh" guide="ss-mesh" title={ssCopy.sections.mesh.title} status={ssCopy.sections.mesh.status}>
                    <MeshBrowser model={run.model} onChange={updateModel} />
                  </Disclosure>
                  {!builds[0].empty && (
                    <>
                      <Disclosure id="sec-table" guide="ss-table" title={ssCopy.sections.table.title} status={sectionStatus.table}>
                        <ComponentTables builds={builds} />
                      </Disclosure>
                      <Disclosure id="sec-diff" guide="ss-diff" title={ssCopy.sections.diff.title} status={sectionStatus.diff}>
                        <Differences model={run.model} />
                      </Disclosure>
                      <Disclosure id="sec-export" guide="ss-export" title={ssCopy.sections.export.title} status={ssCopy.sections.export.status}>
                        <ExportList builds={builds} model={run.model} question={run.question} />
                      </Disclosure>
                    </>
                  )}
                </div>
              </section>
            </>
          ) : busy ? (
            <p role="status" className="inline-flex items-center gap-2 text-sm text-fg-muted">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-signal-bright" />
              {ssCopy.attribution.loading}
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="lint" className="mt-0 flex max-w-4xl flex-col gap-6">
          <div data-guide="ss-lint">
            <LintPanel locked={demo} exampleString={STUDENT_SEARCH_STRING} onStateChange={onLintState} />
          </div>
          <GuideInvite />
        </TabsContent>
      </Tabs>

      <Attribution />
    </SectionsProvider>
  )

  return (
    <div className="sheet pb-24 md:pb-32">
      {tab === "generate" ? (
        <GuideProvider guide={suchstringGuide} ctx={guideCtx} panels={GENERATE_PANELS}>
          {body}
        </GuideProvider>
      ) : (
        <GuideProvider guide={lintGuide} ctx={lintCtx} panels={LINT_PANELS}>
          {body}
        </GuideProvider>
      )}
    </div>
  )
}
