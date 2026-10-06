/**
 * Builds the static, sharded MeSH index that the physio Suchstring-Generator
 * loads in the browser (public/physio/mesh/<year>/).
 *
 * Run:  npm run physio:mesh            (uses .cache/physio/, downloads on first run)
 *       npm run physio:mesh -- --refresh          re-download MeSH and Wikidata
 *       npm run physio:mesh -- --skip-wikidata    build without German Wikidata labels
 *
 * Sources
 *   - NLM MeSH descriptors (desc<year>.gz), streamed and split on
 *     </DescriptorRecord>, never loaded as one string. Supplementary concept
 *     records are not part of the descriptor file and are not used.
 *   - Wikidata (CC0): items with MeSH descriptor ID (P486) and German label /
 *     alias, fetched by SPARQL in ID-prefix pages (D00 ... D07), cached.
 *   - lib/physio/search-string/terminology.json (curated German aliases per
 *     MeSH heading) and scripts/physio/mesh/de-supplement.json (UI -> German
 *     terms for physio gaps). Both are "de-curated" and win over Wikidata.
 *
 * Descriptor filter (also written to meta.json, keep both in sync):
 *   keep when a descriptor has at least one tree number that starts with
 *     A  Anatomy
 *     C  Diseases
 *     E  Analytical, Diagnostic and Therapeutic Techniques and Equipment
 *     F  Psychiatry and Psychology
 *     G  Phenomena and Processes
 *     H  Disciplines and Occupations
 *     I  Anthropology, Education, Sociology and Social Phenomena
 *     J02  Food and Beverages (nutrition; the rest of J is industry/agriculture)
 *     L01.906 Statistics as Topic, L01.143 Communication (health communication,
 *          information seeking), L01.313 Informatics (digital health),
 *          L01.224.050/.160/.230/.900 (algorithms/machine learning, computer
 *          simulation incl. virtual reality, computer systems incl. smartphone,
 *          software incl. mobile applications), L01.296 Data Display,
 *          L01.700 Artificial Intelligence. The rest of L is dropped.
 *     M  Persons (age groups, athletes, patients, caregivers)
 *     N  Health Care (incl. Sick Leave, Quality of Life, Physical Therapy services)
 *     V  Publication Types (RCT, Systematic Review, ...)
 *     Z  Geographicals
 *   dropped: K Humanities, the rest of L Information Science, the rest of J.
 *   B Organisms: only Humans, Animals, Mice, Rats (needed for the PubMed
 *     humans/animals filters).
 *   D Chemicals and Drugs: every D27 descriptor (Pharmacologic Actions), every
 *     chemical whose pharmacological action list names one of PHARMA_ACTIONS
 *     (analgesics, NSAIDs, muscle relaxants, local anaesthetics, antirheumatics,
 *     bone density agents, ...), and the descriptors in EXTRA_CHEMICALS
 *     (botulinum toxins, hyaluronic acid, vitamin D, creatine, ...).
 *     All other chemicals/proteins/organisms are skipped.
 *   descriptors without any tree number are skipped, except the check tags
 *     Female and Male (TREELESS_KEEP).
 *
 * Output (see meta.json "shards" for the machine-readable form)
 *   terms/<key>.json   normalised term -> [[UI, sourceCode, acronymFlag?], ...]
 *                      key = first two chars of the term, [^a-z0-9] -> "_"
 *                      sourceCode 0 en-name, 1 en-entry, 2 de-wd, 3 de-curated
 *                      acronymFlag 1 = the original is an acronym, require
 *                      uppercase in the input
 *   desc/<bucket>.json UI -> { n, t, e?, de?, s? }, bucket = FNV-1a32(UI) % 256
 *                      as two hex digits
 *   tree/<key>.json    treeNumber -> UI, key = first three chars ("C23")
 *   meta.json
 */
