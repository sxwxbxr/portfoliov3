/**
 * Tests for the search-string engine.
 * Run: npx tsx --test scripts/physio/search-string.test.ts
 */
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, it } from "node:test"
import {
  EXAMPLES,
  PubMedError,
  addMeshConcept,
  analyzeAsync,
  ageGroupFor,
  countRows,
  createPubMedCounter,
  defaultFreeText,
  extractDemographics,
  germanForms,
  moreSynonyms,
  pubmedSearchUrl,
  replaceMeshHeading,
  switchMeshAlternative,
  toggleAgeGroup,
  toggleTruncation,
  type AnalysisResult,
  type Terminology,
  STUDENT_SEARCH_STRING,
  TERMINOLOGY,
  addCustomConcept,
  addFreeText,
  analyze,
  applyEdits,
  autoFix,
  buildQuery,
  checkFreeText,
  createModel,
  exportJson,
  exportText,
  isStopword,
  lintQuery,
  moveConcept,
  normalizeText,
  phraseKey,
  removeConcept,
  setBlockIncluded,
  setFilters,
  setFreeTextRemoved,
  setMeshRemoved,
  toggleExplode,
  toggleStudyType,
  type LintFinding,
} from "../../lib/physio/search-string"
import { createMeshIndex, type MeshIndex } from "../../lib/physio/search-string/mesh-index"

const MUELLER = EXAMPLES.find((e) => e.id === "mueller")!

function balanced(s: string): boolean {
  let depth = 0
  let inQuote = false
  for (const ch of s) {
    if (ch === '"') inQuote = !inQuote
    if (inQuote) continue
    if (ch === "(") depth++
    if (ch === ")" && --depth < 0) return false
  }
  return depth === 0 && !inQuote
}

const codes = (findings: LintFinding[]) => findings.map((f) => f.code)

describe("normalisation", () => {
  it("maps umlaut spellings onto one key", () => {
    assert.equal(normalizeText("Rückenschmerzen"), "rueckenschmerzen")
    assert.equal(normalizeText("Rückenschmerzen"), normalizeText("Rueckenschmerzen"))
    assert.equal(phraseKey("Rückenschmerzen"), phraseKey("Rueckenschmerzen"))
  })

  it("handles hyphens, punctuation, case and whitespace", () => {
    assert.equal(normalizeText("  LWS-Bereich,  (Low-Back)  Pain. "), "lws bereich low back pain")
  })

  it("treats singular and plural alike", () => {
    assert.equal(phraseKey("Rückenschmerz"), phraseKey("Rückenschmerzen"))
    assert.equal(phraseKey("exercises"), phraseKey("exercise"))
    assert.equal(phraseKey("Knieprothesen"), phraseKey("Knieprothese"))
    assert.equal(phraseKey("randomized controlled trials"), phraseKey("randomized controlled trial"))
  })

  it("knows German and English stopwords, not terms", () => {
    assert.ok(isStopword("und"))
    assert.ok(isStopword("the"))
    assert.ok(isStopword("bei"))
    assert.ok(!isStopword("rueckenschmerz"))
  })
})

describe("terminology", () => {
  it("is a sane, unreviewed table of 45 to 120 concepts", () => {
    assert.ok(TERMINOLOGY.version)
    assert.equal(TERMINOLOGY.reviewed, false)
    assert.ok(TERMINOLOGY.concepts.length >= 45 && TERMINOLOGY.concepts.length <= 120, `got ${TERMINOLOGY.concepts.length}`)
  })

  it("has unique ids, valid references and no alias claimed by two concepts", () => {
    const ids = new Set<string>()
    const keys = new Map<string, string>()
    const categories = ["population", "intervention", "comparison", "outcome", "setting", "studytype"]
    for (const c of TERMINOLOGY.concepts) {
      assert.ok(!ids.has(c.id), `duplicate id ${c.id}`)
      ids.add(c.id)
      assert.ok(categories.includes(c.category), c.id)
      assert.ok(c.freeText.length > 0, `${c.id} has no free text`)
      for (const a of [c.label, ...c.aliasesDe, ...c.aliasesEn]) {
        const key = phraseKey(a)
        const owner = keys.get(key)
        assert.ok(!owner || owner === c.id, `alias "${a}" is in ${owner} and ${c.id}`)
        keys.set(key, c.id)
      }
    }
    for (const c of TERMINOLOGY.concepts) {
      if (c.broader) assert.ok(ids.has(c.broader), `${c.id}.broader`)
      for (const r of c.redundantIf ?? []) assert.ok(ids.has(r), `${c.id}.redundantIf ${r}`)
    }
  })

  it("only truncates safe stems", () => {
    for (const c of TERMINOLOGY.concepts) {
      for (const t of c.freeText) {
        assert.ok(!/[?]/.test(t), `${c.id}: "${t}" uses ?`)
        if (!t.includes("*")) continue
        const stem = t.slice(0, t.indexOf("*")).replace(/[^A-Za-z0-9]/g, "")
        assert.ok(stem.length >= 4, `${c.id}: "${t}" stem too short`)
      }
    }
  })

  it("covers the required topics", () => {
    const ids = new Set(TERMINOLOGY.concepts.map((c) => c.id))
    for (const id of [
      "low-back-pain", "back-pain", "neck-pain", "shoulder-pain", "knee-osteoarthritis", "hip-osteoarthritis", "acl-injury",
      "ankle-sprain", "stroke", "parkinson", "multiple-sclerosis", "copd", "chronic-pain", "fibromyalgia", "osteoporosis",
      "tendinopathy", "office-workers", "older-adults", "athletes", "children", "exercise-therapy", "back-exercise",
      "resistance-training", "aerobic-training", "manual-therapy", "mobilisation", "massage", "stretching", "tens",
      "dry-needling", "kinesio-taping", "pain-education", "cognitive-functional-therapy", "balance-training", "gait-training",
      "hydrotherapy", "ergonomics", "physiotherapy", "analgesics", "usual-care", "pain-intensity", "function-disability",
      "work-ability", "quality-of-life", "range-of-motion", "muscle-strength", "falls", "recurrence", "rct", "systematic-review",
      "meta-analysis",
    ]) {
      assert.ok(ids.has(id), `missing ${id}`)
    }
  })
})

