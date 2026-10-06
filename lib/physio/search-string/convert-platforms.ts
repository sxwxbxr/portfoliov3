/**
 * Converter from a PubMed string to CINAHL (EBSCOhost) or Embase (embase.com) syntax.
 *
 * Only what maps safely is converted, term by term:
 *   "X"[Mesh]          -> (MH "X+")                  | 'x'/exp
 *   "X"[Mesh:NoExp]    -> (MH "X")                   | 'x'/de
 *   "X"[Majr]          -> (MM "X+")                  | 'x'/exp/mj
 *   "a b"[tiab]        -> (TI "a b" OR AB "a b")     | 'a b':ti,ab,kw
 *   "a b*"[tiab]       -> (TI "a b*" OR AB "a b*")   | (a NEXT/1 b*):ti,ab,kw
 *   [ti] / [ab]        -> TI "x" / AB "x"            | :ti / :ab
 * Embase only: english[la] -> [english]/lim, "randomized controlled trial"[pt] -> [randomized controlled trial]/lim.
 *
 * Every converted subject heading is a SUGGESTION: CINAHL Headings and Emtree are licensed and not shipped here, so the
 * tool cannot know whether the heading exists there. The result says so in `applied`.
 * Not converted (listed in `unsafe`, left untouched): dates, language and publication type for CINAHL, qualifiers,
 * author and journal fields, wildcards that exist in one syntax only. Other source syntaxes (Cochrane, CINAHL, Embase) are not
 * converted: the line proximity and field semantics differ and nothing is guessed.
 */
import { detectLintDatabase } from "./detect"
import { EMBASE_LIM_VALUES } from "./lint-embase"
import { parsePubmedLine } from "./lint"
import { applyEdits } from "./lint-shared"
import { CINAHL_MIN_STEM, EMBASE_FIELDS, EMBASE_MIN_STEM, cinahlMesh, embaseMesh, stemLength } from "./profiles"
import type { ConvertNote, ConvertResult } from "./convert"
import type { Edit } from "./types"

