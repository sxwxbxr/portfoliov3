/**
 * Tests for the MeSH index normaliser, shard addressing and browser loader.
 * The loader tests read the generated files in public/physio/mesh/2026/ (run
 * `npm run physio:mesh` first) through an injected fetch.
 * Run: npx tsx --test scripts/physio/mesh-index.test.ts
 */
import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { describe, it } from "node:test"
import { createMeshIndex, getMeshIndex, DEFAULT_MESH_BASE_URL } from "../../lib/physio/search-string/mesh-index"
import {
  NORMALISATION_VERSION,
  fnv1a32,
  isMeshAcronym,
  isStopTerm,
  meshDescriptorBucket,
  meshDescriptorBucketKey,
  meshTermShardKey,
  meshTreeShardKey,
  normalizeMeshTerm as norm,
  uninvertMeshTerm,
} from "../../lib/physio/search-string/mesh-normalize"

const PUBLIC = join(process.cwd(), "public")

function diskFetch(log: string[] = []): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input)
    log.push(url)
    try {
      return new Response(await readFile(join(PUBLIC, url)), { status: 200 })
    } catch {
      return new Response("not found", { status: 404 })
    }
  }) as typeof fetch
}

describe("normalizeMeshTerm", () => {
  it("lowercases and folds German umlauts before stripping diacritics", () => {
    assert.equal(norm("Rückenschmerzen"), "rueckenschmerzen")
    assert.equal(norm("Übungstherapie"), "uebungstherapie")
    assert.equal(norm("Hüftprothese"), "hueftprothese")
    assert.equal(norm("Stoßwellentherapie"), "stosswellentherapie")
    assert.equal(norm("Ärztin"), "aerztin")
  })

  it("strips other diacritics", () => {
    assert.equal(norm("Café Crème"), "cafe creme")
    assert.equal(norm("Méniscus"), "meniscus")
  })

  it("turns hyphens and punctuation into single spaces", () => {
    assert.equal(norm("Meta-Analysis"), "meta analysis")
    assert.equal(norm("  Pain,   Low Back. "), "pain low back")
    assert.equal(norm("Fatty Acids, Omega-3"), "fatty acids omega 3")
    assert.equal(norm("ME/CFS"), "me cfs")
  })

  it("removes apostrophes instead of splitting", () => {
    assert.equal(norm("Crohn's Disease"), "crohns disease")
    assert.equal(norm("Crohn’s Disease"), "crohns disease")
  })

  it("is idempotent", () => {
    for (const s of ["Kreuzschmerzen", "Osteoarthritis, Knee", "Hüft-TEP", "ß-Blocker"]) {
      assert.equal(norm(norm(s)), norm(s))
    }
  })

  it("matches typed spellings of the same word", () => {
    assert.equal(norm("Rückenschmerz"), norm("Rueckenschmerz"))
    assert.equal(norm("Rückenschmerz"), norm("RÜCKENSCHMERZ"))
  })
})

describe("shard addressing", () => {
  it("uses the first two characters, outside [a-z0-9] mapped to _", () => {
    assert.equal(meshTermShardKey("low back pain"), "lo")
    assert.equal(meshTermShardKey("x ray"), "x_")
    assert.equal(meshTermShardKey("5 fu"), "5_")
    assert.equal(meshTermShardKey("αβγ"), "__")
  })

  it("hashes with FNV-1a 32 (published test vectors)", () => {
    assert.equal(fnv1a32(""), 0x811c9dc5)
    assert.equal(fnv1a32("a"), 0xe40c292c)
    assert.equal(fnv1a32("foobar"), 0xbf9cf968)
  })

  it("derives descriptor buckets from the hash", () => {
    const b = meshDescriptorBucket("D017116")
    assert.equal(b, fnv1a32("D017116") % 256)
    assert.match(meshDescriptorBucketKey("D017116"), /^[0-9a-f]{2}$/)
    assert.equal(parseInt(meshDescriptorBucketKey("D017116"), 16), b)
  })

  it("uses three characters for tree shards", () => {
    assert.equal(meshTreeShardKey("C23.888.592.612.107"), "C23")
    assert.equal(meshTreeShardKey("V02"), "V02")
  })
})