describe("analysis", () => {
  it("never invents terms for unknown words", () => {
    const a = analyze({ text: "Zebrafisch Quantenschaum" })
    assert.equal(a.concepts.length, 0)
    assert.deepEqual(a.candidates.map((c) => c.text).sort(), ["quantenschaum", "zebrafisch"])
    assert.ok(a.notices.some((n) => n.code === "unmapped"))
    assert.ok(a.notices.some((n) => n.code === "no-concepts"))
  })

  it("finds the same concepts for umlaut and ue spellings", () => {
    const a = analyze({ text: "Training bei Rückenschmerzen" })
    const b = analyze({ text: "Training bei Rueckenschmerzen" })
    assert.deepEqual(a.concepts.map((c) => c.id), b.concepts.map((c) => c.id))
    assert.ok(a.concepts.some((c) => c.id === "back-pain"))
  })

  it("matches the longest n-gram first", () => {
    const a = analyze({ text: "chronic low back pain" })
    assert.deepEqual(a.concepts.map((c) => c.id), ["low-back-pain"])
  })

  it("drops the broader concept when the narrower one is present", () => {
    const a = analyze({ text: "Rückenschmerzen im LWS-Bereich" })
    assert.deepEqual(a.concepts.map((c) => c.id), ["low-back-pain"])
    assert.ok(a.notices.some((n) => n.code === "subsumed"))
  })

  it("only reads short acronyms in capitals", () => {
    assert.ok(analyze({ text: "Training bei MS" }).concepts.some((c) => c.id === "multiple-sclerosis"))
    assert.ok(!analyze({ text: "ms" }).concepts.some((c) => c.id === "multiple-sclerosis"))
  })

  it("assigns blocks from explicit PICO prefixes", () => {
    const a = analyze({ text: "P: Sportler nach Kreuzbandriss. I: Krafttraining. O: Muskelkraft und Rezidiv" })
    const block = (id: string) => a.concepts.find((c) => c.id === id)?.block
    assert.equal(block("athletes"), "population")
    assert.equal(block("acl-injury"), "population")
    assert.equal(block("resistance-training"), "intervention")
    assert.equal(block("muscle-strength"), "outcome")
    assert.equal(block("recurrence"), "outcome")
  })

  it("assigns blocks from inline markers (bei, versus, auf die)", () => {
    const a = analyze({ text: "Wirkung von Krafttraining bei Kniearthrose im Vergleich zu Placebo auf die Muskelkraft" })
    const block = (id: string) => a.concepts.find((c) => c.id === id)?.block
    assert.equal(block("resistance-training"), "intervention")
    assert.equal(block("knee-osteoarthritis"), "population")
    assert.equal(block("placebo"), "comparison")
    assert.equal(block("muscle-strength"), "outcome")
  })

  it("moves a second intervention after 'versus' into the comparison block", () => {
    const a = analyze({ text: "Manuelle Therapie versus Übungstherapie bei Nackenschmerzen" })
    assert.equal(a.concepts.find((c) => c.id === "manual-therapy")?.block, "intervention")
    assert.equal(a.concepts.find((c) => c.id === "exercise-therapy")?.block, "comparison")
  })

  it("lets explicit PICO fields override guessed blocks", () => {
    const a = analyze({ pico: { population: "Krafttraining" } })
    assert.equal(a.concepts[0].block, "population")
  })

  it("suggests study types as filters, not as concepts", () => {
    const a = analyze({ text: "Hydrotherapie bei Fibromyalgie, nur randomisierte kontrollierte Studien" })
    assert.deepEqual(a.studyTypes, ["rct"])
    assert.ok(!a.concepts.some((c) => c.id === "rct"))
  })

  it("warns about very general words", () => {
    const a = analyze({ text: "Training bei Rückenschmerzen" })
    assert.ok(a.notices.some((n) => n.code === "generic-input"))
  })

  it("reports concepts without a MeSH heading", () => {
    const a = analyze({ text: "Büroangestellte" })
    assert.ok(a.notices.some((n) => n.code === "no-mesh" && n.conceptId === "office-workers"))
  })

  it("splits unmapped candidates at commas", () => {
    const a = analyze({ text: "Zebrafisch, Quantenschaum" })
    assert.equal(a.candidates.length, 2)
  })
})

describe("Herr Müller case", () => {
  const analysis = analyze({ text: MUELLER.text, pico: MUELLER.pico })
  const model = createModel(analysis)
  const built = buildQuery(model)

  it("builds components for back pain, exercise therapy and work ability", () => {
    const ids = model.concepts.map((c) => c.id)
    assert.ok(ids.includes("low-back-pain"))
    assert.ok(ids.includes("back-exercise"))
    assert.ok(ids.includes("work-ability"))
    assert.ok(ids.includes("office-workers"))
    assert.ok(built.query.includes('"Low Back Pain"[Mesh]'))
    assert.ok(built.query.includes('"Exercise Therapy"[Mesh]'))
    assert.ok(built.query.includes('"Work Capacity Evaluation"[Mesh]'))
  })

  it("has balanced parentheses, [Mesh] and [tiab], and ANDs between four groups", () => {
    assert.ok(balanced(built.query))
    assert.ok(built.query.includes("[tiab]"))
    assert.equal(built.components.length, 4)
    assert.equal(built.query.split(" AND ").length, 4)
    for (const c of built.components) assert.ok(c.query.startsWith("(") && c.query.endsWith(")"))
  })

  it("leaves the comparison (painkillers) and the redundant pain outcome out", () => {
    assert.ok(!built.query.toLowerCase().includes("analges"))
    assert.ok(!built.query.includes("Pain Measurement"))
    assert.ok(model.concepts.some((c) => c.id === "analgesics" && c.block === "comparison"))
    assert.ok(analysis.notices.some((n) => n.code === "redundant"))
  })

  it("passes its own lint without errors or warnings", () => {
    const bad = lintQuery(built.query).filter((f) => f.severity !== "info")
    assert.deepEqual(bad, [])
  })

  it("lists unmapped words as candidates", () => {
    assert.ok(analysis.candidates.some((c) => c.text === "sitzen"))
  })
})

describe("every example", () => {
  for (const ex of EXAMPLES) {
    it(`${ex.id} builds a balanced, lint-clean PubMed string`, () => {
      const a = analyze({ text: ex.text, pico: ex.pico })
      assert.ok(a.concepts.length >= 2, "at least two concepts")
      const built = buildQuery(createModel(a))
      assert.ok(built.query.length > 0)
      assert.ok(balanced(built.query))
      assert.deepEqual(lintQuery(built.query).filter((f) => f.severity !== "info"), [])
    })
  }

  it("ships 4 to 8 examples, the whole Herr Müller case first", () => {
    assert.ok(EXAMPLES.length >= 4 && EXAMPLES.length <= 8)
    assert.equal(EXAMPLES[0].id, "mueller-fall")
  })
})

