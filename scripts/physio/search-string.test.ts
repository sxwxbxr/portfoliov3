/**
 * Tests for the search-string engine.
 * Run: npx tsx --test scripts/physio/search-string.test.ts
 */
import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  EXAMPLES,
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
  it("is a sane, unreviewed table of 45 to 60 concepts", () => {
    assert.ok(TERMINOLOGY.version)
    assert.equal(TERMINOLOGY.reviewed, false)
    assert.ok(TERMINOLOGY.concepts.length >= 45 && TERMINOLOGY.concepts.length <= 60, `got ${TERMINOLOGY.concepts.length}`)
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

  it("ships 4 to 6 examples", () => {
    assert.ok(EXAMPLES.length >= 4 && EXAMPLES.length <= 6)
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