describe("term helpers", () => {
  it("recognises acronyms", () => {
    for (const a of ["LBP", "COPD", "MRI", "TENS", "LWS", "HIV-1", "OA"]) assert.ok(isMeshAcronym(a), a)
    for (const a of ["Back", "Low Back Pain", "A", "pH", "Vitamin D", "Rheuma", "ABCDEFGHI"]) assert.ok(!isMeshAcronym(a), a)
  })

  it("derives natural word order from inverted headings", () => {
    assert.equal(uninvertMeshTerm("Pain, Low Back"), "Low Back Pain")
    assert.equal(uninvertMeshTerm("Osteoarthritis, Knee"), "Knee Osteoarthritis")
    assert.equal(uninvertMeshTerm("Anemia, Hemolytic, Autoimmune"), "Autoimmune Hemolytic Anemia")
    assert.equal(uninvertMeshTerm("Exercise Therapy"), null)
    assert.equal(uninvertMeshTerm("1,2-Dimethylhydrazine"), null)
  })

  it("flags pure stopword terms", () => {
    assert.ok(isStopTerm("of the"))
    assert.ok(isStopTerm("und"))
    assert.ok(!isStopTerm("back pain"))
    assert.ok(!isStopTerm("pain of"))
  })
})

describe("generated index", () => {
  const index = () => createMeshIndex({ fetch: diskFetch() })

  it("has meta.json that agrees with the normaliser", async () => {
    const meta = await index().getMeta()
    assert.equal(meta.version, "2026")
    assert.equal(meta.normalisation.version, NORMALISATION_VERSION)
    assert.ok(meta.attribution.some((a) => a.includes("National Library of Medicine")))
    assert.ok(meta.attribution.some((a) => a.includes("CC0")))
    assert.ok(meta.counts.descriptors > 10_000)
  })

  it("stays inside the size budget", async () => {
    let total = 0
    let largest = 0
    for (const dir of ["terms", "desc", "tree"]) {
      for (const f of await readdir(join(PUBLIC, "physio/mesh/2026", dir))) {
        const n = (await readFile(join(PUBLIC, "physio/mesh/2026", dir, f))).length
        total += n
        largest = Math.max(largest, n)
      }
    }
    assert.ok(total < 25 * 1024 * 1024, `total ${total}`)
    assert.ok(largest < 300 * 1024, `largest ${largest}`)
  })

  it("keeps every term in the shard its key says and every descriptor in its bucket", async () => {
    const root = join(PUBLIC, "physio/mesh/2026")
    for (const f of await readdir(join(root, "terms"))) {
      const shard = JSON.parse(await readFile(join(root, "terms", f), "utf8")) as Record<string, unknown[]>
      for (const term of Object.keys(shard)) {
        assert.equal(meshTermShardKey(term) + ".json", f, term)
        assert.equal(norm(term), term, `not normalised: ${term}`)
      }
    }
    for (const f of await readdir(join(root, "desc"))) {
      const shard = JSON.parse(await readFile(join(root, "desc", f), "utf8")) as Record<string, unknown>
      for (const ui of Object.keys(shard)) assert.equal(meshDescriptorBucketKey(ui) + ".json", f, ui)
    }
  })

  const cases: Array<[string, string[], string]> = [
    ["Low Back Pain", ["low back pain", "lumbago", "Kreuzschmerzen", "Kreuzschmerz", "LWS Schmerzen"], "D017116"],
    ["Back Pain", ["Rückenschmerzen", "Rückenschmerz", "back pain", "backache"], "D001416"],
    ["Exercise Therapy", ["Bewegungstherapie", "Trainingstherapie", "exercise therapy"], "D005081"],
    ["Physical Therapy Modalities", ["Physiotherapie", "Physikalische Therapie", "physical therapy"], "D026741"],
    ["Stroke", ["Schlaganfall", "Apoplex", "stroke"], "D020521"],
    ["Osteoarthritis, Knee", ["Gonarthrose", "Kniearthrose", "knee osteoarthritis", "osteoarthritis knee"], "D020370"],
    ["Sick Leave", ["Krankschreibung", "Krankenstand", "sick leave"], "D018582"],
    ["Middle Aged", ["middle aged", "mittleres Alter", "mittleren Alters"], "D008875"],
    ["Analgesics", ["Schmerzmittel", "Analgetika", "analgesics"], "D000700"],
    ["Humans", ["Humans", "Mensch"], "D006801"],
    ["Female", ["Female", "Frauen"], "D005260"],
  ]
  for (const [name, phrases, ui] of cases) {
    it(`resolves ${name} from its English and German phrases`, async () => {
      const idx = index()
      const terms = phrases.map(norm)
      const hits = await idx.lookupTerms(terms)
      for (const [i, p] of phrases.entries()) {
        const refs = hits.get(terms[i])
        assert.ok(refs?.some((r) => r.ui === ui), `${p} should resolve to ${ui}, got ${JSON.stringify(refs)}`)
      }
      const d = (await idx.getDescriptors([ui])).get(ui)
      assert.equal(d?.name, name)
    })
  }

  it("flags acronyms and keeps the source name", async () => {
    const idx = index()
    const hits = await idx.lookupTerms(["lbp", "copd", "low back pain"])
    const lbp = hits.get("lbp")?.find((r) => r.ui === "D017116")
    assert.equal(lbp?.acronym, true)
    const name = hits.get("low back pain")?.find((r) => r.ui === "D017116")
    assert.equal(name?.source, "en-name")
    assert.equal(name?.acronym, false)
    assert.ok(hits.get("copd")?.some((r) => r.acronym))
  })

  it("marks curated German aliases as de-curated and Wikidata ones as de-wd", async () => {
    const hits = await index().lookupTerms(["kreuzschmerzen", "gonarthrose"])
    assert.ok(hits.get("kreuzschmerzen")?.some((r) => r.ui === "D017116" && r.source === "de-curated"))
    // Wikidata-only German terms exist as well: take one from a raw shard.
    const raw = JSON.parse(await readFile(join(PUBLIC, "physio/mesh/2026/terms/sc.json"), "utf8")) as Record<string, number[][]>
    const term = Object.keys(raw).find((t) => raw[t].every((r) => r[1] === 2))
    assert.ok(term, "sc shard should hold a de-wd only term")
    const wd = await index().lookupTerms([term])
    assert.ok(wd.get(term)?.every((r) => r.source === "de-wd"))
  })

  it("returns descriptor details", async () => {
    const d = (await index().getDescriptors(["D017116", "D000000"]))
    assert.equal(d.has("D000000"), false)
    const lbp = d.get("D017116")
    assert.ok(lbp)
    assert.ok(lbp.treeNumbers.includes("C23.888.592.612.107.400"))
    assert.ok(lbp.german.includes("Kreuzschmerzen"))
    assert.ok(lbp.scopeNote.length > 0 && lbp.scopeNote.length <= 301)
    assert.ok(lbp.entryTerms.length <= 25)
    assert.ok(lbp.entryTerms.includes("Lumbago"))
  })

  it("walks the tree", async () => {
    const idx = index()
    const parent = await idx.getTreeParent("C23.888.592.612.107.400")
    assert.equal(parent?.treeNumber, "C23.888.592.612.107")
    assert.equal(parent?.ui, "D001416")
    const children = await idx.getTreeChildren("C23.888.592.612.107")
    assert.ok(children.some((c) => c.ui === "D017116"))
    assert.ok(children.every((c) => c.treeNumber.split(".").length === 6))
    assert.equal(await idx.getTreeParent("C23"), null)
  })

  it("treats unknown terms and missing shards as empty", async () => {
    const idx = index()
    const hits = await idx.lookupTerms(["zzzzqqq", "qqqqzzz nothing"])
    assert.equal(hits.size, 0)
    assert.deepEqual(await idx.getTreeChildren("Q99"), [])
  })

  it("fetches each shard once and only requests shard files", async () => {
    const log: string[] = []
    const idx = createMeshIndex({ fetch: diskFetch(log), baseUrl: "/physio/mesh/2026/" })
    await idx.lookupTerms(["low back pain", "lower back pain", "lumbago"])
    await idx.lookupTerms(["low back pain"])
    await idx.getDescriptors(["D017116"])
    await idx.getDescriptors(["D017116"])
    assert.deepEqual(log.filter((u) => u.includes("terms/")), [
      "/physio/mesh/2026/terms/lo.json",
      "/physio/mesh/2026/terms/lu.json",
    ])
    assert.equal(log.filter((u) => u.includes("desc/")).length, 1)
    for (const u of log) assert.match(u, /^\/physio\/mesh\/2026\/(terms|desc|tree)\/[A-Za-z0-9_]+\.json$/)
  })

  it("drops a failed shard from the cache so it can be retried", async () => {
    let fail = true
    const idx = createMeshIndex({
      fetch: (async (u: RequestInfo | URL) =>
        fail ? new Response("boom", { status: 500 }) : diskFetch()(u)) as typeof fetch,
    })
    await assert.rejects(() => idx.lookupTerms(["lumbago"]))
    fail = false
    const hits = await idx.lookupTerms(["lumbago"])
    assert.ok(hits.get("lumbago"))
  })

  it("defaults to the root-relative base URL and shares instances", () => {
    assert.equal(DEFAULT_MESH_BASE_URL, "/physio/mesh/2026")
    assert.equal(getMeshIndex(), getMeshIndex())
  })
})