describe("user edits", () => {
  const base = () => createModel(analyze({ text: "Krafttraining bei Kniearthrose" }))

  it("removes a concept", () => {
    const m = removeConcept(base(), "resistance-training")
    assert.ok(!buildQuery(m).query.includes("Resistance Training"))
    assert.equal(buildQuery(m).components.length, 1)
  })

  it("moves a concept to another block and orders the string by block", () => {
    const m = moveConcept(base(), "knee-osteoarthritis", "outcome")
    assert.equal(m.concepts.find((c) => c.id === "knee-osteoarthritis")?.block, "outcome")
    const q = buildQuery(m).query
    assert.ok(q.indexOf("Resistance Training") < q.indexOf("Osteoarthritis, Knee"))
  })

  it("moving into the comparison block drops it from the string until the block is switched on", () => {
    let m = moveConcept(base(), "knee-osteoarthritis", "comparison")
    assert.ok(!buildQuery(m).query.includes("Osteoarthritis, Knee"))
    m = setBlockIncluded(m, "comparison", true)
    assert.ok(buildQuery(m).query.includes("Osteoarthritis, Knee"))
  })

  it("toggles MeSH explosion", () => {
    let m = toggleExplode(base(), "knee-osteoarthritis", "Osteoarthritis, Knee")
    assert.ok(buildQuery(m).query.includes('"Osteoarthritis, Knee"[Mesh:NoExp]'))
    m = toggleExplode(m, "knee-osteoarthritis", "Osteoarthritis, Knee")
    assert.ok(buildQuery(m).query.includes('"Osteoarthritis, Knee"[Mesh]'))
  })

  it("removes and restores a MeSH heading and a synonym", () => {
    let m = setMeshRemoved(base(), "knee-osteoarthritis", "Osteoarthritis, Knee", true)
    assert.ok(!buildQuery(m).query.includes("[Mesh]") || !buildQuery(m).query.includes('"Osteoarthritis, Knee"[Mesh]'))
    m = setMeshRemoved(m, "knee-osteoarthritis", "Osteoarthritis, Knee", false)
    assert.ok(buildQuery(m).query.includes('"Osteoarthritis, Knee"[Mesh]'))

    m = setFreeTextRemoved(m, "knee-osteoarthritis", "gonarthrosis", true)
    assert.ok(!buildQuery(m).query.includes("gonarthrosis"))
    m = setFreeTextRemoved(m, "knee-osteoarthritis", "gonarthrosis", false)
    assert.ok(buildQuery(m).query.includes("gonarthrosis[tiab]"))
  })

  it("adds a custom free-text term and refuses duplicates and operators", () => {
    const r = addFreeText(base(), "knee-osteoarthritis", "knee joint wear")
    assert.equal(r.error, undefined)
    assert.ok(buildQuery(r.model).query.includes('"knee joint wear"[tiab]'))
    assert.ok(addFreeText(r.model, "knee-osteoarthritis", "Knee Joint Wear").error)
    assert.ok(addFreeText(base(), "knee-osteoarthritis", "pain AND knee").error)
    assert.ok(addFreeText(base(), "knee-osteoarthritis", "   ").error)
  })

  it("deletes a custom term for good and strips quotes from typed terms", () => {
    let m = addFreeText(base(), "knee-osteoarthritis", '„gonarthritis"').model
    assert.ok(buildQuery(m).query.includes("gonarthritis[tiab]"))
    m = setFreeTextRemoved(m, "knee-osteoarthritis", "gonarthritis", true)
    assert.ok(!m.concepts.find((c) => c.id === "knee-osteoarthritis")!.freeText.some((f) => f.text === "gonarthritis"))
    assert.deepEqual(checkFreeText("“back  pain”"), { ok: true, text: "back pain" })
  })

  it("adds a custom concept from an unmapped candidate", () => {
    const { model } = addCustomConcept(base(), "Sitzen", "population")
    const built = buildQuery(model)
    assert.equal(built.components.length, 3)
    assert.ok(built.query.includes("(Sitzen[tiab])"))
    assert.ok(built.notices.some((n) => n.code === "no-active-mesh") === false, "custom concepts have no mesh by design")
  })

  it("drops a truncation whose stem is too short and says so", () => {
    const { model } = addCustomConcept(base(), "ab*", "population")
    const built = buildQuery(model)
    assert.ok(!built.query.includes("ab*"))
    assert.ok(built.notices.some((n) => n.code === "trunc-dropped"))
  })

  it("warns about generic single words and empty components", () => {
    let m = addFreeText(base(), "knee-osteoarthritis", "therapy").model
    assert.ok(buildQuery(m).notices.some((n) => n.code === "generic-term"))
    m = base()
    const c = m.concepts.find((x) => x.id === "knee-osteoarthritis")!
    for (const t of c.mesh) m = setMeshRemoved(m, c.id, t.heading, true)
    for (const t of c.freeText) m = setFreeTextRemoved(m, c.id, t.text, true)
    const built = buildQuery(m)
    assert.ok(built.notices.some((n) => n.code === "empty-component"))
    assert.equal(built.components.length, 1)
  })

  it("reports an empty model without throwing", () => {
    const built = buildQuery(createModel(analyze({ text: "" })))
    assert.equal(built.empty, true)
    assert.equal(built.query, "")
    assert.ok(built.notices.some((n) => n.code === "no-components"))
  })
})

describe("filters", () => {
  const m0 = createModel(analyze({ text: "Krafttraining bei Kniearthrose" }))

  it("renders language, date range, study types and humans", () => {
    let m = setFilters(m0, { language: "english", yearFrom: 2015, yearTo: null, humansOnly: true })
    m = toggleStudyType(toggleStudyType(m, "rct"), "systematic-review")
    const { query, filterClauses } = buildQuery(m)
    assert.ok(query.includes("(randomized controlled trial[pt] OR systematic review[pt])"))
    assert.ok(query.includes("english[la]"))
    assert.ok(query.includes('("2015/01/01"[dp] : "3000"[dp])'))
    assert.ok(query.endsWith("NOT (animals[mh] NOT humans[mh])"))
    assert.equal(filterClauses.length, 3)
    assert.ok(balanced(query))
  })

  it("renders a closed date range and an upper bound only", () => {
    assert.ok(buildQuery(setFilters(m0, { yearFrom: 2010, yearTo: 2020 })).query.includes('("2010/01/01"[dp] : "2020/12/31"[dp])'))
    assert.ok(buildQuery(setFilters(m0, { yearTo: 2020 })).query.includes('"2020/12/31"[dp]'))
  })

  it("warns when the start year is after the end year", () => {
    assert.ok(buildQuery(setFilters(m0, { yearFrom: 2022, yearTo: 2010 })).notices.some((n) => n.code === "date-order"))
  })

  it("keeps filters out of the query when none are set", () => {
    const q = buildQuery(m0).query
    assert.ok(!q.includes("[la]") && !q.includes("[dp]") && !q.includes("[pt]") && !q.includes("animals"))
  })

  it("takes the suggested study type from the question", () => {
    const m = createModel(analyze({ text: "Hydrotherapie bei Fibromyalgie, nur randomisierte kontrollierte Studien" }))
    assert.deepEqual(m.filters.studyTypes, ["rct"])
    assert.ok(buildQuery(m).query.includes("randomized controlled trial[pt]"))
  })
})

