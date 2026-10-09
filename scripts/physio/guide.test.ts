/**
 * Tests for the guided mode: framework helpers (storage, step bounds) and the
 * pure logic behind the Suchstring-Generator guide (case reading, PICO prefill,
 * Fragestellung, criteria, observations, counts, worksheet export, lint guide).
 * The Herr Müller case runs through analyzeAsync against the generated MeSH
 * index on disk (run `npm run physio:mesh` first), like mesh-index.test.ts.
 * Run: npx tsx --test scripts/physio/guide.test.ts
 */
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { before, describe, it } from "node:test"
import {
  DATABASES,
  EXAMPLES,
  STUDENT_SEARCH_STRING,
  analyzeAsync,
  createModel,
  lintQuery,
  setBlockIncluded,
  setDatabases,
  type AnalysisResult,
  type CountRow,
  type Filters,
  type PicoInput,
  type SearchModel,
} from "../../lib/physio/search-string"
import { createMeshIndex } from "../../lib/physio/search-string/mesh-index"
import { guideCopy } from "../../lib/physio/copy/guide"
import { evidenceSentence, extractGoals, findDuration, ignoredParts, readCase } from "../../lib/physio/guide/case-reading"
import { readCounts } from "../../lib/physio/guide/counts"
import { activeCriteria, resolveCriteria, suggestCriteria } from "../../lib/physio/guide/criteria"
import { lintChecklist, lintGuide, sortFindings, explainFinding, type LintGuideCtx } from "../../lib/physio/guide/lint-guide"
import { buildFragestellung, dativeify, refineQuestion, resolvePico, shortLabel, suggestPico } from "../../lib/physio/guide/pico"
import { EMPTY_GUIDE_STATE, guideStorageKey, loadGuideState, saveGuideState } from "../../lib/physio/guide/storage"
import { EMPTY_EDITS, makeSuchstringCtx, suchstringGuide, worksheetOf, type SuchstringGuideCtx, type WorksheetEdits } from "../../lib/physio/guide/suchstring"
import { anchorsOf, clampStep, resolveAction } from "../../lib/physio/guide/types"
import { worksheetMarkdown, worksheetText, WORKSHEET_DRAFT_NOTE } from "../../lib/physio/guide/worksheet"

const PUBLIC = join(process.cwd(), "public")
const NOW = new Date("2026-10-06T10:00:00Z")

function diskFetch(): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    try {
      return new Response(await readFile(join(PUBLIC, String(input))), { status: 200 })
    } catch {
      return new Response("not found", { status: 404 })
    }
  }) as typeof fetch
}

const mesh = createMeshIndex({ fetch: diskFetch() })

interface Loaded {
  text: string
  pico: PicoInput
  analysis: AnalysisResult
  model: SearchModel
}

async function load(text: string, pico: PicoInput = {}, filters = {}): Promise<Loaded> {
  const analysis = await analyzeAsync({ text, pico }, { mesh })
  return { text, pico, analysis, model: createModel(analysis, filters) }
}

function ctxOf(l: Loaded | null, over: Partial<Parameters<typeof makeSuchstringCtx>[0]> = {}): SuchstringGuideCtx {
  return makeSuchstringCtx({
    mode: "full",
    text: l?.text ?? "",
    pico: l?.pico ?? {},
    busy: false,
    analysis: l?.analysis ?? null,
    model: l?.model ?? null,
    counts: [],
    edits: EMPTY_EDITS,
    now: NOW,
    ...over,
  })
}

const step = (id: string) => suchstringGuide.steps.find((s) => s.id === id)!
const texts = (ctx: SuchstringGuideCtx, id: string) => step(id).observe(ctx).map((o) => o.text)

/** A pasted case, the way the tool used to be fed. It still has to work; a notice recommends a question. */
const MUELLER_FULL: { text: string; pico?: PicoInput; filters?: Partial<Filters> } = {
  text: "Herr Müller, 45 Jahre, Bürokaufmann. Chronische Rückenschmerzen im unteren Rückenbereich (LWS). Mehrere kurze Krankheitsausfälle in den letzten sechs Monaten aufgrund von Rückenschmerzen. Anamnese: seit etwa einem Jahr wiederkehrende Rückenschmerzen, vor allem nach langen Sitzphasen im Büro, strahlen gelegentlich in die Beine aus. Verschiedene Schmerzmittel brachten nur kurzfristige Linderung. Ein Freund hat ihm Rückentraining empfohlen. Er sucht ein Trainingsprogramm, um seine Rückenschmerzen zu reduzieren und seine Arbeitsfähigkeit zu verbessern.",
}
/** A question with explicit PICO fields. */
const MUELLER_SHORT = {
  text: "Wie wirkt Rückentraining im Vergleich zu Schmerzmitteln bei Büroangestellten mit chronischen Rückenschmerzen im LWS-Bereich auf die Arbeitsfähigkeit?",
  pico: {
    population: "Mann, mittleres Alter, wiederkehrende Rückenschmerzen nach langem Sitzen, ausstrahlend in die Beine",
    intervention: "Rückentraining",
    comparison: "Schmerzmittel",
    outcome: "Schmerzen, Arbeitsfähigkeit",
  } as PicoInput,
  filters: undefined as Partial<Filters> | undefined,
}
/** The shipped example: a plain research question, no PICO fields. */
const MUELLER_Q = EXAMPLES.find((e) => e.id === "mueller")!

/** `mueller`: the pasted case (still supported). `question`: the shipped example, a plain research question. */
let mueller: Loaded
let ctx: SuchstringGuideCtx
let question: Loaded
let qctx: SuchstringGuideCtx

before(async () => {
  mueller = await load(MUELLER_FULL.text, MUELLER_FULL.pico ?? {}, MUELLER_FULL.filters)
  ctx = ctxOf(mueller)
  question = await load(MUELLER_Q.text, MUELLER_Q.pico ?? {}, MUELLER_Q.filters)
  qctx = ctxOf(question)
})