import { createReadStream, createWriteStream, existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { pipeline } from "node:stream/promises"
import { Readable } from "node:stream"
import { fileURLToPath } from "node:url"
import { createGunzip } from "node:zlib"
import {
  MESH_SOURCE_CODES,
  NORMALISATION_VERSION,
  isMeshAcronym,
  isStopTerm,
  meshDescriptorBucketKey,
  meshTermShardKey,
  meshTreeShardKey,
  normalizeMeshTerm,
  uninvertMeshTerm,
  type MeshTermSource,
} from "../../../lib/physio/search-string/mesh-normalize"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")
const YEAR = "2026"
const CACHE = join(ROOT, ".cache", "physio")
const OUT = join(ROOT, "public", "physio", "mesh", YEAR)
const MESH_URLS = [
  `https://nlmpubs.nlm.nih.gov/projects/mesh/MESH_FILES/xmlmesh/desc${YEAR}.gz`,
  `https://nlmpubs.nlm.nih.gov/projects/mesh/MESH_FILES/xmlmesh/desc${YEAR}.xml`,
]
const MESH_GZ = join(CACHE, `desc${YEAR}.gz`)
const MESH_XML = join(CACHE, `desc${YEAR}.xml`)
const WD_DIR = join(CACHE, "wikidata")
const UA = "physio-sweber-dev-index/1.0 (https://physio.sweber.dev)"

const ARGS = new Set(process.argv.slice(2))
const REFRESH = ARGS.has("--refresh")
const SKIP_WIKIDATA = ARGS.has("--skip-wikidata")

/** Caps and limits, tuned against the size budget (see report in meta.json). */
const LIMITS = {
  scopeNoteChars: 300,
  displayEntryTerms: 25,
  displayGerman: 10,
  matchMaxWords: 7,
  matchMaxChars: 70,
  displayMaxChars: 60,
}

const KEEP_LETTERS = new Set(["A", "C", "E", "F", "G", "H", "I", "M", "N", "V", "Z"])
const KEEP_PREFIXES = [
  "J02",
  "L01.143",
  "L01.224.050",
  "L01.224.160",
  "L01.224.230",
  "L01.224.900",
  "L01.296",
  "L01.313",
  "L01.700",
  "L01.906",
]
/** Check tags without tree number that PubMed filters (Male/Female) need. */
const TREELESS_KEEP = new Set(["Female", "Male"])
const B_NAMES = new Set(["Humans", "Animals", "Mice", "Rats"])
const PHARMA_ACTIONS = new Set([
  "Analgesics",
  "Analgesics, Opioid",
  "Analgesics, Non-Narcotic",
  "Analgesics, Short-Acting",
  "Anti-Inflammatory Agents",
  "Anti-Inflammatory Agents, Non-Steroidal",
  "Cyclooxygenase Inhibitors",
  "Muscle Relaxants, Central",
  "Neuromuscular Agents",
  "Anesthetics, Local",
  "Antirheumatic Agents",
  "Bone Density Conservation Agents",
  "Gout Suppressants",
  "Narcotics",
  "Opiate Alkaloids",
])
const EXTRA_CHEMICALS = new Set([
  "Botulinum Toxins",
  "Botulinum Toxins, Type A",
  "Hyaluronic Acid",
  "Collagen",
  "Vitamin D",
  "Cholecalciferol",
  "Creatine",
  "Glucosamine",
  "Chondroitin Sulfates",
  "Capsaicin",
  "Caffeine",
  "Melatonin",
  "Magnesium",
  "Calcium",
  "Vitamin B 12",
  "Fatty Acids, Omega-3",
  "Cannabidiol",
  "Dietary Supplements",
  "Placebos",
])

interface Desc {
  ui: string
  name: string
  trees: string[]
  /** Terms of all concepts, never permuted, preferred concept first. */
  terms: string[]
  /** Permuted terms without comma (plural variants), match only. */
  permuted: string[]
  scope: string
  actions: string[]
}

// ---------------------------------------------------------------- download

async function download(url: string, dest: string): Promise<boolean> {
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok || !res.body) return false
  console.log(`downloading ${url}`)
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest))
  return true
}

async function ensureMesh(): Promise<{ file: string; gz: boolean }> {
  await mkdir(CACHE, { recursive: true })
  if (!REFRESH) {
    if (existsSync(MESH_GZ)) return { file: MESH_GZ, gz: true }
    if (existsSync(MESH_XML)) return { file: MESH_XML, gz: false }
  }
  if (await download(MESH_URLS[0], MESH_GZ)) return { file: MESH_GZ, gz: true }
  if (await download(MESH_URLS[1], MESH_XML)) return { file: MESH_XML, gz: false }
  throw new Error("MeSH descriptor file could not be downloaded")
}