describe("exports", () => {
  const m = createModel(analyze({ text: MUELLER.text, pico: MUELLER.pico }))
  const built = buildQuery(m)
  const input = { question: MUELLER.text, built, model: m, date: "2026-10-06" }

  it("writes a text export with the query, the table and the draft note", () => {
    const txt = exportText(input)
    assert.ok(txt.includes(built.query))
    assert.ok(txt.includes("Stichworte:"))
    assert.ok(txt.includes("Schlagworte (MeSH):"))
    assert.ok(txt.includes("Entwurf"))
  })

  it("writes parseable JSON with the structure", () => {
    const json = JSON.parse(exportJson(input))
    assert.equal(json.query, built.query)
    assert.equal(json.database, "pubmed")
    assert.equal(json.components.length, built.components.length)
    assert.equal(json.terminology.reviewed, false)
  })
})

describe("lint: student string from the OST assignment", () => {
  const findings = lintQuery(STUDENT_SEARCH_STRING)
  const found = codes(findings)

  it("finds the typical mistakes", () => {
    for (const c of ["quotes-typographic", "stray-after-quote", "mixed-operators", "no-field-tag", "trunc-in-phrase", "generic-term"]) {
      assert.ok(found.includes(c), `missing ${c}, got ${found.join(", ")}`)
    }
    assert.ok(findings.length >= 6)
  })

  it("points the stray character at the 'e'", () => {
    const f = findings.find((x) => x.code === "stray-after-quote")!
    assert.equal(STUDENT_SEARCH_STRING.slice(f.start, f.end), "e")
  })

  it("flags therapy* as too general", () => {
    const f = findings.find((x) => x.code === "generic-term" && x.severity === "warning")!
    assert.equal(STUDENT_SEARCH_STRING.slice(f.start, f.end), "„therapy*“")
  })

  it("marks the AND operators as the switch points", () => {
    const f = findings.find((x) => x.code === "mixed-operators")!
    assert.equal(STUDENT_SEARCH_STRING.slice(f.start, f.end), "AND")
    assert.equal(f.more?.length, 2)
  })

  it("repairs typographic quotes and parentheses automatically", () => {
    const fixed = autoFix(STUDENT_SEARCH_STRING)
    assert.ok(fixed.applied.length >= 4)
    assert.ok(!/[„“”]/.test(fixed.text))
    assert.ok(balanced(fixed.text))
    assert.ok(fixed.text.includes('("office Worker*"[tiab] OR'))
    assert.deepEqual(codes(lintQuery(fixed.text)).sort(), ["generic-term", "generic-term"])
  })

  it("also handles straight closing quotes", () => {
    const f = lintQuery('„office worker*" OR „desk worker*"')
    assert.ok(codes(f).includes("quotes-typographic"))
  })
})

describe("lint: single rules", () => {
  const has = (src: string, code: string) => codes(lintQuery(src)).includes(code)

  it("accepts a clean string", () => {
    const clean = '("Low Back Pain"[Mesh] OR "low back pain"[tiab] OR lumbago[tiab]) AND ("Exercise Therapy"[Mesh] OR "back exercise*"[tiab])'
    assert.deepEqual(lintQuery(clean), [])
  })

  it("accepts the date, language and humans filters", () => {
    const q = '(a1b2c[tiab]) AND english[la] AND ("2015/01/01"[dp] : "3000"[dp]) AND (randomized controlled trial[pt]) NOT (animals[mh] NOT humans[mh])'
    assert.deepEqual(lintQuery(q).filter((f) => f.severity !== "info"), [])
  })

  it("detects unbalanced parentheses", () => {
    assert.ok(has('("a b"[tiab] OR "c d"[tiab]', "paren-unclosed"))
    assert.ok(has('"a b"[tiab] OR "c d"[tiab])', "paren-unmatched-close"))
  })

  it("detects an unclosed quote and offers to close it", () => {
    const f = lintQuery('("back pain[tiab])').find((x) => x.code === "quote-unclosed")
    assert.ok(f)
  })

  it("detects lowercase operators and fixes them", () => {
    const src = '"back pain"[tiab] and "neck pain"[tiab] or lumbago[tiab]'
    const f = lintQuery(src).find((x) => x.code === "operator-lowercase")!
    assert.ok(f.fix)
    assert.equal(applyEdits(src, f.fix.edits), '"back pain"[tiab] AND "neck pain"[tiab] OR lumbago[tiab]')
  })

  it("detects mixed AND/OR without parentheses and wraps the OR groups", () => {
    const src = '"a b"[tiab] OR "c d"[tiab] AND "e f"[tiab] OR "g h"[tiab]'
    const f = lintQuery(src).find((x) => x.code === "mixed-operators")!
    assert.equal(applyEdits(src, f.fix!.edits), '("a b"[tiab] OR "c d"[tiab]) AND ("e f"[tiab] OR "g h"[tiab])')
  })

  it("does not flag OR-only or AND-only chains", () => {
    assert.ok(!has('"a b"[tiab] OR "c d"[tiab] OR "e f"[tiab]', "mixed-operators"))
    assert.ok(!has('"a b"[tiab] AND "c d"[tiab] AND "e f"[tiab]', "mixed-operators"))
  })

  it("detects unknown field tags and suggests the close one", () => {
    const f = lintQuery('"back pain"[tiabs]').find((x) => x.code === "tag-unknown")!
    assert.ok(f.message.includes("[tiab]"))
    assert.equal(applyEdits('"back pain"[tiabs]', f.fix!.edits), '"back pain"[tiab]')
    assert.ok(!has('"back pain"[Mesh:NoExp]', "tag-unknown"))
    assert.ok(!has('"back pain"[MeSH Terms]', "tag-unknown"))
  })

  it("enforces four characters before the wildcard", () => {
    assert.ok(has("ab*[tiab]", "trunc-short"))
    assert.ok(has('"ex*"[tiab]', "trunc-short"))
    assert.ok(!has("colo*[tiab]", "trunc-short"))
    assert.ok(!has('"back exercise*"[tiab]', "trunc-short"))
  })

  it("flags truncation inside a phrase only when the field tag is missing", () => {
    assert.ok(has('"back exercise*"', "trunc-in-phrase"))
    assert.ok(!has('"back exercise*"[tiab]', "trunc-in-phrase"))
  })

  it("rejects truncation on MeSH headings", () => {
    assert.ok(has('"Back Pain*"[Mesh]', "trunc-mesh"))
  })

  it("detects dangling and doubled operators and empty groups", () => {
    assert.ok(has('AND "a b"[tiab]', "op-leading"))
    assert.ok(has('"a b"[tiab] AND', "op-trailing"))
    assert.ok(has('"a b"[tiab] AND OR "c d"[tiab]', "op-double"))
    assert.ok(has('"a b"[tiab] AND ()', "group-empty"))
  })

  it("warns about a missing operator and a missing field tag", () => {
    assert.ok(has('"a b"[tiab] "c d"[tiab]', "op-missing"))
    assert.ok(has('"a b" OR "c d"', "no-field-tag"))
    assert.ok(has("back pain OR neck pain", "no-field-tag"))
  })

  it("detects stray characters and commas", () => {
    assert.ok(has('"a b"x[tiab] OR "c d"[tiab]', "stray-after-quote"))
    assert.ok(has('"a b"[tiab] , "c d"[tiab]', "stray-char"))
    assert.ok(has("lumbago[tiab], backache[tiab]", "stray-char"))
  })

  it("returns nothing for empty input", () => {
    assert.deepEqual(lintQuery("   "), [])
  })

  it("autoFix terminates and never loops on odd input", () => {
    const r = autoFix('((( "a" OR ) AND ] [ ,,, "')
    assert.ok(typeof r.text === "string")
  })
})