describe("framework: types and storage", () => {
  it("clamps the stored step into the guide", () => {
    assert.equal(clampStep(3, 8), 3)
    assert.equal(clampStep(-4, 8), 0)
    assert.equal(clampStep(99, 8), 7)
    assert.equal(clampStep("x", 8), 0)
    assert.equal(clampStep(undefined, 8), 0)
    assert.equal(clampStep(2.9, 8), 2)
  })

  it("accepts a single anchor, a list or none", () => {
    assert.deepEqual(anchorsOf({ anchor: "a" }), ["a"])
    assert.deepEqual(anchorsOf({ anchor: ["a", "b"] }), ["a", "b"])
    assert.deepEqual(anchorsOf({ anchor: [] }), [])
    assert.deepEqual(anchorsOf({ anchor: "" }), [])
  })

  it("resolves a static or a computed action", () => {
    assert.equal(resolveAction({ ...step("pico"), action: "x" }, ctx), "x")
    assert.equal(resolveAction({ ...step("pico"), action: () => "y" }, ctx), "y")
    assert.equal(resolveAction({ ...step("pico"), action: undefined }, ctx), null)
  })

  it("stores on/off, invitation and step per guide, and nothing of the case", () => {
    const mem = new Map<string, string>()
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) }
    assert.deepEqual(loadGuideState("suchstring", storage), EMPTY_GUIDE_STATE)
    saveGuideState("suchstring", { on: true, invited: true, steps: { "suchstring.generate": 4 } }, storage)
    const raw = mem.get(guideStorageKey("suchstring"))!
    assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), ["invited", "on", "steps"])
    assert.deepEqual(loadGuideState("suchstring", storage), { on: true, invited: true, steps: { "suchstring.generate": 4 } })
  })

  it("survives broken, hostile or missing storage", () => {
    const bad = { getItem: () => "{not json", setItem: () => undefined }
    assert.deepEqual(loadGuideState("t", bad), EMPTY_GUIDE_STATE)
    const throwing = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {
        throw new Error("blocked")
      },
    }
    assert.deepEqual(loadGuideState("t", throwing), EMPTY_GUIDE_STATE)
    assert.doesNotThrow(() => saveGuideState("t", EMPTY_GUIDE_STATE, throwing))
    assert.deepEqual(loadGuideState("t", null), EMPTY_GUIDE_STATE)
    const weird = { getItem: () => JSON.stringify({ on: "yes", steps: { a: "x", b: 2 } }), setItem: () => undefined }
    assert.deepEqual(loadGuideState("t", weird), { on: false, invited: false, steps: { b: 2 } })
  })
})

describe("Fragestellung prüfen: what the tool takes from a pasted Herr Müller case", () => {
  it("reads person, complaint, intervention, goals, comparison", () => {
    const r = ctx.reading
    assert.equal(r.empty, false)
    assert.equal(r.age?.years, 45)
    assert.equal(r.age?.group, "Middle Aged")
    assert.equal(r.sex?.value, "Male")
    assert.equal(r.groups[0].termId, "office-workers")
    assert.equal(r.groups[0].matched, "Bürokaufmann")
    assert.equal(r.conditions[0].termId, "low-back-pain")
    assert.equal(r.interventions[0].termId, "back-exercise")
    assert.equal(r.comparisons[0].termId, "analgesics")
    assert.equal(r.chronicity, "chronisch")
    assert.equal(r.duration, "seit etwa einem Jahr")
    assert.equal(r.radiating, true)
    assert.deepEqual(r.goals.map((g) => `${g.noun} ${g.verb}`), ["Rückenschmerzen reduzieren", "Arbeitsfähigkeit verbessern"])
  })

  it("lists the words it did not use", () => {
    assert.ok(ctx.reading.unmapped.includes("sitzphasen"))
  })

  it("ignores task-sheet boilerplate and does not offer its words as leftovers", async () => {
    const sheet = [
      "Übung 3 Suchstrategie",
      "Herr Müller, 45 Jahre, Bürokaufmann. Chronische Rückenschmerzen im unteren Rückenbereich (LWS). Er sucht ein Trainingsprogramm, um seine Rückenschmerzen zu reduzieren.",
      "1. Formulieren Sie eine Fragestellung nach dem PICO-Schema.",
      "2. Folgen Sie den ersten 5 Schritten von RefHunter.",
    ].join("\n")
    const l = await load(sheet)
    const r = readCase({ text: sheet, pico: {}, analysis: l.analysis })
    assert.ok(r.ignored.some((x) => x.startsWith("Übung 3")))
    assert.ok(r.ignored.some((x) => x.startsWith("Formulieren Sie")))
    assert.ok(r.ignored.some((x) => x.startsWith("Folgen Sie")))
    assert.ok(!r.ignored.some((x) => x.includes("Herr Müller")))
    assert.ok(!r.unmapped.includes("refhunter"))
    assert.equal(r.age?.years, 45)
  })

  it("keeps a plain case free of ignored lines", () => {
    assert.deepEqual(ignoredParts(MUELLER_FULL.text), [])
  })

  it("finds goals, durations and evidence sentences without inventing any", () => {
    assert.deepEqual(extractGoals("Herr Müller ist 45 Jahre alt."), [])
    assert.equal(findDuration("Er hat seit zwei Monaten Schmerzen."), "seit zwei Monaten")
    assert.equal(findDuration("Er war vor einem Jahr beim Arzt."), null)
    assert.equal(evidenceSentence(MUELLER_FULL.text, "Schmerzmittel"), "Verschiedene Schmerzmittel brachten nur kurzfristige Linderung.")
    assert.equal(evidenceSentence(MUELLER_FULL.text, "Nierenstein"), null)
  })

  it("observes every part of the case with the case's own words", () => {
    const out = texts(ctx, "question").join("\n")
    assert.match(out, /45 Jahre/)
    assert.match(out, /Middle Aged/)
    assert.match(out, /Herr/)
    assert.match(out, /Bürokaufmann/)
    assert.match(out, /Unterer Rückenschmerz/)
    assert.match(out, /seit etwa einem Jahr/)
    assert.match(out, /Rückenschmerzen reduzieren/)
    assert.match(out, /Schmerzmittel/)
    assert.match(out, /Sitzphasen/)
  })

  it("says so when nothing was analysed yet, and when it is busy", () => {
    const none = ctxOf(null)
    assert.equal(step("question").ready!(none), false)
    assert.equal(step("question").observe(none)[0].text, guideCopy.suchstring.obs.empty)
    assert.equal(step("question").observe(ctxOf(null, { busy: true }))[0].text, guideCopy.suchstring.obs.busy)
    assert.equal(step("question").ready!(ctx), true)
  })
})

