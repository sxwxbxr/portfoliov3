/**
 * Converter between PubMed and Cochrane Library syntax for a pasted string.
 *
 * Only what maps one-to-one is converted:
 *   "X"[Mesh]            <-> [mh "X"]            (explode)
 *   "X"[Mesh:NoExp]      <-> [mh ^"X"]           (no explode)
 *   "X"[Majr]            <-> [mh "X"[mj]]
 *   "a b"[tiab]          <-> "a b":ti,ab,kw      (kw is Cochrane only)
 *   "a b*"[tiab]         <-> (a NEXT b*):ti,ab,kw (no wildcard in quoted Cochrane phrases)
 *   [ti] / [ab]          <-> :ti / :ab
 * Everything else (publication type, date, language filters, qualifiers, NEAR, line
 * references, wildcards that exist in one syntax only, ...) is left untouched and
 * reported in `unsafe`. Nothing is guessed.
 */
import { parsePubmedLine } from "./lint"
import { nextForm, parseCochraneLine, parseMesh, type CGroup, type CItem, type COperand } from "./lint-cochrane"
import { COCHRANE_FIELDS, COCHRANE_MIN_STEM, PUBMED_MIN_STEM, cochraneMesh, stemLength } from "./profiles"
import { applyEdits } from "./lint-shared"
import type { Edit } from "./types"

export interface ConvertNote {
  message: string
  /** The piece of the input the note is about. */
  snippet?: string
}

export interface ConvertResult {
  text: string
  changed: boolean
  /** What was converted and what to know about it. */
  applied: ConvertNote[]
  /** What was left untouched because there is no safe equivalent. */
  unsafe: ConvertNote[]
}

const snip = (s: string, max = 40) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)

/* ── PubMed -> Cochrane ─────────────────────────────────────────── */

const PM_MESH = /^(?:mesh|mh|mesh terms)(:noexp)?$/
const PM_MAJR = /^(?:majr|mesh major topic)(:noexp)?$/
const PM_FIELDS: Record<string, string> = {
  tiab: ":ti,ab,kw",
  "title/abstract": ":ti,ab,kw",
  ti: ":ti",
  title: ":ti",
  ab: ":ab",
  abstract: ":ab",
}
const PM_UNSAFE: Record<string, string> = {
  pt: "Publikationstypen gibt es in der Cochrane Library nicht als Feld im String. Wähle den Inhaltstyp unter «Search limits».",
  "publication type": "Publikationstypen gibt es in der Cochrane Library nicht als Feld im String. Wähle den Inhaltstyp unter «Search limits».",
  dp: "Das Erscheinungsdatum setzt du in der Cochrane Library unter «Search limits», nicht im String.",
  pdat: "Das Erscheinungsdatum setzt du in der Cochrane Library unter «Search limits», nicht im String.",
  "publication date": "Das Erscheinungsdatum setzt du in der Cochrane Library unter «Search limits», nicht im String.",
  la: "Die Sprache wählst du in der Cochrane Library über das Feldmenü im Tab «Suche». Das Feld :la gibt es nur für CENTRAL-Einträge.",
  lang: "Die Sprache wählst du in der Cochrane Library über das Feldmenü im Tab «Suche». Das Feld :la gibt es nur für CENTRAL-Einträge.",
  language: "Die Sprache wählst du in der Cochrane Library über das Feldmenü im Tab «Suche». Das Feld :la gibt es nur für CENTRAL-Einträge.",
  sb: "Subsets wie [sb] gibt es in der Cochrane Library nicht.",
  tw: "[tw] umfasst in PubMed mehr Felder als :ti,ab,kw. Entscheide selbst, welche Felder du in der Cochrane Library suchen willst.",
  "text word": "[tw] umfasst in PubMed mehr Felder als :ti,ab,kw. Entscheide selbst, welche Felder du in der Cochrane Library suchen willst.",
}

const HUMANS_FILTER = /\s*NOT\s*\(\s*animals\s*\[(?:mh|mesh)\]\s*NOT\s*humans\s*\[(?:mh|mesh)\]\s*\)/i

function cochraneTerm(inner: string, fields: string): string | null {
  // A phrase with a wildcard becomes a NEXT chain, where a hyphen cannot stay: "white-collar worker*" -> (white NEXT collar NEXT worker*).
  const text = (/[*?]/.test(inner) ? inner.replace(/-/g, " ") : inner).trim().replace(/\s+/g, " ")
  if (!text) return null
  const words = text.split(/\s+/)
  if (/[*?]/.test(text)) {
    if (words.some((w) => w.replace(/[*?]/g, "").length < COCHRANE_MIN_STEM)) return null
    if (words.length === 1) return `${text}${fields}`
    const form = nextForm(text)
    return form ? `${form}${fields}` : null
  }
  const quote = words.length > 1 || /[^\p{L}\p{N}]/u.test(text) || /^(and|or|not|near|next)$/i.test(text)
  return `${quote ? `"${text}"` : text}${fields}`
}