/* ── MeSH layer: whole cases, German handling, ambiguity, PubMed counts ───────── */

const PUBLIC = join(process.cwd(), "public")

/** An index that reads the generated shards from disk and records every file name it is asked for. */
function diskIndex(log: string[] = []): MeshIndex {
  const fetchFromDisk = (async (input: RequestInfo | URL) => {
    const url = String(input)
    log.push(url)
    try {
      return new Response(await readFile(join(PUBLIC, url)), { status: 200 })
    } catch {
      return new Response("not found", { status: 404 })
    }
  }) as typeof fetch
  return createMeshIndex({ fetch: fetchFromDisk })
}

const FULL_CASE = EXAMPLES.find((e) => e.id === "mueller-fall")!.text
const EMPTY_TERMINOLOGY: Terminology = { version: "test", reviewed: false, concepts: [] }

async function run(text: string, log: string[] = []): Promise<AnalysisResult> {
  return analyzeAsync({ text }, { mesh: diskIndex(log) })
}

const idsOf = (a: AnalysisResult) => a.concepts.map((c) => c.id)
const blockOf = (a: AnalysisResult, id: string) => a.concepts.find((c) => c.id === id)?.block
const meshOf = (a: AnalysisResult) => a.concepts.flatMap((c) => c.mesh.map((m) => m.heading))

describe("whole case: Herr Müller (OST Übung 3)", () => {
  const log: string[] = []
  let analysis: AnalysisResult
  let model: ReturnType<typeof createModel>
  let built: ReturnType<typeof buildQuery>

  it("analyses the full paragraph text", async () => {
    analysis = await run(FULL_CASE, log)
    model = createModel(analysis)
    built = buildQuery(model)
    assert.ok(analysis.concepts.length >= 5)
  })

  it("finds low back pain, exercise therapy, work ability and office workers as population free text", () => {
    assert.equal(blockOf(analysis, "low-back-pain"), "population")
    assert.equal(blockOf(analysis, "back-exercise"), "intervention")
    assert.equal(blockOf(analysis, "work-ability"), "outcome")
    assert.equal(blockOf(analysis, "office-workers"), "population")
    const office = analysis.concepts.find((c) => c.id === "office-workers")!
    assert.equal(office.mesh.length, 0)
    assert.ok(office.freeText.some((f) => f.text === "office worker*"))
    assert.ok(built.query.includes('"Low Back Pain"[Mesh]'))
    assert.ok(built.query.includes('"Exercise Therapy"[Mesh]'))
    assert.ok(built.query.includes('"Sick Leave"[Mesh]'))
    assert.ok(built.query.includes('"office worker*"[tiab]'))
  })

  it("drops the pain outcome and the broader back pain, because the narrower concept covers them", () => {
    assert.ok(!idsOf(analysis).includes("back-pain"))
    assert.ok(!idsOf(analysis).includes("pain-intensity"))
    assert.ok(analysis.notices.some((n) => n.code === "subsumed"))
  })

  it("recognises painkillers as a comparison candidate that stays out of the string", () => {
    assert.equal(blockOf(analysis, "analgesics"), "comparison")
    assert.equal(model.includedBlocks.comparison, false)
    assert.ok(!built.query.toLowerCase().includes("analges"))
  })

  it("suggests the age group and sex as optional filters, switched off", () => {
    const age = analysis.filterSuggestions.find((f) => f.kind === "age")
    assert.equal(age?.value, "Middle Aged")
    assert.equal(age?.evidence, "45 Jahre")
    assert.equal(analysis.filterSuggestions.find((f) => f.kind === "sex")?.value, "Male")
    assert.deepEqual(model.filters.ageGroups, [])
    assert.equal(model.filters.sex, "")
    assert.ok(!built.query.includes("Middle Aged"))
    const on = buildQuery(toggleAgeGroup(model, "Middle Aged")).query
    assert.ok(on.endsWith('AND "Middle Aged"[Mesh]'))
  })

  it("builds a balanced string with four groups that passes its own lint", () => {
    assert.ok(balanced(built.query))
    assert.equal(built.components.length, 4)
    assert.deepEqual(lintQuery(built.query).filter((f) => f.severity !== "info"), [])
  })

  it("offers body parts as suggestions, not as components, and keeps noise out", () => {
    const back = analysis.candidates.find((c) => c.suggestion?.name === "Back")
    assert.ok(back, "Rückenbereich should come with the MeSH heading Back")
    assert.ok(!analysis.concepts.some((c) => c.descriptor?.name === "Back"))
    const words = analysis.candidates.map((c) => c.text)
    for (const noise of ["müller", "freund", "jahr", "anamnese", "linderung", "verschiedene", "herr"]) {
      assert.ok(!words.includes(noise), noise)
    }
  })

  it("fetches only static dictionary files, never the text, and not many of them", () => {
    assert.ok(log.length > 0 && log.length <= 20, `${log.length} files`)
    for (const url of log) {
      assert.match(url, /^\/physio\/mesh\/2026\/(terms|desc|tree)\/[a-z0-9_]+\.json$/)
    }
  })
})