describe("Fragestellung prüfen: a research question", () => {
  const obsText = (c: SuchstringGuideCtx) => step("question").observe(c)
  const labels = (c: SuchstringGuideCtx) => obsText(c).map((x) => x.label)

  it("lists population, intervention, comparison and outcome of the Herr Müller question", () => {
    const out = obsText(qctx)
    const all = out.map((x) => x.text).join("\n")
    assert.deepEqual(
      labels(qctx).filter((l) => l?.includes("(")),
      ["Intervention (I)", "Vergleich (C)", "Outcome (O)", "Outcome (O)"],
    )
    assert.match(all, /Büroangestellte/)
    assert.match(all, /Unterer Rückenschmerz/)
    assert.match(all, /Rückentraining/)
    assert.match(all, /Schmerzmittel/)
    assert.match(all, /«Schmerzen und Arbeitsfähigkeit»/)
    assert.ok(out.some((x) => x.text === guideCopy.suchstring.obs.allParts && x.tone === "good"))
    assert.ok(!out.some((x) => x.tone === "warn"))
    assert.equal(qctx.looksCase, false)
  })

  it("states no age and no sex when the question has none, and invents nothing", () => {
    assert.equal(qctx.reading.age, null)
    assert.equal(qctx.reading.sex, null)
    assert.ok(!labels(qctx).includes("Alter"))
    assert.ok(!labels(qctx).includes("Geschlecht"))
  })

  it("flags a missing outcome with a concrete prompt and lets the student go on", async () => {
    const l = await load("Wie wirkt Rückentraining im Vergleich zu Schmerzmitteln bei Büroangestellten mit chronischen Rückenschmerzen?")
    const c = ctxOf(l)
    const warn = obsText(c).filter((x) => x.tone === "warn")
    assert.equal(warn.length, 1)
    assert.equal(warn[0].text, "Es fehlt ein Outcome: Was soll sich verbessern? Zum Beispiel «auf die Schmerzen» oder «auf die Beweglichkeit».")
    assert.equal(warn[0].label, "Outcome (O)")
    assert.ok(!obsText(c).some((x) => x.text === guideCopy.suchstring.obs.allParts))
    assert.equal(step("question").ready!(c), true)
    // The PICO step shows the same gap.
    assert.equal(c.resolved.cells.O.text, "")
    assert.equal(c.resolved.complete, false)
    assert.match(texts(c, "pico").join("\n"), /Noch leer: O, Outcome/)
  })

  it("flags a missing intervention and a missing population", async () => {
    const noI = ctxOf(await load("Welche Wirkung hat das auf die Schmerzen bei Menschen mit Kniearthrose?"))
    assert.ok(obsText(noI).some((x) => x.tone === "warn" && /^Es fehlt eine Intervention: Was wird gemacht/.test(x.text)))
    const noP = ctxOf(await load("Wie wirkt Krafttraining auf die Schmerzen?"))
    assert.ok(obsText(noP).some((x) => x.tone === "warn" && /^Es fehlt eine Population: Wer ist gemeint/.test(x.text)))
  })

  it("treats a missing comparison as allowed, not as a warning", async () => {
    const c = ctxOf(await load("Welche Wirkung hat Krafttraining auf die Schmerzen und die Funktion bei älteren Menschen mit Kniearthrose?"))
    const cmp = obsText(c).find((x) => x.label === "Vergleich (C)")!
    assert.equal(cmp.tone, "info")
    assert.match(cmp.text, /Das ist erlaubt/)
    assert.ok(obsText(c).some((x) => x.text === guideCopy.suchstring.obs.allParts))
  })

  it("reports an age or sex only when the question states one", async () => {
    const c = ctxOf(await load("Wie wirkt Gangtraining bei einer 72-jährigen Patientin nach einem Schlaganfall auf die Gehgeschwindigkeit?"))
    assert.ok(labels(c).includes("Alter"))
    assert.ok(labels(c).includes("Geschlecht"))
  })

  it("warns, but still reads, when the input is a pasted case", () => {
    assert.equal(ctx.looksCase, true)
    const first = obsText(ctx)[0]
    assert.equal(first.tone, "warn")
    assert.equal(first.text, guideCopy.suchstring.obs.caseLike)
    assert.ok(obsText(ctx).some((x) => /45 Jahre/.test(x.text)))
    assert.equal(ctx.resolved.question.suggested.startsWith("Wie wirkt Rückentraining"), true, "built from the table, not from the pasted case")
  })

  it("is not ready before an analysis exists", () => {
    assert.equal(step("question").ready!(ctxOf(null)), false)
  })
})

describe("Fragestellung as refined version of the student's question", () => {
  it("tidies the question instead of replacing it", () => {
    assert.equal(refineQuestion("  wie wirkt   Krafttraining bei Kniearthrose "), "Wie wirkt Krafttraining bei Kniearthrose?")
    assert.equal(
      refineQuestion("Wie wirkt Hydrotherapie auf die Lebensqualität bei Fibromyalgie? Nur randomisierte kontrollierte Studien."),
      "Wie wirkt Hydrotherapie auf die Lebensqualität bei Fibromyalgie?",
    )
    assert.equal(refineQuestion("Krafttraining Kniearthrose"), "Krafttraining Kniearthrose")
    assert.equal(refineQuestion(""), "")
  })

  it("starts as the student's own wording", () => {
    assert.equal(qctx.resolved.question.suggested, MUELLER_Q.text)
    assert.equal(qctx.resolved.question.text, MUELLER_Q.text)
  })

  it("is rebuilt from the table once a cell is edited", () => {
    const edited = ctxOf(question, { edits: { pico: { cells: { I: "Rumpfstabilisation" } }, criteria: {} } })
    assert.match(edited.resolved.question.suggested, /^Wie wirkt Rumpfstabilisation im Vergleich zu Schmerzmitteln bei Büroangestellten/)
    assert.notEqual(edited.resolved.question.suggested, MUELLER_Q.text)
  })

  it("fills the table from the question, including the outcome in the student's words", () => {
    const c = qctx.resolved.cells
    assert.match(c.P.text, /^Büroangestellte mit chronischen Rückenschmerzen im unteren Rücken/)
    assert.doesNotMatch(c.P.text, /Jahre/, "no age in the population when the question names none")
    assert.equal(c.I.text, "Rückentraining")
    assert.equal(c.C.text, "Schmerzmittel")
    assert.equal(c.O.text, "Schmerzen, Arbeitsfähigkeit")
    assert.equal(qctx.resolved.complete, true)
  })
})