const snip = (s: string, max = 40) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)
const PM_MESH = /^(?:mesh|mh|mesh terms)(:noexp)?$/
const PM_MAJR = /^(?:majr|mesh major topic)(:noexp)?$/
const HUMANS_FILTER = /\s*NOT\s*\(\s*animals\s*\[(?:mh|mesh)\]\s*NOT\s*humans\s*\[(?:mh|mesh)\]\s*\)/i
const OPERATOR_WORDS = /^(and|or|not|near|next)$/i
const NEXT_SAFE = /^[\p{L}\p{N}*?$'.&%+/]+$/u
const LIM = new Set<string>(EMBASE_LIM_VALUES)
const EMBASE_PT: Record<string, string> = {
  "randomized controlled trial": "randomized controlled trial",
  "systematic review": "systematic review",
  "meta-analysis": "meta analysis",
}

type Target = "cinahl" | "embase"

function literalLength(word: string): number {
  return word.replace(/[*?]/g, "").length
}

/** CINAHL: the bare term in quotes where needed. Null when it cannot be written safely. */
function cinahlText(text: string): string | null {
  const t = text.trim().replace(/\s+/g, " ")
  if (!t || /[?]/.test(t) || /^\*/.test(t)) return null
  if (t.split(" ").some((w) => w.includes("*") && stemLength(w) < CINAHL_MIN_STEM)) return null
  const quoted = t.includes(" ") || /[^\p{L}\p{N}*]/u.test(t) || OPERATOR_WORDS.test(t) || /^[nw]\d+$/i.test(t)
  return quoted ? `"${t}"` : t
}

/** Embase: the term with its field. Null when it cannot be written safely. */
function embaseTerm(text: string, fields: string): string | null {
  const t = text.trim().replace(/\s+/g, " ")
  if (!t || /^[*?]/.test(t) || t.includes("?")) return null
  if (t.split(" ").some((w) => w.includes("*") && literalLength(w) < EMBASE_MIN_STEM)) return null
  const words = t.split(" ")
  if (t.includes("*") && words.length > 1) {
    const w2 = t.replace(/-/g, " ").split(" ")
    if (!w2.every((w) => NEXT_SAFE.test(w) && !OPERATOR_WORDS.test(w))) return null
    return `(${w2.join(" NEXT/1 ")})${fields}`
  }
  const quoted = words.length > 1 || /[^\p{L}\p{N}*?$]/u.test(t) || OPERATOR_WORDS.test(t)
  return `${quoted ? (t.includes("'") ? `"${t}"` : `'${t}'`) : t}${fields}`
}

function convertLine(src: string, to: Target): ConvertResult {
  const applied: ConvertNote[] = []
  const unsafe: ConvertNote[] = []
  const edits: Edit[] = []
  const { operands } = parsePubmedLine(src)
  const label = to === "cinahl" ? "CINAHL" : "Embase"
  const vocab = to === "cinahl" ? "CINAHL Headings" : "Emtree"

  const humans = HUMANS_FILTER.exec(src)
  if (humans) {
    edits.push({ start: humans.index, end: humans.index + humans[0].length, text: "" })
    applied.push({
      message:
        to === "embase"
          ? "Der Filter «nur Menschen» (NOT animals[mh] NOT humans[mh]) entfällt. Embase hat [humans]/lim, das filtert aber enger (nur als Mensch indexierte Datensätze). Setze es selbst, wenn du es willst."
          : "Der Filter «nur Menschen» (NOT animals[mh] NOT humans[mh]) entfällt: Für CINAHL ist kein Filter dafür belegt.",
      snippet: humans[0].trim(),
    })
  }
  const inHumans = (o: { s: number; e: number }) => humans !== null && o.s >= humans.index && o.e <= humans.index + humans[0].length

  let headings = 0
  let kw = false
  let noTag = 0
  const limits: string[] = []

  for (const o of operands) {
    if (inHumans(o)) continue
    if (o.unclosed || o.tag === null) {
      if (o.tag === null && !/^[\d/\-:.]+$/.test(o.text.trim())) noTag++
      continue
    }
    const original = snip(src.slice(o.s, o.e))
    if (!o.tagClosed) {
      unsafe.push({ message: "Das Field Tag hat keine schliessende Klammer.", snippet: original })
      continue
    }
    const tag = o.tag
    const text = o.text.trim()
    const mesh = PM_MESH.exec(tag)
    const major = PM_MAJR.exec(tag)

    if (mesh || major) {
      const noExp = !!(mesh?.[1] ?? major?.[1])
      if (!text) {
        unsafe.push({ message: "Die MeSH-Suche enthält kein Schlagwort.", snippet: original })
      } else if (!o.quoted && o.words > 1) {
        unsafe.push({ message: "Ein Schlagwort aus mehreren Wörtern ohne Anführungszeichen: unklar, was gemeint ist.", snippet: original })
      } else if (/[*?/]/.test(text)) {
        unsafe.push({
          message: text.includes("/") ? "Qualifier wie «X/ae» werden nicht übersetzt." : "Trunkierung bei Schlagworten funktioniert in keiner der Datenbanken.",
          snippet: original,
        })
      } else {
        headings++
        if (to === "cinahl") {
          const syn = cinahlMesh(text, !noExp)
          edits.push({ start: o.s, end: o.e, text: major ? syn.replace("(MH ", "(MM ") : syn })
        } else {
          const syn = embaseMesh(text, !noExp)
          edits.push({ start: o.s, end: o.e, text: major ? `${syn}/mj` : syn })
        }
      }
      continue
    }

    if (tag === "tiab" || tag === "title/abstract" || tag === "ti" || tag === "title" || tag === "ab" || tag === "abstract") {
      const both = tag === "tiab" || tag === "title/abstract"
      const code = tag.startsWith("ti") ? "ti" : "ab"
      if (!o.quoted && o.words > 1) {
        unsafe.push({ message: "Mehrere Wörter ohne Anführungszeichen vor dem Field Tag: unklar, welche Wörter gemeint sind.", snippet: original })
        continue
      }
      if (to === "cinahl") {
        const term = cinahlText(text)
        if (!term) {
          unsafe.push({ message: "Der Begriff lässt sich nicht sicher übertragen (? gibt es in PubMed nicht, zu kurzer Wortstamm).", snippet: original })
          continue
        }
        edits.push({ start: o.s, end: o.e, text: both ? `(TI ${term} OR AB ${term})` : `${code.toUpperCase()} ${term}` })
      } else {
        const fields = both ? EMBASE_FIELDS : `:${code}`
        const term = embaseTerm(text, fields)
        if (!term) {
          unsafe.push({ message: "Der Begriff lässt sich nicht sicher übertragen (Platzhalter am Wortanfang, zu kurzer Wortstamm).", snippet: original })
          continue
        }
        edits.push({ start: o.s, end: o.e, text: term })
        if (both) kw = true
      }
      continue
    }

    if (to === "embase" && tag === "la" && LIM.has(text.toLowerCase())) {
      edits.push({ start: o.s, end: o.e, text: `[${text.toLowerCase()}]/lim` })
      limits.push(text)
      continue
    }
    if (to === "embase" && (tag === "pt" || tag === "publication type") && EMBASE_PT[text.toLowerCase()]) {
      edits.push({ start: o.s, end: o.e, text: `[${EMBASE_PT[text.toLowerCase()]}]/lim` })
      limits.push(text)
      continue
    }
    unsafe.push({
      message:
        tag === "dp" || tag === "pdat" || tag === "publication date"
          ? to === "embase"
            ? "Das Erscheinungsdatum schreibst du in Embase als [2016-2026]/py. Das Tool rechnet die PubMed-Datumsangabe nicht um."
            : "Das Erscheinungsdatum stellst du in CINAHL als Limiter ein."
          : tag === "la" || tag === "lang" || tag === "language"
            ? "Die Sprache stellst du in CINAHL als Limiter ein."
            : tag === "pt" || tag === "publication type"
              ? "Publikationstypen stellst du in CINAHL als Limiter ein. Die Bezeichnungen dort weichen von PubMed ab."
              : `[${tag}] hat in ${label} keine sichere Entsprechung.`,
      snippet: original,
    })
  }

  let text = applyEdits(src, edits)
  if (humans) text = text.replace(/\s{2,}/g, " ").trim()
  for (const l of text.matchAll(/\[[^\]]*\]/g)) {
    if (/^\/(?:lim|py)/.test(text.slice(l.index! + l[0].length))) continue
    if (unsafe.some((u) => u.snippet?.includes(l[0]))) continue
    unsafe.push({ message: "Ein Field Tag gehört zu keinem Begriff oder steht hinter einer Klammer und lässt sich nicht sicher übertragen.", snippet: snip(l[0]) })
  }
  if (headings) {
    applied.push({
      message: `${headings === 1 ? "Ein Schlagwort wurde" : `${headings} Schlagwörter wurden`} aus MeSH übernommen. Das sind Vorschläge: ${vocab} ist lizenziert, das Tool kennt den Thesaurus nicht und kann nicht sagen, ob es die Begriffe dort gibt. Prüfe jeden im Thesaurus von ${label}.`,
    })
  }
  if (kw) {
    applied.push({ message: "[tiab] wird zu :ti,ab,kw. Embase sucht damit zusätzlich in den Autoren-Schlüsselwörtern (kw), das ist etwas weiter als [tiab]." })
  }
  if (limits.length) {
    applied.push({ message: `${limits.length === 1 ? "Ein Filter wurde" : `${limits.length} Filter wurden`} als Limit [..]/lim geschrieben. Embase wertet Limits über die Indexierung aus, neue Datensätze fehlen oft.` })
  }
  if (noTag) {
    applied.push({
      message: `${noTag === 1 ? "Ein Begriff hat" : `${noTag} Begriffe haben`} kein Field Tag und bleibt so stehen. ${to === "cinahl" ? "EBSCOhost durchsucht dann den ganzen Text." : "Embase sucht dann breit."}`,
    })
  }
  return { text, changed: text !== src, applied, unsafe }
}