describe("task sheets and explicit PICO lines", () => {
  it("ignores headings, numbering and 'Formulieren Sie ...' instructions", async () => {
    const sheet = [
      "Übung 3 Suchstrategie",
      "Arbeitsauftrag",
      "1. Formulieren Sie eine PICO-Frage und erstellen Sie einen Suchstring für PubMed.",
      "2. Fall: Frau Meier, 72 Jahre, stürzt häufig.",
      "Fragestellung: Reduziert Gleichgewichtstraining Stürze bei älteren Menschen?",
    ].join("\n")
    const a = await run(sheet)
    assert.deepEqual(idsOf(a).sort(), ["balance-training", "falls", "older-adults"])
    assert.ok(!a.candidates.some((c) => ["pico", "pubmed", "suchstring", "arbeitsauftrag"].includes(c.text)))
    assert.deepEqual(a.filterSuggestions.map((f) => f.value).sort(), ["Aged", "Female"])
  })

  it("gives explicit P/I/C/O and Population/Outcome lines priority over the sentence position", async () => {
    const a = await run(
      "Population: Frauen mit Osteoporose nach der Menopause\nIntervention: Krafttraining\nVergleich: keine Intervention\nOutcome: Knochendichte, Frakturrate",
    )
    assert.equal(blockOf(a, "osteoporosis"), "population")
    assert.equal(blockOf(a, "resistance-training"), "intervention")
    assert.equal(blockOf(a, "usual-care"), "comparison")
    const density = a.concepts.find((c) => c.descriptor?.name === "Bone Density")
    assert.equal(density?.block, "outcome")
    assert.ok(density!.mesh.some((m) => m.heading === "Bone Density"))
  })
})

describe("German handling", () => {
  it("tries plural and case endings and undoes a plural umlaut", () => {
    assert.ok(germanForms("beschwerden").includes("beschwerde"))
    assert.ok(germanForms("schmerzen").includes("schmerz"))
    assert.ok(germanForms("haende").includes("hand"))
    assert.equal(germanForms("schmerzen")[0], "schmerzen", "the typed form always comes first")
    assert.ok(!germanForms("stress").includes("stres"), "ss is not a plural")
  })

  it("matches umlaut and ue spellings and the plural of an indexed word", async () => {
    const a = await run("Depression bei Senioren")
    const b = await run("Depressionen bei Senioren")
    assert.ok(meshOf(a).includes("Depression"))
    assert.deepEqual(meshOf(a), meshOf(b))
  })

  it("splits a compound into two components: Schultertraining gives Shoulder and exercise therapy", async () => {
    const a = await run("Wirkung von Schultertraining bei Handgelenkschmerzen")
    assert.ok(meshOf(a).includes("Shoulder"))
    assert.ok(meshOf(a).includes("Wrist"))
    assert.ok(meshOf(a).includes("Pain"))
    assert.ok(idsOf(a).includes("exercise-therapy"))
    assert.equal(a.notices.filter((n) => n.code === "compound").length, 2)
    assert.equal(blockOf(a, "exercise-therapy"), "intervention")
  })

  it("leaves a generic head out: Rückenbereich is only a suggestion", async () => {
    const a = await run("Training im Rückenbereich")
    assert.ok(!meshOf(a).includes("Back"))
    assert.equal(a.candidates.find((c) => c.suggestion)?.suggestion?.name, "Back")
  })

  it("reports lowercase medical adjectives and drops German verbs and filler", async () => {
    const a = await run("Krafttraining bei patellofemoralem Schmerz. Er sucht Hilfe und hofft auf Besserung")
    const words = a.candidates.map((c) => c.text)
    assert.ok(words.includes("patellofemoralem"))
    assert.ok(!words.includes("sucht") && !words.includes("hofft") && !words.includes("besserung"))
  })
})

describe("ambiguity", () => {
  it("picks the best descriptor and exposes the alternatives with German label, name and scope note", async () => {
    const a = await run("Welche Rolle spielt Schlaf bei Depression im Alter?")
    const dep = a.concepts.find((c) => c.descriptor?.name === "Depression")!
    assert.ok(dep, "Depression")
    assert.ok(dep.alternatives && dep.alternatives.length > 0)
    const alt = dep.alternatives!.find((x) => x.name === "Major Depressive Disorder")!
    assert.ok(alt)
    assert.ok(alt.scopeNote.length > 20)
    assert.ok(a.notices.some((n) => n.code === "ambiguous" && n.conceptId === dep.id))
  })

  it("switches to an alternative and keeps the previous one as alternative", async () => {
    const a = await run("Depression")
    const m0 = createModel(a)
    const dep = m0.concepts[0]
    const target = dep.alternatives![0]
    const m1 = switchMeshAlternative(m0, dep.id, target.ui)
    const now = m1.concepts[0]
    assert.equal(now.descriptor?.ui, target.ui)
    assert.equal(now.mesh[0].heading, target.name)
    assert.ok(now.alternatives?.some((x) => x.ui === dep.descriptor!.ui))
    assert.ok(buildQuery(m1).query.includes(`"${target.name}"[Mesh]`))
  })

  it("uses the curated concept when an index hit points to the same descriptor", async () => {
    const a = await run("Studien zu Lumbalgie")
    assert.ok(idsOf(a).includes("low-back-pain"))
    assert.ok(!a.concepts.some((c) => c.origin === "mesh" && c.descriptor?.name === "Low Back Pain"))
  })
})

describe("acronyms", () => {
  it("reads COPD in capitals", async () => {
    const a = await run("Training bei COPD")
    assert.ok(idsOf(a).includes("copd"))
  })

  it("matches an uppercase acronym through the index and ignores the lowercase word", async () => {
    // Without the curated table only the index can answer.
    const upper = await analyzeAsync({ text: "Training bei MS und COPD" }, { mesh: diskIndex(), terminology: EMPTY_TERMINOLOGY })
    assert.ok(meshOf(upper).includes("Multiple Sclerosis"))
    assert.ok(!meshOf(upper).includes("Manuscript"))
    assert.ok(meshOf(upper).includes("Pulmonary Disease, Chronic Obstructive"))
    const lower = await analyzeAsync({ text: "training bei ms und copd" }, { mesh: diskIndex(), terminology: EMPTY_TERMINOLOGY })
    assert.ok(!meshOf(lower).includes("Multiple Sclerosis"))
    assert.ok(!meshOf(lower).includes("Manuscript"))
    assert.ok(!meshOf(lower).includes("Pulmonary Disease, Chronic Obstructive"))
  })

  it("keeps a lowercase 'ms' out of the curated layer too", async () => {
    assert.ok(!idsOf(await run("ms")).includes("multiple-sclerosis"))
  })
})