// ------------------------------------------------------------- MeSH parsing

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (_, e: string) => {
    if (e === "amp") return "&"
    if (e === "lt") return "<"
    if (e === "gt") return ">"
    if (e === "quot") return '"'
    if (e === "apos") return "'"
    const code = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return String.fromCodePoint(code)
  })
}

function parseRecord(r: string): Desc | null {
  const ui = /<DescriptorUI>(D\d+)<\/DescriptorUI>/.exec(r)?.[1]
  const name = /<DescriptorName>\s*<String>([^<]*)<\/String>/.exec(r)?.[1]
  if (!ui || !name) return null

  const treeList = /<TreeNumberList>([\s\S]*?)<\/TreeNumberList>/.exec(r)?.[1] ?? ""
  const trees = [...treeList.matchAll(/<TreeNumber>([^<]+)<\/TreeNumber>/g)].map((m) => m[1].trim())

  const actionList = /<PharmacologicalActionList>([\s\S]*?)<\/PharmacologicalActionList>/.exec(r)?.[1] ?? ""
  const actions = [
    ...actionList.matchAll(/<DescriptorName>\s*<String>([^<]*)<\/String>/g),
  ].map((m) => decodeEntities(m[1]))

  const terms: string[] = []
  const permuted: string[] = []
  let scope = ""
  const concepts = [...r.matchAll(/<Concept PreferredConceptYN="([YN])">([\s\S]*?)<\/Concept>/g)]
  concepts.sort((a, b) => (a[1] === b[1] ? 0 : a[1] === "Y" ? -1 : 1))
  for (const [, preferred, body] of concepts) {
    if (preferred === "Y" && !scope) {
      scope = decodeEntities(/<ScopeNote>([\s\S]*?)<\/ScopeNote>/.exec(body)?.[1] ?? "")
    }
    for (const t of body.matchAll(/<Term\s+([^>]*)>\s*<TermUI>[^<]*<\/TermUI>\s*<String>([^<]*)<\/String>/g)) {
      const text = decodeEntities(t[2]).trim()
      if (!text) continue
      if (/IsPermutedTermYN="Y"/.test(t[1])) {
        if (!text.includes(", ")) permuted.push(text)
      } else {
        terms.push(text)
      }
    }
  }
  return {
    ui,
    name: decodeEntities(name).trim(),
    trees,
    terms,
    permuted,
    scope: trimScope(scope),
    actions,
  }
}

/**
 * MeSH scope notes write cross-references in capitals ("SPRAINS AND STRAINS;
 * INTERVERTEBRAL DISK DISPLACEMENT"). Runs of capital words and single capital
 * words of five or more letters become lowercase; short single words (DNA,
 * COPD, MRI) are left alone because they are usually acronyms.
 */
const KEEP_CAPS = /^(NSAIDS?|COVID|AIDS|SARS|HIV|ELISA|ANOVA|RIFLE|CRISPR)$/
function calmCapitals(text: string): string {
  return text.replace(/\b[A-Z]{3,}(?:(?:[;,] | )[A-Z]{2,})*\b/g, (run: string, offset: number) => {
    if (KEEP_CAPS.test(run)) return run
    if (run.length < 5 && !run.includes(" ")) return run
    const lower = run.toLowerCase()
    const atSentenceStart = offset === 0 || /[.!?] $/.test(text.slice(Math.max(0, offset - 2), offset))
    return atSentenceStart ? lower[0].toUpperCase() + lower.slice(1) : lower
  })
}

function trimScope(raw: string): string {
  const s = calmCapitals(raw.replace(/\s+/g, " ").trim())
  if (s.length <= LIMITS.scopeNoteChars) return s
  const cut = s.slice(0, LIMITS.scopeNoteChars)
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "))
  if (sentence >= 80) return cut.slice(0, sentence + 1)
  const word = cut.lastIndexOf(" ")
  return `${cut.slice(0, word > 0 ? word : cut.length).replace(/[,;:(\s]+$/, "")}…`
}