function convert(src: string, to: Target): ConvertResult {
  const nonEmpty = src.split("\n").filter((l) => l.trim())
  if (!nonEmpty.length) return { text: src, changed: false, applied: [], unsafe: [] }
  if (nonEmpty.length > 1) {
    return {
      text: src,
      changed: false,
      applied: [],
      unsafe: [{ message: "Nur eine Zeile (der PubMed-Suchstring) lässt sich umwandeln. Zeilenbezüge gibt es in PubMed nicht." }],
    }
  }
  if (detectLintDatabase(src) !== "pubmed") {
    return {
      text: src,
      changed: false,
      applied: [],
      unsafe: [
        {
          message: "Umgewandelt werden nur PubMed-Strings. Dieser String hat die Syntax einer anderen Datenbank. Von Cochrane, CINAHL oder Embase in eine andere Syntax übersetzt das Tool nicht, weil Feldcodes, Abstände und Schlagwörter dort verschieden zählen.",
        },
      ],
    }
  }
  const r = convertLine(nonEmpty[0], to)
  return { ...r, text: r.changed ? r.text.trim() : src, changed: r.changed }
}

/** A PubMed string in CINAHL (EBSCOhost) syntax. Headings are suggestions. Unsafe parts stay untouched and are listed in `unsafe`. */
export function convertToCinahl(src: string): ConvertResult {
  return convert(src, "cinahl")
}

/** A PubMed string in Embase (embase.com) syntax. Headings are suggestions. Unsafe parts stay untouched and are listed in `unsafe`. */
export function convertToEmbase(src: string): ConvertResult {
  return convert(src, "embase")
}