describe("English questions", () => {
  it("maps an English PICO question to blocks", async () => {
    const a = await run("In patients with chronic neck pain, is manual therapy more effective than exercise therapy for improving range of motion?")
    assert.equal(blockOf(a, "neck-pain"), "population")
    assert.equal(blockOf(a, "manual-therapy"), "intervention")
    assert.equal(blockOf(a, "exercise-therapy"), "comparison")
    assert.equal(blockOf(a, "range-of-motion"), "outcome")
  })

  it("handles a MeSH phrase that contains a curated word (myofascial pain syndrome)", async () => {
    const a = await run("Does dry needling reduce pain in patients with myofascial pain syndrome?")
    assert.ok(meshOf(a).includes("Myofascial Pain Syndromes"))
    assert.ok(idsOf(a).includes("dry-needling"))
    assert.ok(!a.candidates.some((c) => ["myofascial", "syndrome"].includes(c.text)))
  })
})

describe("physio questions produce MeSH-backed blocks", () => {
  const cases: Array<{ q: string; blocks: Record<string, string>; mesh: string[]; off?: string[] }> = [
    {
      q: "Wirkung von Gangtraining bei Schlaganfall auf die Gehgeschwindigkeit",
      blocks: { stroke: "population", "gait-training": "intervention", "gait-speed": "outcome" },
      mesh: ["Stroke", "Walking Speed"],
    },
    {
      q: "Ist Bewegungstherapie bei Kniearthrose besser als eine Operation?",
      blocks: { "knee-osteoarthritis": "population", "exercise-therapy": "intervention", surgery: "comparison" },
      mesh: ["Osteoarthritis, Knee", "Exercise Therapy"],
      off: ["Surgical Procedures, Operative"],
    },
    {
      q: "Return to sport nach vorderer Kreuzbandruptur: welche Reha ist wirksam?",
      blocks: { "acl-injury": "population", "return-to-sport": "outcome" },
      mesh: ["Anterior Cruciate Ligament Injuries", "Return to Sport", "Rehabilitation"],
    },
    {
      q: "In patients with COPD, does pulmonary rehabilitation improve quality of life?",
      blocks: { copd: "population", "pulmonary-rehabilitation": "intervention", "quality-of-life": "outcome" },
      mesh: ["Pulmonary Disease, Chronic Obstructive", "Quality of Life"],
    },
    {
      q: "Welchen Effekt hat Aquatherapie bei Fibromyalgie?",
      blocks: { fibromyalgia: "population", hydrotherapy: "intervention" },
      mesh: ["Fibromyalgia", "Hydrotherapy"],
    },
  ]
  for (const c of cases) {
    it(c.q, async () => {
      const a = await run(c.q)
      for (const [id, block] of Object.entries(c.blocks)) assert.equal(blockOf(a, id), block, id)
      const built = buildQuery(createModel(a))
      for (const m of c.mesh) assert.ok(built.query.includes(`"${m}"[Mesh]`), m)
      for (const m of c.off ?? []) assert.ok(!built.query.includes(`"${m}"[Mesh]`), `${m} is a comparison and stays out`)
      assert.ok(balanced(built.query))
      assert.deepEqual(lintQuery(built.query).filter((f) => f.severity === "error"), [])
    })
  }
})

describe("never invents", () => {
  it("leaves unknown words unmapped even with the index", async () => {
    const a = await run("Zebrafisch Quantenschaum")
    assert.equal(a.concepts.length, 0)
    assert.deepEqual(a.candidates.map((c) => c.text).sort(), ["quantenschaum", "zebrafisch"])
  })

  it("does not turn generic words into concepts", async () => {
    const a = await run("Patient Studie Therapie Jahr Woche Mensch")
    assert.equal(a.concepts.length, 0)
    assert.equal(a.candidates.length, 0)
  })

  it("falls back to the curated table and warns when the index is unreachable", async () => {
    const broken = createMeshIndex({ fetch: (async () => new Response("boom", { status: 500 })) as typeof fetch })
    const a = await analyzeAsync({ text: "Training bei Rückenschmerzen und Depression" }, { mesh: broken })
    assert.ok(a.notices.some((n) => n.code === "mesh-unavailable"))
    assert.ok(idsOf(a).includes("back-pain"))
  })

  it("works without any index", async () => {
    const a = await analyzeAsync({ text: "Krafttraining bei Kniearthrose" }, { mesh: null })
    assert.deepEqual(idsOf(a).sort(), ["knee-osteoarthritis", "resistance-training"])
  })
})

describe("every example, with the index", () => {
  for (const ex of EXAMPLES) {
    it(`${ex.id} builds a balanced, lint-clean string`, async () => {
      const a = await analyzeAsync({ text: ex.text, pico: ex.pico }, { mesh: diskIndex() })
      assert.ok(a.concepts.length >= 2)
      const built = buildQuery(createModel(a))
      assert.ok(balanced(built.query))
      assert.deepEqual(lintQuery(built.query).filter((f) => f.severity !== "info"), [])
    })
  }
})

describe("demographics", () => {
  const find = (text: string) => extractDemographics(text).map((f) => f.value).sort()

  it("maps ages to MeSH age groups", () => {
    assert.equal(ageGroupFor(45), "Middle Aged")
    assert.equal(ageGroupFor(8), "Child")
    assert.equal(ageGroupFor(15), "Adolescent")
    assert.equal(ageGroupFor(30), "Adult")
    assert.equal(ageGroupFor(70), "Aged")
    assert.equal(ageGroupFor(85), "Aged, 80 and over")
  })

  it("reads ages and sex from a case", () => {
    assert.deepEqual(find("Herr Müller, 45 Jahre, Bürokaufmann"), ["Male", "Middle Aged"])
    assert.deepEqual(find("Eine 72-jährige Patientin"), ["Aged", "Female"])
    assert.deepEqual(find("Der Junge, 8 Jahre alt"), ["Child", "Male"])
    assert.deepEqual(find("A 34 year old woman"), ["Adult", "Female"])
  })

  it("does not read durations as ages and stays silent on mixed groups", () => {
    assert.deepEqual(find("Seit 3 Jahren Schmerzen, vor 2 Jahren operiert"), [])
    assert.deepEqual(find("Männer und Frauen mit Arthrose"), [])
    assert.deepEqual(find("older adults with osteoarthritis"), [])
  })
})