export function convertLineToCochrane(src: string): ConvertResult {
  const applied: ConvertNote[] = []
  const unsafe: ConvertNote[] = []
  const edits: Edit[] = []
  const { operands } = parsePubmedLine(src)

  const humans = HUMANS_FILTER.exec(src)
  if (humans) {
    edits.push({ start: humans.index, end: humans.index + humans[0].length, text: "" })
    applied.push({
      message: "Der Filter «nur Menschen» (NOT animals[mh] NOT humans[mh]) entfällt: Die Cochrane Library hat dafür keinen Filter.",
      snippet: humans[0].trim(),
    })
  }
  const inHumans = (o: { s: number; e: number }) => humans !== null && o.s >= humans.index && o.e <= humans.index + humans[0].length

  let kwNote = false
  let noTag = 0
  for (const o of operands) {
    if (inHumans(o)) continue
    if (o.unclosed || o.tag === null) {
      if (o.tag === null && !/^[\d/\-:.]+$/.test(o.text.trim())) noTag++
      continue
    }
    if (!o.tagClosed) {
      unsafe.push({ message: "Das Field Tag hat keine schliessende Klammer.", snippet: snip(src.slice(o.s, o.e)) })
      continue
    }
    const tag = o.tag
    const original = snip(src.slice(o.s, o.e))
    if (/^[\d/\-:.]+$/.test(o.text.trim()) && !PM_MESH.test(tag)) {
      unsafe.push({ message: PM_UNSAFE[tag] ?? `[${tag}] hat in der Cochrane Library keine sichere Entsprechung.`, snippet: original })
      continue
    }
    const mesh = PM_MESH.exec(tag)
    const major = PM_MAJR.exec(tag)
    if (mesh || major) {
      const heading = o.text.trim()
      if (!o.quoted && o.words > 1) {
        unsafe.push({ message: "Ein Schlagwort aus mehreren Wörtern ohne Anführungszeichen: unklar, was gemeint ist.", snippet: original })
      } else if (!heading || /[*?/]/.test(heading)) {
        unsafe.push({
          message: heading.includes("/")
            ? "Subheadings (Qualifier) wie «X/ae» brauchen in der Cochrane Library das Kürzel nach dem Schrägstrich in Grossbuchstaben und werden nicht automatisch übersetzt."
            : "Trunkierung bei Schlagworten funktioniert in keiner der beiden Datenbanken.",
          snippet: original,
        })
      } else {
        const explode = !(mesh?.[1] ?? major?.[1])
        const text = major ? `[mh ${explode ? "" : "^"}"${heading}"[mj]]` : cochraneMesh(heading, explode)
        edits.push({ start: o.s, end: o.e, text })
      }
      continue
    }
    const fields = PM_FIELDS[tag]
    if (fields) {
      const term = o.quoted || o.words === 1 ? cochraneTerm(o.text, fields) : null
      if (term) {
        edits.push({ start: o.s, end: o.e, text: term })
        if (fields === COCHRANE_FIELDS) kwNote = true
      } else {
        unsafe.push({
          message: !o.quoted && o.words > 1 ? "Mehrere Wörter ohne Anführungszeichen vor dem Field Tag: unklar, welche Wörter gemeint sind." : "Der Begriff lässt sich nicht sicher übertragen (Platzhalter in Phrase oder zu kurzer Wortstamm).",
          snippet: original,
        })
      }
      continue
    }
    unsafe.push({ message: PM_UNSAFE[tag] ?? `[${tag}] hat in der Cochrane Library keine sichere Entsprechung.`, snippet: original })
  }

  let text = applyEdits(src, edits)
  if (HUMANS_FILTER.test(src)) text = text.replace(/\s{2,}/g, " ").trim()
  // Field tags that no term claimed (behind a parenthesis, without a term): left as they are.
  for (const l of text.matchAll(/\[(?!\s*mh[\s^"“”„«»‟/])(?!\s*mj\s*\])[^\]]*\]/gi)) {
    if (unsafe.some((u) => u.snippet?.includes(l[0]))) continue
    unsafe.push({ message: "Ein Field Tag gehört zu keinem Begriff oder steht hinter einer Klammer und lässt sich nicht sicher übertragen.", snippet: snip(l[0]) })
  }
  if (kwNote) {
    applied.push({
      message: "[tiab] wird zu :ti,ab,kw. Die Cochrane Library sucht damit zusätzlich in den Schlüsselwörtern (kw). Das ist der übliche Ersatz, aber etwas weiter als [tiab].",
    })
  }
  if (noTag) {
    applied.push({
      message: `${noTag === 1 ? "Ein Begriff hat" : `${noTag} Begriffe haben`} kein Field Tag und bleibt so stehen. In der Cochrane Library durchsucht das den gesamten Text.`,
    })
  }
  return { text, changed: text !== src, applied, unsafe }
}

/* ── Cochrane -> PubMed ─────────────────────────────────────────── */

const CO_UNSAFE: Record<string, string> = {
  kw: "Das Cochrane-Feld :kw hat in PubMed keine Entsprechung.",
  pt: "Publikationstypen heissen in PubMed anders und werden mit [pt] gesucht. Das Tool übersetzt sie nicht.",
  au: "Autoren schreibt PubMed «Müller A[au]», das Tool übersetzt das nicht.",
  so: "Das Quellenfeld :so hat in PubMed mehrere Entsprechungen ([ta], [jour]). Das Tool übersetzt es nicht.",
  doi: "DOI-Suche: in PubMed [doi], aber ohne Gewähr. Das Tool übersetzt sie nicht.",
  an: "Das Feld :an (Accession Number) gibt es in PubMed nicht.",
  tp: "Cochrane-Themen (:tp) gibt es in PubMed nicht.",
  crg: "Cochrane-Review-Gruppen (:crg) gibt es in PubMed nicht.",
}

function pubmedTerm(text: string, tag: string): string | null {
  const t = text.trim()
  if (!t) return null
  if (/^[*?]/.test(t) || t.includes("?")) return null
  if (t.includes("*") && stemLength(t) < PUBMED_MIN_STEM) return null
  const needsQuotes = /[\s\-/,:'.]/.test(t)
  return `${needsQuotes ? `"${t}"` : t}[${tag}]`
}

function pubmedFieldTag(codes: string[]): { tag: string; kw: boolean } | null {
  const set = new Set(codes)
  const kw = set.has("kw")
  if (set.size === 3 && set.has("ti") && set.has("ab") && kw) return { tag: "tiab", kw: true }
  if (set.size === 2 && set.has("ti") && set.has("ab")) return { tag: "tiab", kw: false }
  if (set.size === 1 && set.has("ti")) return { tag: "ti", kw: false }
  if (set.size === 1 && set.has("ab")) return { tag: "ab", kw: false }
  if (set.size === 1 && set.has("la")) return { tag: "la", kw: false }
  return null
}

/** Words of a (a NEXT b NEXT c*) group, or null when the group is anything else. */
function nextChainWords(g: CGroup): string[] | null {
  const words: string[] = []
  for (let i = 0; i < g.items.length; i++) {
    const it = g.items[i]
    if (i % 2 === 0) {
      if (it.kind !== "operand" || it.sub !== "word" || it.words !== 1 || it.field) return null
      words.push(it.text)
    } else if (it.kind !== "op" || it.op !== "NEXT" || it.bad) {
      return null
    }
  }
  return words.length >= 2 && g.items.length % 2 === 1 ? words : null
}

export function convertLineToPubmed(src: string): ConvertResult {
  const applied: ConvertNote[] = []
  const unsafe: ConvertNote[] = []
  const edits: Edit[] = []
  const { items } = parseCochraneLine(src)
  let kwDropped = false
  let upper = 0

  const fieldFor = (codes: string[], original: string): { tag: string } | null => {
    const m = pubmedFieldTag(codes)
    if (m) {
      if (m.kw) kwDropped = true
      return { tag: m.tag }
    }
    const first = codes.find((c) => CO_UNSAFE[c])
    unsafe.push({
      message: first ? CO_UNSAFE[first] : `Die Feldcodes :${codes.join(",")} haben in PubMed keine sichere Entsprechung.`,
      snippet: snip(original),
    })
    return null
  }

  const visit = (list: CItem[]) => {
    for (const it of list) {
      if (it.kind === "op") {
        if (it.op === "NEAR" || it.op === "NEXT") {
          unsafe.push({
            message: it.op === "NEAR" ? "NEAR hat in PubMed keine einfache Entsprechung ([tiab:~n] gilt nur für Phrasen)." : "NEXT lässt sich nur als Phrase übertragen, wenn nur einzelne Wörter verknüpft sind, zum Beispiel (hearing NEXT aid*).",
            snippet: it.text,
          })
        } else if (it.text !== it.op) {
          edits.push({ start: it.s, end: it.e, text: it.op })
          upper++
        }
      } else if (it.kind === "group") {
        if (it.field) {
          const words = nextChainWords(it)
          const original = src.slice(it.s, it.e)
          const f = fieldFor(it.field.codes, original)
          if (!f) continue
          const term = words ? pubmedTerm(words.join(" "), f.tag) : null
          if (term) edits.push({ start: it.s, end: it.e, text: term })
          else unsafe.push({ message: "Ein Feldcode hinter einer Klammer lässt sich nur für eine NEXT-Phrase aus einzelnen Wörtern übertragen.", snippet: snip(original) })
        } else {
          visit(it.items)
        }
      } else if (it.kind === "operand") {
        convertOperand(it)
      }
    }
  }

  const convertOperand = (o: COperand) => {
    const original = src.slice(o.s, o.e)
    if (o.sub === "ref" || o.sub === "range") {
      unsafe.push({ message: "Zeilenbezüge (#n) gibt es im PubMed-Suchfeld nicht. Füge die Einzeilen-Variante des Strings ein.", snippet: snip(original) })
      return
    }
    if (o.sub === "mesh") {
      const b = o.bracket!
      const m = parseMesh(src, b.s, b.e, b.closed)
      const heading = m.heading.trim()
      if (m.label.toLowerCase() !== "mh" || !b.closed || m.noSpace || m.caretInside || m.caretAfter || m.junk || m.unclosedQuote || o.field) {
        unsafe.push({ message: "Die MeSH-Suche ist fehlerhaft geschrieben. Korrigiere sie zuerst mit der Prüfung.", snippet: snip(original) })
      } else if (m.qualifiers.length) {
        unsafe.push({ message: "Qualifier wie /AE schreibt PubMed als Subheading («X/adverse effects»). Das Tool übersetzt sie nicht.", snippet: snip(original) })
      } else if (!heading) {
        unsafe.push({ message: "Die MeSH-Suche enthält kein Schlagwort.", snippet: snip(original) })
      } else if (!m.quoted && /[\s,]/.test(heading)) {
        unsafe.push({ message: "Ein Schlagwort aus mehreren Wörtern steht ohne Anführungszeichen: unklar, was gemeint ist.", snippet: snip(original) })
      } else if (/[*?]/.test(heading)) {
        unsafe.push({ message: "Trunkierung bei Schlagworten funktioniert in keiner der beiden Datenbanken.", snippet: snip(original) })
      } else {
        const tag = `${m.major ? "Majr" : "Mesh"}${m.caret ? ":NoExp" : ""}`
        edits.push({ start: o.s, end: o.e, text: `"${heading}"[${tag}]` })
      }
      return
    }
    if (!o.field) return
    if (o.unclosed) return
    const f = fieldFor(o.field.codes, original)
    if (!f) return
    if (!o.quoted && o.words > 1) {
      unsafe.push({ message: "Mehrere Wörter ohne Anführungszeichen vor dem Feldcode: unklar, welche Wörter gemeint sind.", snippet: snip(original) })
      return
    }
    const term = pubmedTerm(o.text, f.tag)
    if (!term) {
      unsafe.push({
        message: "Der Begriff lässt sich nicht sicher übertragen: PubMed kennt kein ? und keinen Stern am Wortanfang, und vor dem * braucht es vier Zeichen.",
        snippet: snip(original),
      })
      return
    }
    edits.push({ start: o.s, end: o.e, text: term })
  }

  visit(items)

  const text = applyEdits(src, edits)
  if (kwDropped) {
    applied.push({
      message: ":ti,ab,kw wird zu [tiab]. PubMed hat kein Feld für die Cochrane-Schlüsselwörter (kw). Die Suche wird dadurch etwas enger.",
    })
  }
  if (upper) {
    applied.push({ message: "Operatoren sind gross geschrieben, weil PubMed kleingeschriebene nicht als Operatoren liest." })
  }
  return { text, changed: text !== src, applied, unsafe }
}

/* ── Public API ─────────────────────────────────────────────────── */

const MULTILINE: ConvertNote = {
  message: "Ein mehrzeiliger Search-Manager-Text lässt sich nicht umwandeln, weil die Zeilenbezüge (#n) in PubMed nicht funktionieren. Füge die Einzeilen-Variante ein.",
}

function convert(src: string, to: "cochrane" | "pubmed"): ConvertResult {
  const nonEmpty = src.split("\n").filter((l) => l.trim())
  if (nonEmpty.length > 1) return { text: src, changed: false, applied: [], unsafe: [MULTILINE] }
  const line = nonEmpty[0] ?? ""
  if (!line) return { text: src, changed: false, applied: [], unsafe: [] }
  const r = to === "cochrane" ? convertLineToCochrane(line) : convertLineToPubmed(line)
  return { ...r, text: r.changed ? r.text.trim() : src, changed: r.changed }
}

/** A PubMed string in Cochrane syntax. Unsafe parts stay untouched and are listed in `unsafe`. */
export function convertToCochrane(src: string): ConvertResult {
  return convert(src, "cochrane")
}

/** A Cochrane string in PubMed syntax. Unsafe parts stay untouched and are listed in `unsafe`. */
export function convertToPubmed(src: string): ConvertResult {
  return convert(src, "pubmed")
}