function keepDescriptor(d: Desc): boolean {
  if (d.trees.length === 0) return TREELESS_KEEP.has(d.name)
  for (const tn of d.trees) {
    const letter = tn[0]
    if (KEEP_LETTERS.has(letter)) return true
    if (KEEP_PREFIXES.some((p) => tn.startsWith(p))) return true
    if (letter === "D" && tn.startsWith("D27")) return true
    if (letter === "B" && B_NAMES.has(d.name)) return true
  }
  if (d.trees.some((tn) => tn[0] === "D")) {
    if (EXTRA_CHEMICALS.has(d.name)) return true
    if (d.actions.some((a) => PHARMA_ACTIONS.has(a))) return true
  }
  return false
}

async function readMesh(file: string, gz: boolean): Promise<{ kept: Desc[]; total: number }> {
  const input = createReadStream(file)
  const stream = gz ? input.pipe(createGunzip()) : input
  stream.setEncoding("utf8")
  const kept: Desc[] = []
  let total = 0
  let buf = ""
  const END = "</DescriptorRecord>"
  for await (const chunk of stream as AsyncIterable<string>) {
    buf += chunk
    let at: number
    while ((at = buf.indexOf(END)) !== -1) {
      const rec = buf.slice(0, at + END.length)
      buf = buf.slice(at + END.length)
      total++
      const d = parseRecord(rec)
      if (d && keepDescriptor(d)) kept.push(d)
    }
  }
  return { kept, total }
}

// ---------------------------------------------------------------- Wikidata