describe("MeSH-derived concepts and edits", () => {
  it("selects a handful of natural-order synonyms and skips subtypes, acronyms and inversions", async () => {
    const index = diskIndex()
    const d = (await index.getDescriptors(["D017116"])).get("D017116")!
    const words = defaultFreeText(d)
    assert.equal(words[0], "Low Back Pain")
    assert.ok(words.includes("Lumbago"))
    assert.ok(!words.includes("Mechanical Low Back Pain"))
    assert.ok(words.length <= 6)
    const pain = (await index.getDescriptors(["D010146"])).get("D010146")!
    assert.ok(defaultFreeText(pain).every((w) => !w.includes(",")))
  })

  it("offers the remaining entry terms and adds one as a keyword", async () => {
    const a = await run("Wirkung von Krafttraining bei Menopause")
    const m = createModel(a)
    const c = m.concepts.find((x) => x.descriptor?.name === "Menopause")!
    assert.ok(c)
    const more = moreSynonyms(c.descriptor!, c.freeText.map((f) => f.text))
    assert.ok(Array.isArray(more))
    if (more.length) {
      const m2 = addFreeText(m, c.id, more[0]).model
      assert.ok(buildQuery(m2).query.toLowerCase().includes(more[0].toLowerCase()))
    }
  })

  it("renders truncation per term only when switched on", async () => {
    const m = createModel(await run("Lumbalgie"))
    assert.ok(!buildQuery(m).query.includes("lumbago*"))
    const m2 = toggleTruncation(m, "low-back-pain", "lumbago")
    assert.ok(buildQuery(m2).query.includes("lumbago*[tiab]"))
    assert.ok(!buildQuery(toggleTruncation(m2, "low-back-pain", "lumbago")).query.includes("lumbago*"))
  })

  it("adds a descriptor from the dictionary as a component, once", async () => {
    const index = diskIndex()
    const d = (await index.getDescriptors(["D017116"])).get("D017116")!
    const r1 = addMeshConcept(createModel(await run("")), d, "population")
    assert.equal(r1.added, true)
    assert.equal(r1.model.concepts[0].block, "population")
    assert.ok(buildQuery(r1.model).query.includes('"Low Back Pain"[Mesh]'))
    assert.equal(addMeshConcept(r1.model, d, "outcome").added, false)
  })

  it("walks the tree: parent and children of a heading, and swaps the heading", async () => {
    const index = diskIndex()
    const lbp = (await index.getDescriptors(["D017116"])).get("D017116")!
    const parent = await index.getTreeParent(lbp.treeNumbers[0])
    assert.ok(parent)
    const up = (await index.getDescriptors([parent!.ui])).get(parent!.ui)!
    assert.equal(up.name, "Back Pain")
    const kids = await index.getTreeChildren(up.treeNumbers[0])
    assert.ok(kids.some((k) => k.ui === lbp.ui))

    const m = createModel(await run("Lumbalgie"))
    const broader = replaceMeshHeading(m, "low-back-pain", "Low Back Pain", up)
    const q = buildQuery(broader).query
    assert.ok(q.includes('"Back Pain"[Mesh]') && !q.includes('"Low Back Pain"[Mesh]'))
    assert.ok(q.includes('"Back Pain"[tiab]'))
  })

  it("suggests index terms for a typed prefix, German and English, from one shard each", async () => {
    const log: string[] = []
    const index = diskIndex(log)
    const de = await index.suggestTerms("rueckensch")
    assert.ok(de.some((r) => r.term.startsWith("rueckenschmerz")))
    const en = await index.suggestTerms("low back")
    assert.ok(en.some((r) => r.term === "low back pain"))
    assert.deepEqual(await index.suggestTerms("r"), [])
    assert.equal(log.length, 2)
  })
})

describe("PubMed counts", () => {
  const ok = (count: string) => new Response(JSON.stringify({ esearchresult: { count } }), { status: 200 })

  function counterWith(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
    const calls: Array<{ url: string; at: number }> = []
    let t = 1000
    const counter = createPubMedCounter({
      fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(input), at: t })
        return handler(String(input), init)
      }) as typeof fetch,
      now: () => t,
      sleep: async (ms) => {
        t += ms
      },
    })
    return { counter, calls }
  }

  it("asks esearch for the count only, with the tool name and no e-mail", async () => {
    const { counter, calls } = counterWith(() => ok("1234"))
    assert.equal(await counter.count('"Low Back Pain"[Mesh] AND exercise[tiab]'), 1234)
    const url = new URL(calls[0].url)
    assert.equal(url.origin + url.pathname, "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi")
    assert.equal(url.searchParams.get("db"), "pubmed")
    assert.equal(url.searchParams.get("rettype"), "count")
    assert.equal(url.searchParams.get("retmode"), "json")
    assert.equal(url.searchParams.get("tool"), "physio-sweber-dev")
    assert.equal(url.searchParams.get("term"), '"Low Back Pain"[Mesh] AND exercise[tiab]')
    assert.ok(!url.searchParams.has("email"))
  })

  it("keeps 350 ms between requests, one at a time, and caches per string", async () => {
    const { counter, calls } = counterWith(() => ok("5"))
    const rows = [
      { id: "a", query: "a[tiab]" },
      { id: "b", query: "b[tiab]" },
      { id: "total", query: "a[tiab] AND b[tiab]" },
      { id: "again", query: "a[tiab]" },
    ]
    const seen: Array<number | null> = []
    const r = await countRows(counter, rows, (row) => seen.push(row.count))
    assert.equal(r.stopped, null)
    assert.deepEqual(seen, [5, 5, 5, 5])
    assert.equal(calls.length, 3, "the repeated string comes from the cache")
    for (let i = 1; i < calls.length; i++) assert.ok(calls[i].at - calls[i - 1].at >= 350)
    assert.equal(counter.cached("a[tiab]"), 5)
  })

  it("stops at a rate limit and reports the error", async () => {
    const { counter } = counterWith(() => new Response("slow down", { status: 429 }))
    const rows: Array<{ count: number | null; error: string | null }> = []
    const r = await countRows(counter, [{ id: "a", query: "a" }, { id: "b", query: "b" }], (row) => rows.push(row))
    assert.equal(r.stopped, "rate")
    assert.equal(rows.length, 1)
    assert.equal(rows[0].error, "rate")
  })

  it("maps network failures and NCBI error answers", async () => {
    const net = counterWith(() => {
      throw new TypeError("failed to fetch")
    })
    await assert.rejects(net.counter.count("x"), (e: unknown) => e instanceof PubMedError && e.code === "network")
    const bad = counterWith(() => new Response(JSON.stringify({ esearchresult: { ERROR: "Invalid query" } }), { status: 200 }))
    await assert.rejects(bad.counter.count("x"), (e: unknown) => e instanceof PubMedError && e.code === "query")
  })

  it("can be aborted", async () => {
    const { counter } = counterWith(() => ok("1"))
    const ctrl = new AbortController()
    ctrl.abort()
    await assert.rejects(countRows(counter, [{ id: "a", query: "a" }], () => undefined, ctrl.signal), /Abort/)
  })

  it("builds the link that opens the string in PubMed", () => {
    assert.equal(pubmedSearchUrl('"a b"[tiab]'), "https://pubmed.ncbi.nlm.nih.gov/?term=%22a%20b%22%5Btiab%5D")
  })
})