describe("criteria from a question", () => {
  it("proposes no age limit and says so when the question has no age", () => {
    const ids = qctx.suggestedCriteria.map((c) => c.id)
    assert.ok(!ids.includes("age"))
    assert.ok(!ids.includes("x-children"))
    assert.ok(!ids.includes("x-retired"))
    assert.ok(texts(qctx, "criteria").includes(guideCopy.suchstring.obs.criteriaNoAge))
    for (const c of qctx.suggestedCriteria) assert.doesNotMatch(c.reason, /im Fall|Der Fall/, c.id)
  })

  it("takes an age group from the question text, not from an assumed age", async () => {
    const c = ctxOf(await load("Welche Wirkung hat Krafttraining auf die Schmerzen und die Funktion bei älteren Menschen mit Kniearthrose?"))
    const age = c.suggestedCriteria.find((x) => x.id === "age")!
    assert.match(age.reason, /Deine Frage nennt «/)
    assert.ok(!texts(c, "criteria").includes(guideCopy.suchstring.obs.criteriaNoAge))
  })
})

describe("worksheet of a question", () => {
  it("opens with the student's own Fragestellung and keeps the refined one next to the PICO table", () => {
    const text = worksheetText(worksheetOf(qctx))
    assert.match(text, /1\. Fragestellung\nWie wirkt Rückentraining im Vergleich zu Schmerzmitteln/)
    assert.match(text, /Überarbeitete Fragestellung: Wie wirkt Rückentraining/)
    assert.doesNotMatch(text, /1\. Fall/)
    assert.match(worksheetMarkdown(worksheetOf(qctx)), /## 1\. Fragestellung/)
  })
})

describe("PICO formulieren", () => {
  it("pre-fills the table from the case", () => {
    const c = ctx.resolved.cells
    assert.equal(c.P.text, "Büroangestellte (45 Jahre) mit chronischen Rückenschmerzen im unteren Rücken (LWS)")
    assert.equal(c.I.text, "Rückentraining")
    assert.equal(c.C.text, "Schmerzmittel")
    assert.equal(c.O.text, "Schmerzen, Arbeitsfähigkeit")
    assert.equal(ctx.resolved.complete, true)
  })

  it("builds the Fragestellung from the table", () => {
    assert.equal(
      ctx.resolved.question.text,
      "Wie wirkt Rückentraining im Vergleich zu Schmerzmitteln bei Büroangestellten (45 Jahre) mit chronischen Rückenschmerzen im unteren Rücken (LWS) auf Schmerzen und Arbeitsfähigkeit?",
    )
  })

  it("prefers the PICO fields the student typed", async () => {
    const l = await load(MUELLER_SHORT.text, MUELLER_SHORT.pico ?? {}, MUELLER_SHORT.filters)
    const c = ctxOf(l)
    assert.equal(c.resolved.cells.I.text, "Rückentraining")
    assert.equal(c.resolved.cells.I.source, "typed")
    assert.equal(c.resolved.cells.P.text, MUELLER_SHORT.pico!.population)
    assert.equal(c.resolved.cells.O.text, "Schmerzen, Arbeitsfähigkeit")
  })

  it("keeps edits on top of the suggestion and lets the student reset a cell", () => {
    const edited = ctxOf(mueller, { edits: { pico: { cells: { I: "Rumpfstabilisation" } }, criteria: {} } })
    assert.equal(edited.resolved.cells.I.text, "Rumpfstabilisation")
    assert.equal(edited.resolved.cells.I.edited, true)
    assert.equal(edited.resolved.cells.I.suggested, "Rückentraining")
    assert.match(edited.resolved.question.text, /^Wie wirkt Rumpfstabilisation im Vergleich/)
    const own = ctxOf(mueller, { edits: { pico: { question: "Eigene Frage?" }, criteria: {} } })
    assert.equal(own.resolved.question.text, "Eigene Frage?")
    assert.equal(own.resolved.question.edited, true)
    assert.match(own.resolved.question.suggested, /^Wie wirkt Rückentraining/)
  })

  it("builds a sensible sentence when parts are missing", () => {
    assert.equal(buildFragestellung({ P: "", I: "", C: "", O: "" }), "")
    assert.equal(buildFragestellung({ P: "Kinder mit Asthma", I: "Atemtraining", C: "", O: "Lebensqualität" }), "Wie wirkt Atemtraining bei Kindern mit Asthma auf Lebensqualität?")
    assert.equal(buildFragestellung({ P: "", I: "Yoga", C: "", O: "" }), "Wie wirkt Yoga bei … auf …?")
    assert.equal(buildFragestellung({ P: "Ältere Menschen", I: "Krafttraining", C: "keine Intervention", O: "Stürze, Gehgeschwindigkeit, Kraft" }), "Wie wirkt Krafttraining im Vergleich zu keiner Intervention bei älteren Menschen auf Stürze, Gehgeschwindigkeit und Kraft?")
  })

  it("inflects only the words it knows", () => {
    assert.equal(dativeify("Erwachsene mit Schmerzmittel"), "Erwachsenen mit Schmerzmitteln")
    assert.equal(dativeify("Patienten nach Operation"), "Patienten nach Operation")
    assert.equal(dativeify("Erwachsenenbildung"), "Erwachsenenbildung")
  })

  it("shortens labels", () => {
    assert.equal(shortLabel("Rückentraining / Rumpfstabilisation"), "Rückentraining")
    assert.equal(shortLabel("Dry Needling (Trockennadeln)"), "Dry Needling")
  })

  it("explains each letter with the student's own content and flags what is missing", () => {
    const out = step("pico").observe(ctx)
    assert.deepEqual(out.slice(0, 4).map((o) => o.label), ["P", "I", "C", "O"])
    assert.match(out[0].text, /45 Jahre/)
    assert.match(out[2].text, /Verschiedene Schmerzmittel brachten nur kurzfristige Linderung/)
    assert.match(out[3].text, /um seine Rückenschmerzen zu reduzieren/)

    const noComparison = ctxOf(mueller, { edits: { pico: { cells: { C: "" } }, criteria: {} } })
    const c = step("pico").observe(noComparison).find((o) => o.label === "C")!
    assert.equal(c.tone, "warn")
    const noI = ctxOf(mueller, { edits: { pico: { cells: { I: "" } }, criteria: {} } })
    assert.equal(step("pico").ready!(noI), false)
    assert.equal(step("pico").ready!(ctx), true)
  })
})

describe("Ein- und Ausschlusskriterien", () => {
  it("suggests rule-based criteria with a reason each", () => {
    const ids = ctx.criteria.map((c) => c.id)
    for (const id of ["age", "condition-low-back-pain", "x-specific-low-back-pain", "x-children", "x-retired", "intervention", "x-passive", "comparison", "outcome", "design", "language", "years", "humans"]) {
      assert.ok(ids.includes(id), `missing ${id}`)
    }
    for (const c of ctx.criteria) {
      assert.ok(c.text.trim().length > 3, c.id)
      assert.ok(c.reason.trim().length > 15, c.id)
    }
    const byId = Object.fromEntries(ctx.criteria.map((c) => [c.id, c]))
    assert.equal(byId.age.text, "Erwachsene im Erwerbsalter (18 bis 65 Jahre)")
    assert.match(byId.age.reason, /Deine Frage nennt 45 Jahre/)
    assert.match(byId.age.reason, /Bürokaufmann/)
    assert.equal(byId["condition-low-back-pain"].text, "Chronische unspezifische Rückenschmerzen im unteren Rücken (LWS)")
    assert.match(byId["condition-low-back-pain"].reason, /seit etwa einem Jahr/)
    assert.match(byId["condition-low-back-pain"].note ?? "", /strahlen/)
    assert.equal(byId.years.text, "Veröffentlicht ab 2016 (letzte 10 Jahre)")
    assert.equal(byId["x-retired"].kind, "exclude")
    assert.equal(byId.comparison.text, "Vergleichsgruppe: Schmerzmittel")
    assert.match(byId.comparison.reason, /Schmerzmitteln/)
  })

  it("says which criteria can become filters and which are applied when screening", () => {
    const byId = Object.fromEntries(ctx.criteria.map((c) => [c.id, c]))
    assert.equal(byId.design.filter, "studyTypes")
    assert.equal(byId.language.filter, "language")
    assert.equal(byId.years.where, "filter")
    assert.equal(byId.humans.filter, "humans")
    for (const id of ["condition-low-back-pain", "x-children", "x-retired", "intervention", "comparison", "outcome"]) assert.equal(byId[id].where, "screening", id)
    assert.match(byId.language.note ?? "", /nur eine Sprache/)
  })

  it("does not invent an age or a chronic course", async () => {
    const l = await load("Wie wirkt Krafttraining bei Menschen mit Kniearthrose auf die Schmerzen?")
    const c = ctxOf(l)
    assert.ok(!c.criteria.some((x) => x.id === "age"))
    assert.ok(!c.criteria.some((x) => /chronisch/i.test(x.text)))
    assert.ok(!c.criteria.some((x) => x.id === "x-children"))
  })

  it("adapts to an older person", async () => {
    const l = await load("Frau Keller, 72 Jahre, Rentnerin. Seit drei Monaten Schmerzen im rechten Knie bei Kniearthrose. Sie möchte wissen, ob Krafttraining ihre Schmerzen lindert.")
    const c = ctxOf(l)
    assert.equal(c.criteria.find((x) => x.id === "age")!.text, "Personen ab 65 Jahren")
    assert.ok(!c.criteria.some((x) => x.id === "x-retired"))
    assert.match(c.resolved.question.text, /bei älteren Menschen \(72 Jahre\) mit Kniearthrose/)
  })

  it("takes a study type from the question instead of the default", async () => {
    const fib = EXAMPLES.find((e) => e.id === "fibromyalgie")!
    const c = ctxOf(await load(fib.text))
    const design = c.criteria.find((x) => x.id === "design")!
    assert.match(design.text, /Randomisierte kontrollierte Studien/)
    assert.match(design.reason, /Fragestellung genannt/)
  })

  it("keeps, edits, removes and adds criteria", () => {
    const edits: WorksheetEdits = {
      pico: {},
      criteria: {
        removed: ["years"],
        text: { language: "Sprachen: nur Englisch" },
        reason: { language: "Ich lese nur Englisch sicher." },
        custom: [{ id: "custom-1", kind: "exclude", text: "Studien ohne Volltext", reason: "Nicht prüfbar.", where: "screening", custom: true }],
      },
    }
    const resolved = resolveCriteria(ctx.suggestedCriteria, edits.criteria)
    assert.equal(resolved.find((c) => c.id === "years")!.removed, true)
    assert.equal(resolved.find((c) => c.id === "language")!.text, "Sprachen: nur Englisch")
    assert.equal(resolved.find((c) => c.id === "language")!.edited, true)
    const active = activeCriteria(resolved)
    assert.ok(!active.some((c) => c.id === "years"))
    assert.ok(active.some((c) => c.id === "custom-1"))
    assert.equal(suggestCriteria({ reading: ctx.reading, pico: ctx.resolved, studyTypes: [], now: new Date("2030-01-01") }).find((c) => c.id === "years")!.text, "Veröffentlicht ab 2020 (letzte 10 Jahre)")
  })

  it("compares the kept criteria with the filters that are really set", () => {
    const before = texts(ctx, "criteria").join("\n")
    assert.match(before, /im Filter nicht gesetzt: .*Studientyp/)
    assert.match(before, /Alter \(«45 Jahre»\) und Geschlecht \(«Herr»\)/)
    const withFilters = ctxOf({ ...mueller, model: { ...mueller.model, filters: { ...mueller.model.filters, studyTypes: ["rct"], language: "english" } } })
    const after = texts(withFilters, "criteria").join("\n")
    assert.match(after, /Im Filter gesetzt: .*Studientyp.*Sprache/)
    assert.equal(step("criteria").ready!(ctx), true)
    const none = ctxOf(mueller, { edits: { pico: {}, criteria: { removed: ctx.suggestedCriteria.map((c) => c.id) } } })
    assert.equal(step("criteria").ready!(none), false)
  })
})

describe("Suchkomponenten festlegen", () => {
  it("maps PICO to the components of the tool and explains the switched-off comparison", () => {
    const out = step("components").observe(ctx)
    const mapping = out.filter((o) => o.label?.endsWith("→"))
    assert.deepEqual(mapping.map((o) => o.label), ["P →", "I →", "C →", "O →"])
    assert.match(mapping[0].text, /Büroangestellte, Unterer Rückenschmerz/)
    assert.match(mapping[2].text, /nicht im String/)
    const all = out.map((o) => o.text).join("\n")
    assert.match(all, /Vergleich, der Block ist aber ausgeschaltet/)
    assert.match(all, /Ohne Schlagwort \(nur Stichworte\): Büroangestellte/)
    assert.match(all, /4 Komponenten: ein vernünftiger Umfang/)
  })

  it("warns when the comparison is switched on and when there are too many components", () => {
    const on = ctxOf({ ...mueller, model: setBlockIncluded(mueller.model, "comparison", true) })
    const all = texts(on, "components").join("\n")
    assert.match(all, /steht im String\. Das schränkt die Treffer stark ein/)
    assert.match(all, /5 Komponenten sind mit AND verknüpft/)
    assert.equal(step("components").observe(on).find((o) => /5 Komponenten/.test(o.text))!.tone, "warn")
  })

  it("tells the pain outcome needs no component of its own", () => {
    const all = texts(ctx, "components").join("\n")
    assert.ok(!/Zu diesen PICO-Teilen gibt es keine Komponente/.test(all))
  })
})

describe("Stichworte und Schlagworte", () => {
  it("shows German idea to English term and flags a missing MeSH", () => {
    const out = step("terms").observe(ctx)
    const de = out.filter((o) => o.label === "Deutsch → Englisch").map((o) => o.text)
    assert.ok(de.some((t) => /«Rückentraining» wird zu Schlagwort «Exercise Therapy»/.test(t)))
    assert.ok(de.some((t) => /«Bürokaufmann» wird zu Stichwort «office worker\*»/.test(t)))
    const warn = out.find((o) => o.tone === "warn")!
    assert.match(warn.text, /Kein Schlagwort bei: Büroangestellte/)
    assert.match(warn.text, /MeSH-Wörterbuch/)
    assert.match(out[0].text, /6 Schlagworte und 30 Stichworte/)
    assert.match(out.map((o) => o.text).join("\n"), /«Arbeitsfähigkeit \/ Wiedereingliederung» hat 14 Begriffe/)
  })

  it("suggests truncation only where the word start is clear", () => {
    const hint = texts(ctx, "terms").find((t) => t.startsWith("Trunkierung prüfen"))
    assert.ok(hint)
    assert.match(hint!, /back train\*/)
  })
})

describe("Suchstring entwickeln", () => {
  it("explains the structure with the student's own terms", () => {
    const out = step("string").observe(ctx)
    const all = out.map((o) => o.text).join("\n")
    assert.match(all, /4 Klammern, eine pro Suchkomponente/)
    assert.match(all, /1\. Büroangestellte: 0 Schlagworte und 6 Stichworte, alle mit OR/)
    assert.match(all, /4\. Arbeitsfähigkeit \/ Wiedereingliederung: 4 Schlagworte und 10 Stichworte/)
    assert.match(all, /zwischen den Klammern steht AND/i)
    assert.match(all, /"office worker\*"\[tiab\]/)
    assert.match(all, /Keine Filter im String/)
    assert.match(all, /Der String ist für PubMed geschrieben/)
  })

  it("lists the filters that are in the string", () => {
    const withFilter = ctxOf({ ...mueller, model: { ...mueller.model, filters: { ...mueller.model.filters, studyTypes: ["rct"] } } })
    const out = step("string").observe(withFilter).find((o) => o.label === "Filter im String")!
    assert.match(out.text, /randomized controlled trial\[pt\]/)
  })

  it("reads the database from the model and never hard-codes PubMed", () => {
    const cochrane = DATABASES.find((d) => d.id === "cochrane")
    if (!cochrane?.available) return
    const l = { ...mueller, model: setDatabases(mueller.model, ["cochrane"]) }
    const c = ctxOf(l)
    assert.deepEqual(c.databases, ["cochrane"])
    const all = texts(c, "string").join("\n")
    assert.match(all, /Cochrane/)
    assert.ok(!/für PubMed geschrieben/.test(all))
    const check = texts(c, "check").join("\n")
    assert.match(check, /Cochrane/)
    assert.ok(!/PubMed zählen/.test(step("check").action as string) || typeof step("check").action === "function")
    assert.match(resolveAction(step("check"), c)!, /Cochrane/)
  })
})

describe("Prüfen und Treffer", () => {
  const rows = (c: SuchstringGuideCtx, counts: Record<string, number | null>, error: CountRow["error"] = null): CountRow[] =>
    Object.entries(counts).map(([id, count]) => ({ id: id === "total" ? "total" : c.pubmed!.components.find((x) => x.label.startsWith(id))!.conceptId, query: "", count, error }))

  it("invites the opt-in count when nothing was counted", () => {
    assert.match(texts(ctx, "check").join("\n"), /Noch keine Zahlen/)
    assert.match(resolveAction(step("check"), ctx)!, /Treffer in PubMed zählen/)
  })

  it("explains a total of zero with the narrowest component and what to loosen", () => {
    const c = ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 0, Unterer: 3200, Rückentraining: 5400, Arbeitsfähigkeit: 410, total: 0 }) })
    const all = texts(c, "check").join("\n")
    assert.match(all, /findet nichts/)
    assert.match(all, /«Büroangestellte» findet allein nichts/)
    assert.match(all, /Lockere zuerst bei «Büroangestellte»/)
    assert.match(all, /Population und Vergleich schränken am stärksten ein/)
    const r = readCounts(c.counts, c.pubmed)
    assert.equal(r.verdict, "zero")
    assert.equal(r.narrowest?.label, "Büroangestellte")
    assert.equal(r.widest?.label, "Rückentraining / Rumpfstabilisation")
  })

  it("names the narrowest component when the string is empty but each part finds something", () => {
    const c = ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 900, Unterer: 3200, Rückentraining: 5400, Arbeitsfähigkeit: 410, total: 0 }) })
    const all = texts(c, "check").join("\n")
    assert.match(all, /Die engste Komponente ist «Arbeitsfähigkeit \/ Wiedereingliederung» mit 410 Treffern/)
  })

  it("recognises few, fine and very many hits", () => {
    const few = texts(ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 900, Unterer: 3200, Rückentraining: 5400, Arbeitsfähigkeit: 410, total: 7 }) }), "check").join("\n")
    assert.match(few, /7 Treffer sind wenige/)
    const many = texts(ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 900, Unterer: 30000, Rückentraining: 54000, Arbeitsfähigkeit: 410, total: 25000 }) }), "check").join("\n")
    assert.match(many, /25.000 Treffer sind sehr viele|25’000 Treffer sind sehr viele|25\D000 Treffer sind sehr viele/)
    assert.match(many, /weiteste Komponente ist «Rückentraining/)
    const ok = texts(ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 900, Unterer: 3200, Rückentraining: 5400, Arbeitsfähigkeit: 410, total: 112 }) }), "check").join("\n")
    assert.match(ok, /112 Treffer sind ein Umfang/)
  })

  it("reports a stopped count honestly", () => {
    const c = ctxOf(mueller, { counts: rows(ctx, { Büroangestellte: 900 }).concat([{ id: "x", query: "", count: null, error: "rate" }]) })
    const out = step("check").observe(c)
    assert.ok(out.some((o) => o.tone === "warn" && /unterbrochen/.test(o.text)))
    assert.equal(readCounts(c.counts, c.pubmed).state, "partial")
  })
})