interface WdEntry {
  label?: string
  aliases: string[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

class SplitError extends Error {}

async function sparql(prefix: string): Promise<Array<[string, string, string]>> {
  const query =
    `SELECT ?id ?l ?type WHERE { ?i wdt:P486 ?id . FILTER(STRSTARTS(?id,"${prefix}")) ` +
    `{ ?i rdfs:label ?l . FILTER(LANG(?l)="de") BIND("l" AS ?type) } UNION ` +
    `{ ?i skos:altLabel ?l . FILTER(LANG(?l)="de") BIND("a" AS ?type) } }`
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
        signal: AbortSignal.timeout(100_000),
      })
      if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
        const wait = Number(res.headers.get("retry-after")) || 15 * attempt
        console.log(`  ${prefix}: HTTP ${res.status}, waiting ${wait}s`)
        await sleep(wait * 1000)
        continue
      }
      if (res.status === 500) {
        const text = await res.text()
        if (/timeout|TimeoutException/i.test(text)) throw new SplitError(prefix)
        throw new Error(`Wikidata HTTP 500: ${text.slice(0, 200)}`)
      }
      if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`)
      const json = (await res.json()) as {
        results: { bindings: Array<{ id: { value: string }; l: { value: string }; type: { value: string } }> }
      }
      return json.results.bindings.map((b) => [b.id.value, b.type.value, b.l.value])
    } catch (e) {
      if (e instanceof SplitError) throw e
      if ((e as Error).name === "TimeoutError" || (e as Error).name === "AbortError") throw new SplitError(prefix)
      if (attempt === 5) throw e
      console.log(`  ${prefix}: ${(e as Error).message}, retrying`)
      await sleep(10_000 * attempt)
    }
  }
  throw new Error("unreachable")
}

async function fetchPrefix(prefix: string): Promise<Array<[string, string, string]>> {
  const cacheFile = join(WD_DIR, `${prefix}.json`)
  if (!REFRESH && existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, "utf8")) as Array<[string, string, string]>
  }
  let rows: Array<[string, string, string]>
  try {
    console.log(`wikidata ${prefix}*`)
    rows = await sparql(prefix)
    await sleep(3000)
  } catch (e) {
    if (!(e instanceof SplitError) || prefix.length >= 6) throw e
    console.log(`  ${prefix}*: too large for one query, splitting`)
    rows = []
    for (let d = 0; d <= 9; d++) rows.push(...(await fetchPrefix(`${prefix}${d}`)))
    // Sub-prefix pages are cached individually; the parent file is a merge.
  }
  await mkdir(WD_DIR, { recursive: true })
  await writeFile(cacheFile, JSON.stringify(rows))
  return rows
}

async function loadWikidata(): Promise<Map<string, WdEntry>> {
  const map = new Map<string, WdEntry>()
  if (SKIP_WIKIDATA) return map
  for (const prefix of ["D00", "D01", "D02", "D03", "D04", "D05", "D06", "D07"]) {
    for (const [id, type, label] of await fetchPrefix(prefix)) {
      const e = map.get(id) ?? { aliases: [] }
      if (type === "l") e.label = label
      else e.aliases.push(label)
      map.set(id, e)
    }
  }
  return map
}

// ----------------------------------------------------------------- curated

async function loadCurated(byName: Map<string, string>): Promise<{
  terms: Map<string, string[]>
  english: Map<string, string[]>
  unresolved: string[]
}> {
  const terms = new Map<string, string[]>()
  const english = new Map<string, string[]>()
  const unresolved: string[] = []
  const push = (m: Map<string, string[]>, ui: string, vals: string[]) => {
    const a = m.get(ui) ?? []
    for (const v of vals) if (v && !a.includes(v)) a.push(v)
    m.set(ui, a)
  }
  const raw = JSON.parse(
    await readFile(join(ROOT, "lib/physio/search-string/terminology.json"), "utf8")
  ) as {
    concepts: Array<{ id: string; label: string; aliasesDe?: string[]; aliasesEn?: string[]; mesh?: string[] }>
  }
  for (const c of raw.concepts) {
    for (const m of c.mesh ?? []) {
      const ui = byName.get(m.toLowerCase())
      if (!ui) {
        unresolved.push(`${c.id}: ${m}`)
        continue
      }
      push(terms, ui, [c.label, ...(c.aliasesDe ?? [])])
      push(english, ui, c.aliasesEn ?? [])
    }
  }
  const supPath = join(HERE, "de-supplement.json")
  if (existsSync(supPath)) {
    const sup = JSON.parse(await readFile(supPath, "utf8")) as Record<string, string[] | string>
    // Keys are the UI, optionally followed by the MeSH name for readability
    // ("D017116 Low Back Pain").
    for (const [key, vals] of Object.entries(sup)) {
      const ui = /^(D\d+)(\s|$)/.exec(key)?.[1]
      if (!ui) continue
      push(terms, ui, Array.isArray(vals) ? vals : [vals])
    }
  }
  return { terms, english, unresolved }
}

// ------------------------------------------------------------------- build

interface Ref {
  src: number
  acr: boolean
}
/** Higher wins when the same term points to the same descriptor twice. */
const SRC_RANK = [3, 2, 1, 4]

async function writeJson(path: string, value: unknown): Promise<number> {
  const text = JSON.stringify(value)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text)
  return Buffer.byteLength(text)
}

function chemicalish(t: string): boolean {
  return /(^|\s)\d+[,-]/.test(t) || /\(\d|\d\)/.test(t) || /\d,\d/.test(t)
}

async function main() {
  const t0 = Date.now()
  const { file, gz } = await ensureMesh()
  console.log(`parsing ${file}`)
  const { kept, total } = await readMesh(file, gz)
  console.log(`descriptors: ${total} read, ${kept.length} kept`)

  const byName = new Map<string, string>()
  for (const d of kept) byName.set(d.name.toLowerCase(), d.ui)

  const wikidata = await loadWikidata()
  const curated = await loadCurated(byName)
  if (curated.unresolved.length) console.log("curated MeSH names not in index:", curated.unresolved)

  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const index = new Map<string, Map<string, Ref>>()
  const addTerm = (ui: string, text: string, src: MeshTermSource, isName = false) => {
    const norm = normalizeMeshTerm(text)
    if (!norm) return
    const acr = isMeshAcronym(text)
    if (norm.length < 3 && !acr) return
    if (!acr && isStopTerm(norm)) return
    if (/^\d+$/.test(norm)) return
    if (!isName) {
      if (norm.split(" ").length > LIMITS.matchMaxWords || norm.length > LIMITS.matchMaxChars) return
    }
    const code = MESH_SOURCE_CODES.indexOf(src)
    let refs = index.get(norm)
    if (!refs) index.set(norm, (refs = new Map()))
    const old = refs.get(ui)
    if (!old) refs.set(ui, { src: code, acr })
    else {
      if (SRC_RANK[code] > SRC_RANK[old.src]) old.src = code
      if (!acr) old.acr = false
    }
  }

  const descBuckets = new Map<string, Record<string, unknown>>()
  const treeShards = new Map<string, Record<string, string>>()
  let deTermCount = 0
  let enTermCount = 0
  let withGerman = 0

  for (const d of kept) {
    // English matching terms
    addTerm(d.ui, d.name, "en-name", true)
    const nat = uninvertMeshTerm(d.name)
    if (nat) addTerm(d.ui, nat, "en-name", true)
    for (const t of d.terms) {
      addTerm(d.ui, t, "en-entry")
      const n = uninvertMeshTerm(t)
      if (n) addTerm(d.ui, n, "en-entry")
    }
    for (const t of d.permuted) addTerm(d.ui, t, "en-entry")
    for (const t of curated.english.get(d.ui) ?? []) addTerm(d.ui, t, "en-entry")

    // German
    const enNames = new Set([normalizeMeshTerm(d.name), ...(nat ? [normalizeMeshTerm(nat)] : [])])
    const de: string[] = []
    const seen = new Set<string>(enNames)
    const addDe = (text: string, src: MeshTermSource) => {
      const t = text.trim()
      if (!t || t.length > 80) return
      const n = normalizeMeshTerm(t)
      if (!n) return
      addTerm(d.ui, t, src)
      if (seen.has(n)) return
      seen.add(n)
      de.push(t)
    }
    for (const t of curated.terms.get(d.ui) ?? []) addDe(t, "de-curated")
    const wd = wikidata.get(d.ui)
    if (wd) {
      if (wd.label) addDe(wd.label, "de-wd")
      for (const a of wd.aliases) addDe(a, "de-wd")
    }
    deTermCount += de.length
    if (de.length) withGerman++

    // Display entry terms
    const have = new Set([d.name.toLowerCase()])
    const all = new Set(d.terms.map((t) => t.toLowerCase()))
    const display: string[] = []
    for (const t of d.terms) {
      const key = t.toLowerCase()
      if (have.has(key)) continue
      have.add(key)
      if (t.length > LIMITS.displayMaxChars || chemicalish(t)) continue
      const n = uninvertMeshTerm(t)
      if (n && (all.has(n.toLowerCase()) || have.has(n.toLowerCase()))) continue
      display.push(t)
    }
    const entries = display.slice(0, LIMITS.displayEntryTerms)
    enTermCount += 1 + d.terms.length

    const rec: Record<string, unknown> = { n: d.name, t: d.trees }
    if (entries.length) rec.e = entries
    if (de.length) rec.de = de.slice(0, LIMITS.displayGerman)
    if (d.scope) rec.s = d.scope
    const bk = meshDescriptorBucketKey(d.ui)
    const bucket = descBuckets.get(bk) ?? {}
    bucket[d.ui] = rec
    descBuckets.set(bk, bucket)

    for (const tn of d.trees) {
      const k = meshTreeShardKey(tn)
      const shard = treeShards.get(k) ?? {}
      shard[tn] = d.ui
      treeShards.set(k, shard)
    }
  }

  // Write terms
  const termShards = new Map<string, Record<string, Array<Array<string | number>>>>()
  let termRefs = 0
  let enRefs = 0
  let deRefs = 0
  for (const [norm, refs] of [...index].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const key = meshTermShardKey(norm)
    const shard = termShards.get(key) ?? {}
    const list = [...refs]
      .sort((a, b) => SRC_RANK[b[1].src] - SRC_RANK[a[1].src] || (a[0] < b[0] ? -1 : 1))
      .map(([ui, r]) => (r.acr ? [ui, r.src, 1] : [ui, r.src]))
    for (const [, r] of refs) {
      if (r.src >= 2) deRefs++
      else enRefs++
    }
    termRefs += list.length
    shard[norm] = list
    termShards.set(key, shard)
  }

  const sizes: Array<{ file: string; bytes: number }> = []
  for (const [k, v] of termShards) sizes.push({ file: `terms/${k}.json`, bytes: await writeJson(join(OUT, "terms", `${k}.json`), v) })
  for (const [k, v] of descBuckets) sizes.push({ file: `desc/${k}.json`, bytes: await writeJson(join(OUT, "desc", `${k}.json`), v) })
  for (const [k, v] of treeShards) {
    const sorted = Object.fromEntries(Object.entries(v).sort((a, b) => (a[0] < b[0] ? -1 : 1)))
    sizes.push({ file: `tree/${k}.json`, bytes: await writeJson(join(OUT, "tree", `${k}.json`), sorted) })
  }

  const sum = (pre: string) => sizes.filter((s) => s.file.startsWith(pre)).reduce((a, s) => a + s.bytes, 0)
  const max = [...sizes].sort((a, b) => b.bytes - a.bytes)
  const meta = {
    version: YEAR,
    format: 1,
    builtAt: new Date().toISOString().slice(0, 10),
    counts: {
      descriptorsInSource: total,
      descriptors: kept.length,
      descriptorsWithGerman: withGerman,
      normalisedTerms: index.size,
      termRefs,
      englishTermRefs: enRefs,
      germanTermRefs: deRefs,
      germanDisplayLabels: deTermCount,
      wikidataItemsWithGerman: wikidata.size,
      treeNumbers: [...treeShards.values()].reduce((a, s) => a + Object.keys(s).length, 0),
      files: sizes.length + 1,
    },
    bytes: {
      terms: sum("terms/"),
      desc: sum("desc/"),
      tree: sum("tree/"),
      total: sizes.reduce((a, s) => a + s.bytes, 0),
      largestShard: { file: max[0].file, bytes: max[0].bytes },
    },
    sources: [
      { name: "MeSH descriptors", url: MESH_URLS[0], note: "NLM MeSH 2026, descriptor records only" },
      { name: "Wikidata", url: "https://query.wikidata.org/sparql", note: "P486 MeSH descriptor ID, German labels and aliases, CC0" },
      { name: "Curated", path: "lib/physio/search-string/terminology.json + scripts/physio/mesh/de-supplement.json" },
    ],
    attribution: [
      "MeSH: courtesy of the U.S. National Library of Medicine",
      "Wikidata: CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/)",
    ],
    normalisation: {
      version: NORMALISATION_VERSION,
      module: "lib/physio/search-string/mesh-normalize.ts",
      spec: "lowercase; remove apostrophes; fold ä ö ü ß æ œ ø đ ł (ae oe ue ss ae oe o d l); NFKD and strip combining marks; non-letter/digit runs to one space; trim",
    },
    shards: {
      terms: {
        path: "terms/<key>.json",
        key: "first two chars of the normalised term, [^a-z0-9] replaced by _",
        value: "normalised term -> [[UI, sourceCode, acronymFlag?], ...]",
        sourceCodes: MESH_SOURCE_CODES,
        acronymFlag: "1 when the original term is an acronym (isMeshAcronym): require uppercase in the input",
      },
      desc: {
        path: "desc/<bucket>.json",
        bucket: "FNV-1a 32-bit over the UI string (offset 0x811c9dc5, prime 0x01000193), modulo 256, two lowercase hex digits",
        value: "UI -> { n: name, t: treeNumbers, e?: entryTerms, de?: germanLabels, s?: scopeNote }",
      },
      tree: {
        path: "tree/<key>.json",
        key: "first three chars of the tree number (C23)",
        value: "treeNumber -> UI",
      },
    },
    filter: {
      treeLetters: [...KEEP_LETTERS].sort(),
      treePrefixes: KEEP_PREFIXES,
      dropped: ["K Humanities", "L except the listed L01 prefixes", "J except J02", "supplementary concept records"],
      treelessKept: [...TREELESS_KEEP],
      organisms: [...B_NAMES],
      chemicals: {
        trees: "D27 (Pharmacologic Actions)",
        pharmacologicalActions: [...PHARMA_ACTIONS],
        extra: [...EXTRA_CHEMICALS],
      },
      requiresTreeNumber: true,
      permutedTerms: "plural-style permuted terms without comma are indexed (en-entry); inverted ones are replaced by a derived natural order",
    },
    limits: LIMITS,
  }
  await writeJson(join(OUT, "meta.json"), meta)

  console.log(JSON.stringify({ counts: meta.counts, bytes: meta.bytes }, null, 2))
  console.log("largest:", max.slice(0, 5).map((s) => `${s.file} ${(s.bytes / 1024).toFixed(0)}KB`).join(", "))
  const over = sizes.filter((s) => s.bytes > 150 * 1024).length
  console.log(`${over} shards over 150 KB, ${((Date.now() - t0) / 1000).toFixed(0)}s`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