describe("Arbeitsblatt", () => {
  it("collects everything in one draft text", () => {
    const text = worksheetText(worksheetOf(ctx))
    assert.match(text, /^Arbeitsblatt Literaturrecherche \(Entwurf\)/)
    assert.match(text, /Datum: 2026-10-06/)
    assert.ok(text.includes(WORKSHEET_DRAFT_NOTE))
    assert.match(text, /keine Musterlösung und keine bewertete Abgabe/)
    assert.match(text, /Herr Müller, 45 Jahre/)
    assert.match(text, /P \(Population\): Büroangestellte \(45 Jahre\) mit chronischen Rückenschmerzen/)
    assert.match(text, /Fragestellung: Wie wirkt Rückentraining im Vergleich zu Schmerzmitteln/)
    assert.match(text, /Einschluss\n- Erwachsene im Erwerbsalter \(18 bis 65 Jahre\)\. Begründung: Deine Frage nennt 45 Jahre/)
    assert.match(text, /Ausschluss\n- Spezifische Ursachen/)
    assert.match(text, /Suchkomponente 3: Rückentraining \/ Rumpfstabilisation \(Intervention\)\n {2}Stichworte: back exercise\*/)
    assert.match(text, /Schlagwort\(e\) \(MeSH\): Work Capacity Evaluation, Return to Work, Sick Leave, Absenteeism/)
    assert.match(text, /Aufbau: Suchkomponente 1 \(… OR …\) AND Suchkomponente 2/)
    assert.ok(text.includes(ctx.built!.query))
    assert.ok(!/Trefferzahlen/.test(text))
  })

  it("writes Markdown tables and includes counts when the student counted", () => {
    const counts: CountRow[] = [
      { id: ctx.pubmed!.components[0].conceptId, query: "", count: 880, error: null },
      { id: "total", query: "", count: 42, error: null },
    ]
    const md = worksheetMarkdown(worksheetOf(ctxOf(mueller, { counts })))
    assert.match(md, /^# Arbeitsblatt Literaturrecherche \(Entwurf\)/)
    assert.match(md, /\| P \| Population \| Büroangestellte/)
    assert.match(md, /\| Art \| Kriterium \| Begründung \| Umsetzung \|/)
    assert.match(md, /\| Suchkomponente \| Stichworte \| Schlagwort\(e\) \(MeSH\) \|/)
    assert.match(md, /```text\n\("office worker\*"\[tiab\]/)
    assert.match(md, /\| Büroangestellte \| 880 \|/)
    assert.match(md, /\| Ganzer String \| 42 \|/)
  })

  it("reflects the student's edits and leaves out removed criteria", () => {
    const c = ctxOf(mueller, { edits: { pico: { cells: { C: "übliche Behandlung" } }, criteria: { removed: ["humans", "years"], text: { language: "Sprache: Deutsch" } } } })
    const text = worksheetText(worksheetOf(c))
    assert.match(text, /C \(Comparison \(Vergleich\)\): übliche Behandlung/)
    assert.match(text, /im Vergleich zu üblicher Behandlung/)
    assert.ok(!/Studien an Menschen/.test(text))
    assert.ok(!/Veröffentlicht ab/.test(text))
    assert.match(text, /- Sprache: Deutsch\. Begründung/)
  })

  it("lists what is still open and never claims to be a graded solution", () => {
    const c = ctxOf(mueller, { edits: { pico: { cells: { C: "" }, question: "" }, criteria: {} } })
    const out = step("worksheet").observe(c)
    const open = out.find((o) => /^Noch offen/.test(o.text))!
    assert.match(open.text, /Vergleich fehlt/)
    assert.match(open.text, /Fragestellung fehlt/)
    assert.ok(out.some((o) => /keine Musterlösung/.test(o.text)))
    const empty = worksheetOf(ctxOf({ ...mueller, model: { ...mueller.model, concepts: [] } }))
    assert.equal(empty.empty, true)
  })
})

describe("gating: demo versus full", () => {
  it("shows the subscription note in the demo only", () => {
    const demo = ctxOf(mueller, { mode: "demo" })
    assert.match(suchstringGuide.notice!(demo)!, /Mit dem Abo spielst du deine eigene Frage/)
    assert.equal(suchstringGuide.notice!(ctx), null)
    assert.match(lintGuide.notice!({ mode: "demo", text: "", findings: [], baseline: null })!, /Abo/)
    assert.equal(lintGuide.notice!({ mode: "full", text: "", findings: [], baseline: null }), null)
  })

  it("asks for an own question in the full version and points at the shipped one in the demo", () => {
    const demoAction = resolveAction(step("question"), ctxOf(question, { mode: "demo" }))!
    const fullAction = resolveAction(step("question"), qctx)!
    assert.match(demoAction, /Beispielfrage ist geladen/)
    assert.match(fullAction, /Schreib deine Frage bei «Fragestellung»/)
    assert.match(resolveAction(step("question"), ctx)!, /Fallbeschreibung/)
    const lint = lintGuide.steps[0]
    assert.match(resolveAction(lint, { mode: "demo", text: "", findings: [], baseline: null })!, /Beispielstring/)
    assert.match(resolveAction(lint, { mode: "full", text: "", findings: [], baseline: null })!, /Füge deinen Suchstring/)
  })
})

describe("every step", () => {
  it("has a title, an anchor, a body, and observations without holes", () => {
    for (const s of suchstringGuide.steps) {
      assert.ok(s.title && s.body.length > 0, s.id)
      for (const o of s.observe(ctx)) {
        assert.ok(o.text.trim().length > 0, `${s.id}: empty observation`)
        assert.ok(!/undefined|\[object|NaN|null/.test(`${o.label ?? ""} ${o.text}`), `${s.id}: ${o.text}`)
      }
    }
    assert.deepEqual(suchstringGuide.steps.map((s) => s.id), ["question", "pico", "criteria", "components", "terms", "string", "check", "worksheet"])
  })

  it("never throws without a case", () => {
    const empty = ctxOf(null)
    for (const s of suchstringGuide.steps) assert.ok(s.observe(empty).length >= 1, s.id)
  })

  it("restart resets the edits through the tool", () => {
    let reset = 0
    const c = ctxOf(mueller, { resetEdits: () => void reset++ })
    suchstringGuide.onRestart!(c)
    assert.equal(reset, 1)
  })
})

describe("guide for the own string (lint)", () => {
  const findings = lintQuery(STUDENT_SEARCH_STRING)
  const lctx = (over: Partial<LintGuideCtx> = {}): LintGuideCtx => ({ mode: "demo", text: STUDENT_SEARCH_STRING, findings, baseline: findings.length, ...over })
  const lstep = (id: string) => lintGuide.steps.find((s) => s.id === id)!

  it("walks errors first, then warnings, then hints", () => {
    const sorted = sortFindings(findings)
    const sev = sorted.map((f) => f.severity)
    assert.deepEqual(sev, [...sev].sort((a, b) => ({ error: 0, warning: 1, info: 2 })[a] - ({ error: 0, warning: 1, info: 2 })[b]))
    assert.equal(sorted[0].severity, "error")
  })

  it("explains every code the linter can produce in plain language", () => {
    const samples = [
      STUDENT_SEARCH_STRING,
      '"back pain AND (exercise[tiab]',
      '(a OR b)) AND "c"[tiab] OR',
      "exercis*[tiab] AND ca*[tiab] AND \"Low Back Pain*\"[Mesh]",
      'back pain and exercise[tiabx] ("")',
      "Low Back Pain[Mesh] AND AND OR x[tiab]",
      "() AND ])",
    ]
    const codes = new Set(samples.flatMap((s) => lintQuery(s).map((f) => f.code)))
    assert.ok(codes.size >= 12, `only ${[...codes].join(",")}`)
    for (const code of codes) {
      const e = explainFinding(code)
      assert.notEqual(e, guideCopy.lint.explainFallback, `no explanation for ${code}`)
      assert.ok(e.meaning.length > 20 && e.todo.length > 8, code)
    }
    assert.equal(explainFinding("does-not-exist"), guideCopy.lint.explainFallback)
  })

  it("summarises the student's findings and the progress after fixing", () => {
    const first = lstep("input").observe(lctx())
    assert.ok(first.some((o) => /Fehler/.test(o.text)))
    assert.ok(lstep("findings").observe(lctx()).some((o) => /Fehler zuerst/.test(o.text)))
    const fixedOne = lctx({ findings: findings.slice(1) })
    assert.match(lstep("recheck").observe(fixedOne)[0].text, new RegExp(`Von ursprünglich ${findings.length} Befunden sind noch ${findings.length - 1} offen`))
    const clean = lctx({ text: '("back pain"[tiab] OR "Back Pain"[Mesh]) AND (exercise*[tiab])', findings: [], baseline: findings.length })
    assert.match(lstep("recheck").observe(clean)[0].text, /keiner mehr offen/)
    assert.ok(lstep("recheck").observe(clean).some((o) => o.tone === "good" && /Keine Fehler mehr/.test(o.text)))
  })

  it("ends with a checklist that ticks what the tool can check", () => {
    const list = lintChecklist(findings)
    assert.equal(list.find((i) => i.id === "no-errors")!.ok, false)
    assert.equal(list.find((i) => i.id === "quotes")!.ok, false)
    assert.equal(list.find((i) => i.id === "tags")!.ok, false)
    assert.equal(list.find((i) => i.id === "parens")!.ok, false)
    const clean = lintChecklist([])
    assert.ok(clean.every((i) => i.ok))
    const out = lstep("checklist").observe(lctx({ findings: [], text: "x" }))
    assert.equal(out.filter((o) => o.tone === "good").length, clean.length)
    assert.equal(out.filter((o) => o.label === "prüfst du selbst").length, 3)
    assert.ok(lstep("checklist").observe(lctx()).some((o) => o.tone === "warn" && /Keine Fehler/.test(o.text)))
  })

  it("waits for an own string in the full version", () => {
    const none = lctx({ mode: "full", text: "", findings: [], baseline: null })
    assert.equal(lstep("input").ready!(none), false)
    assert.equal(lstep("input").observe(none)[0].text, guideCopy.lint.obs.empty)
    assert.equal(lstep("input").ready!(lctx()), true)
  })
})
