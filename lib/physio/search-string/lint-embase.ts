/**
 * "Eigenen String prüfen" for Embase on embase.com (Elsevier).
 *
 * Rules (sources in EMBASE_SOURCES, profiles.ts):
 *  - Emtree: 'low back pain'/exp explodes, 'low back pain'/de does not (/mj, /exp/mj major focus). Headings stand in quotes.
 *  - Fields follow the term after a colon: 'back pain':ti,ab,kw; for a group after the closing parenthesis. ':exp' does not work.
 *  - Quotes: single or double. Wildcards * ? $, at least three characters before *, no leading wildcard.
 *    The current help allows wildcards inside quotes, an older guide does not: the linter points to NEXT/1 as the safe form.
 *  - Proximity NEAR/n (either order) and NEXT/n (in order); the distance is written. N5, W5 and ADJ3 belong to other platforms.
 *  - NO operator precedence: parentheses first, then strictly left to right.
 *  - Limits: [english]/lim, [randomized controlled trial]/lim ...; years [2016-2026]/py.
 *  - Lines: #1, #2 ... combined with AND/OR, also mixed with new terms.
 *
 * Ovid-Embase syntax (exp Low Back Pain/, .ti,ab,kf., adj3) is recognised and reported, not checked.
 * Emtree terms cannot be checked against the thesaurus (licensed): the linter checks the syntax only.
 */
import { genericLevel, levenshtein } from "./lint-shared"
import {
  lintStrategy,
  newCtx,
  preview,
  runCommon,
  toRange,
  type CommonOptions,
  type Ctx,
  type Operand,
} from "./lint-platform"
import type { LintFinding } from "./types"

/** Field codes of the Elsevier "What field codes can I use in Embase?" list. */
export const EMBASE_FIELD_CODES = [
  "ab", "ac", "ad", "af", "aid", "an", "au", "bp", "ca", "cd", "cl", "cn", "ct", "cy", "dc", "dd", "de", "df", "dm", "dn", "do", "dtype", "dv",
  "ed", "em", "exp", "ff", "ib", "id", "ii", "ip", "is", "it", "jt", "kw", "la", "lc", "lnk", "ls", "mn", "ms", "nc", "oa", "oc", "ok", "pd",
  "pg", "pii", "pt", "py", "re", "rn", "sd", "sp", "ta", "ti", "tn", "tt", "ui", "vi",
] as const
const FIELDS = new Set<string>(EMBASE_FIELD_CODES)

/** Values of [..]/lim from the Elsevier "What filters or limits can I use in Embase?" page. */
export const EMBASE_LIM_VALUES = [
  "abstracts", "adolescent", "adult", "afrikaans", "aged", "albanian", "anatomy and development", "animal cell", "animal experiment", "animal model",
  "animal tissue", "animals", "arabic", "armenian", "article", "article in press", "azerbaijani", "basque", "belarusian", "bengali", "biochemistry",
  "book", "bosnian", "bulgarian", "burmese", "cancer", "cas registry numbers", "catalan", "child", "chinese", "clinical study", "clinical trial",
  "clinical trial number", "cochrane review", "conference abstract", "conference paper", "conference review", "controlled clinical trial", "croatian",
  "czech", "danish", "data papers", "dermatology and venereology", "device manufacturers", "device trade names", "drug manufacturers", "drug trade names",
  "dutch", "editorial", "embase", "embase classic", "embryo", "english", "erratum", "esperanto", "estonian", "female", "fetus", "finnish", "french",
  "french local collection", "genetics", "georgian", "german", "gerontology and geriatrics", "greek", "hebrew", "hindi", "humans", "hungarian",
  "icelandic", "immunology and hematology", "in process", "indonesian", "infant", "internal medicine", "irish gaelic", "italian", "japanese", "korean",
  "latvian", "letter", "lithuanian", "macedonian", "malay", "male", "medical instrumentation", "medline", "meta analysis", "microbiology", "middle aged",
  "mongolian", "msn", "neurology and psychiatry", "newborn", "norwegian", "note", "obstetrics and gynecology", "ophthalmology", "otorhinolaryngology",
  "pathology and forensic science", "pediatrics", "persian", "pharmacology and pharmacy", "physiology and endocrinology", "polish", "polyglot",
  "portuguese", "preschool", "priority journals", "public health", "pubmed-not-medline", "pushto", "radiology and nuclear medicine",
  "randomized controlled trial", "rehabilitation", "review", "romanian", "russian", "school", "scottish gaelic", "serbian", "short survey",
  "sinhalese", "slovak", "slovenian", "spanish", "surgery", "swedish", "systematic review", "tagalog", "thai", "toxicology and drug dependence",
  "turkish", "ukrainian", "urdu", "uzbek", "very elderly", "vietnamese", "young adult",
] as const
const LIM = new Set<string>(EMBASE_LIM_VALUES)

const HEADING_SUFFIXES = new Set(["/exp", "/de", "/mj", "/exp/mj", "/br"])
const ALL_SUFFIXES = new Set([...HEADING_SUFFIXES, "/lim", "/py", "/sd", ...EMBASE_FIELD_CODES.map((c) => `/${c}`)])

const FIELD_ALIASES: Record<string, string> = {
  tiab: "ti,ab",
  tw: "ti,ab,kw",
  mp: "ti,ab,kw",
  title: "ti",
  abstract: "ab",
  keyword: "kw",
  keywords: "kw",
  kf: "kw",
  language: "la",
}

const PM_TAGS = /^(tiab|ti|ab|tw|mesh(?::noexp)?|mh(?::noexp)?|majr|pt|dp|la|sb|au|ta|all(?: fields)?|title|abstract|mesh terms|text word|language|publication type|publication date|subheading|sh|tt|pdat)(?:\s*:.*)?$/i

const OVID_RE = /\.(?:ti|ab|kf|mp|tw|af|hw|sh|ot|kw)(?:,(?:ti|ab|kf|mp|tw|af|hw|kw|ot))*\./i
const OVID_EXP = /(?:^|[\s(])exp\s+[^()'"]*\/(?=\s|\)|$)/i

const OPTIONS: CommonOptions = {
  platformLabel: "Embase",
  mixedMessage:
    "AND und OR stehen ohne Klammern auf derselben Ebene. Embase hat keine Rangfolge der Operatoren: Es wertet nach den Klammern strikt von links nach rechts aus, «A OR B AND C» heisst «(A OR B) AND C». Setze jede OR-Gruppe in eine Klammer, dann liest Embase genau, was du meinst.",
  unquotedMessage: "In Embase gehört eine Phrase oder ein Emtree-Begriff in Anführungszeichen, am besten in einfache: 'low back pain'. Ohne sie sucht Embase die Wörter einzeln.",
  lowerOpSeverity: "warning",
  lowerOpMessage: "Schreibe Operatoren gross (AND, OR, NOT, NEAR/n, NEXT/n). Die Embase-Hilfe zeigt sie so, und die Suchhistorie schreibt sie gross.",
}

const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean)
const stemOf = (w: string) => w.slice(0, w.indexOf("*")).replace(/[^\p{L}\p{N}]/gu, "").length
const NEXT_SAFE = /^[\p{L}\p{N}*?$'.&%+/]+$/u

function closest(code: string, list: readonly string[], max = 2): string | null {
  let best: string | null = null
  let bestD = max
  for (const k of list) {
    const d = levenshtein(code, k)
    if (d < bestD) {
      best = k
      bestD = d
    }
  }
  return best
}

const isHeadingOperand = (o: Operand) => !!o.suffix && HEADING_SUFFIXES.has(o.suffix.raw.toLowerCase())

function embaseChecks(ctx: Ctx, content: string) {
  const { findings } = ctx

  // Ovid syntax.
  const ovid = OVID_RE.exec(content) ?? OVID_EXP.exec(content)
  if (ovid) {
    // The string is not embase.com syntax at all: the other findings would only be noise.
    ctx.findings.length = 0
    const at = ovid.index + (ovid[0].match(/^\s|\(/) ? 1 : 0)
    findings.push({
      code: "ovid-syntax",
      severity: "error",
      message:
        "Das ist Ovid-Syntax (exp …/, .ti,ab,kf., adj3). Dieses Tool prüft die Syntax von embase.com (Elsevier): 'low back pain'/exp OR 'low back pain':ti,ab,kw. Wenn deine Hochschule Embase über Ovid anbietet, brauchst du die Ovid-Form, die dieses Tool nicht prüft.",
      start: at,
      end: Math.min(content.length, at + Math.max(1, ovid[0].trim().length)),
    })
    return
  }

  // Syntax of other platforms.
  const prefixFields = ctx.fieldToks.filter((f) => f.prefix)
  if (prefixFields.length) {
    const f = prefixFields[0]
    findings.push({
      code: "cinahl-syntax",
      severity: "error",
      message: `${f.raw} vor dem Begriff ist CINAHL-Syntax (EBSCOhost). In Embase steht der Feldcode hinter dem Begriff: 'low back pain':ti,ab,kw. Ein Schlagwort schreibst du 'low back pain'/exp.`,
      start: f.s,
      end: f.e,
      more: prefixFields.slice(1).map(toRange),
    })
  }
  const hashless = ctx.refs.filter((o) => o.refStyle === "S")
  if (hashless.length) {
    findings.push({
      code: "ref-style",
      severity: "error",
      message: "In Embase heissen die Suchzeilen #1, #2 …, nicht S1, S2. Das S gehört zu CINAHL (EBSCOhost).",
      start: hashless[0].s,
      end: hashless[0].e,
      more: hashless.slice(1).map(toRange),
      fix: { label: "S durch # ersetzen", edits: hashless.map((o) => ({ start: o.s, end: o.s + 1, text: "#" })) },
    })
  }

  // Proximity.
  for (const p of ctx.prox) {
    if (p.kind === "N" || p.kind === "W") {
      findings.push({
        code: "prox-syntax",
        severity: "error",
        message: `${p.text} ist CINAHL-Syntax. Embase schreibt ${p.kind === "N" ? "NEAR" : "NEXT"}/${p.n ?? "n"} (${p.kind === "N" ? "beliebige Reihenfolge" : "in der Reihenfolge, wie getippt"}). Die Zählung weicht ab: NEAR/1 heisst in Embase direkt nebeneinander. Prüfe die Zahl.`,
        start: p.s,
        end: p.e,
      })
    } else if (p.kind === "ADJ") {
      findings.push({
        code: "prox-syntax",
        severity: "error",
        message: `${p.text} ist Ovid-Syntax. Embase schreibt NEAR/n (beliebige Reihenfolge) oder NEXT/n (in der Reihenfolge).`,
        start: p.s,
        end: p.e,
      })
    } else if (!p.slash && !p.spaced) {
      findings.push({
        code: "prox-distance",
        severity: "warning",
        message: `${p.text} ohne Abstand: Die Embase-Hilfe kennt nur ${p.kind}/n mit einer Zahl, zum Beispiel ${p.kind}/3. Schreib den Abstand.`,
        start: p.s,
        end: p.e,
      })
    } else if (p.n === 0) {
      findings.push({
        code: "prox-distance",
        severity: "warning",
        message: `${p.text}: Der Abstand beginnt bei 1. NEAR/1 und NEXT/1 heissen direkt nebeneinander.`,
        start: p.s,
        end: p.e,
      })
    }
  }
  for (const c of ctx.chains) {
    const parts = (c.chain ?? []).filter((x): x is Operand => x.kind === "operand")
    const last = parts[parts.length - 1]
    if (last && last.field && parts.slice(0, -1).every((x) => !x.field) && parts.length >= 2) {
      findings.push({
        code: "prox-field-scope",
        severity: "warning",
        message: `Der Feldcode :${last.field.raw} gilt nur für den letzten Begriff. Für die ganze Nähe-Suche setzt du sie in Klammern: (a NEAR/3 b):${last.field.raw}.`,
        start: c.s,
        end: c.e,
        fix: {
          label: "Nähe-Suche in Klammern setzen, Feldcode dahinter",
          edits: [
            { start: c.s, end: c.s, text: "(" },
            { start: last.field.s, end: last.field.s, text: ")" },
          ],
        },
      })
    }
  }

  // Brackets: limits.
  for (const b of ctx.limits) {
    const inner = b.text.trim()
    if (!b.suffix) {
      if (PM_TAGS.test(inner)) {
        findings.push({
          code: "pubmed-syntax",
          severity: "error",
          message: `[${inner}] ist PubMed-Syntax. In Embase steht der Feldcode hinter dem Begriff: 'low back pain':ti,ab,kw, ein Schlagwort schreibst du 'low back pain'/exp. Limits haben die Form [english]/lim.`,
          start: b.s,
          end: b.e,
        })
      } else if (/^mh\b/i.test(inner)) {
        findings.push({
          code: "cochrane-syntax",
          severity: "error",
          message: "[mh …] ist Cochrane-Syntax. In Embase schreibst du ein Schlagwort als 'low back pain'/exp.",
          start: b.s,
          end: b.e,
        })
      } else if (LIM.has(inner.toLowerCase())) {
        findings.push({
          code: "limit-suffix",
          severity: "error",
          message: `Dem Limit [${inner}] fehlt /lim: [${inner}]/lim.`,
          start: b.s,
          end: b.e,
          fix: { label: "/lim ergänzen", edits: [{ start: b.e, end: b.e, text: "/lim" }] },
        })
      } else if (/^\d{4}(-\d{4})?$/.test(inner)) {
        findings.push({
          code: "limit-suffix",
          severity: "error",
          message: `Dem Zeitraum [${inner}] fehlt /py: [${inner}]/py.`,
          start: b.s,
          end: b.e,
          fix: { label: "/py ergänzen", edits: [{ start: b.e, end: b.e, text: "/py" }] },
        })
      } else {
        findings.push({
          code: "bracket-unknown",
          severity: "error",
          message: `Eckige Klammern gibt es in Embase nur für Limits: [english]/lim oder [2016-2026]/py.`,
          start: b.s,
          end: b.e,
        })
      }
      continue
    }
    const sx = b.suffix.raw.toLowerCase()
    if (b.unclosed) {
      findings.push({ code: "bracket-unclosed", severity: "error", message: "Die eckige Klammer wird nie geschlossen.", start: b.s, end: b.e })
      continue
    }
    if (sx === "/lim") {
      const lower = inner.toLowerCase()
      if (/^\d{4}(-\d{0,4})?$/.test(inner)) {
        findings.push({
          code: "limit-wrong-suffix",
          severity: "error",
          message: `Jahre schreibst du mit /py, nicht /lim: [${inner}]/py.`,
          start: b.s,
          end: b.e,
          fix: { label: "/py verwenden", edits: [{ start: b.suffix.s, end: b.suffix.e, text: "/py" }] },
        })
      } else if (!LIM.has(lower)) {
        const near = closest(lower, EMBASE_LIM_VALUES, 3)
        findings.push({
          code: "limit-unknown",
          severity: "warning",
          message: `[${inner}]/lim steht nicht in der Liste der Embase-Limits (Elsevier, Stand Nov 2025).${near ? ` Meinst du [${near}]/lim?` : ""}`,
          start: b.s,
          end: b.e,
          fix: near ? { label: `[${near}]/lim verwenden`, edits: [{ start: b.s, end: b.e, text: `[${near}]` }] } : undefined,
        })
      } else if (inner !== lower) {
        findings.push({
          code: "limit-lowercase",
          severity: "info",
          message: `Die Limits der Embase-Liste sind klein geschrieben: [${lower}]/lim.`,
          start: b.s,
          end: b.e,
          fix: { label: "Klein schreiben", edits: [{ start: b.s + 1, end: b.e - 1, text: lower }] },
        })
      }
    } else if (sx === "/py") {
      const m = /^(\d{4})(?:-(\d{4})?)?$/.exec(inner)
      if (!m) {
        findings.push({
          code: "limit-year",
          severity: "error",
          message: `/py erwartet Jahre, zum Beispiel [2016-2026]/py. «${preview(inner)}» ist keine Jahreszahl.`,
          start: b.s,
          end: b.e,
        })
      } else if (inner.endsWith("-")) {
        findings.push({
          code: "limit-year-open",
          severity: "info",
          message: "Ein offener Zeitraum wie [2016-]/py ist in der Embase-Hilfe nicht belegt. Schreibe beide Jahre, zum Beispiel [2016-2026]/py.",
          start: b.s,
          end: b.e,
        })
      } else if (m[2] && Number(m[1]) > Number(m[2])) {
        findings.push({
          code: "date-order",
          severity: "warning",
          message: "Das Startjahr liegt nach dem Endjahr. Der Zeitraum ergibt keine Treffer.",
          start: b.s,
          end: b.e,
        })
      }
    } else if (HEADING_SUFFIXES.has(sx)) {
      findings.push({
        code: "suffix-wrong-place",
        severity: "error",
        message: `${b.suffix.raw} gehört hinter einen Emtree-Begriff in Anführungszeichen, nicht hinter eckige Klammern.`,
        start: b.s,
        end: b.suffix.e,
      })
    }
  }

  // Colon fields.
  for (const f of ctx.fieldToks.filter((x) => !x.prefix)) {
    if (f.trailingComma) {
      const at = ctx.toks.indexOf(f)
      const nx = ctx.toks[at + 1]
      const joined = !!nx && nx.t === "word" && /^[A-Za-z]+(?:,[A-Za-z]+)*$/.test(nx.text) && /^\s*$/.test(ctx.src.slice(f.e, nx.s))
      findings.push({
        code: "field-comma",
        severity: "error",
        message: "Mehrere Feldcodes stehen ohne Leerzeichen hintereinander: :ti,ab,kw. Hinter dem letzten Code steht kein Komma.",
        start: f.s,
        end: f.e,
        fix: joined
          ? { label: "Leerzeichen entfernen", edits: [{ start: f.e, end: nx.s, text: "" }] }
          : { label: "Komma entfernen", edits: [{ start: f.e - 1, end: f.e, text: "" }] },
      })
    }
    for (const code of f.codes) {
      if (FIELDS.has(code)) {
        if (code === "exp" || code === "de") {
          findings.push({
            code: "field-exp",
            severity: "error",
            message: `:${code} mit Doppelpunkt funktioniert nicht für Emtree-Begriffe (Elsevier). Schreibe 'begriff'/${code}.`,
            start: f.s,
            end: f.e,
            fix: f.codes.length === 1 ? { label: `/${code} verwenden`, edits: [{ start: f.s, end: f.e, text: `/${code}` }] } : undefined,
          })
        }
        continue
      }
      const alias = FIELD_ALIASES[code]
      const near = alias ?? closest(code, EMBASE_FIELD_CODES)
      findings.push({
        code: "field-unknown",
        severity: "error",
        message: `Der Feldcode :${code} ist in Embase nicht bekannt.${near ? ` Meinst du :${near}?` : ""} Übliche Codes: :ti (Titel), :ab (Abstract), :kw (Autoren-Schlüsselwörter), :py (Jahr), :la (Sprache).`,
        start: f.s,
        end: f.e,
        fix: near && f.codes.length === 1 ? { label: `:${near} verwenden`, edits: [{ start: f.s, end: f.e, text: `:${near}` }] } : undefined,
      })
    }
  }

  // Suffixes.
  for (const { tok, operand } of ctx.suffixToks) {
    const sx = tok.raw.toLowerCase()
    if (operand && "sub" in operand && operand.sub === "limit") continue
    if (!ALL_SUFFIXES.has(sx)) {
      const near = closest(sx.slice(1), ["exp", "de", "mj", "br", "lim", "py"], 2)
      findings.push({
        code: "suffix-unknown",
        severity: "error",
        message: `${tok.raw} kennt Embase nicht.${near ? ` Meinst du /${near}?` : ""} Für Emtree-Begriffe gelten /exp (mit Unterbegriffen), /de (nur der Begriff) und /mj (Hauptthema).`,
        start: tok.s,
        end: tok.e,
        fix: near ? { label: `/${near} verwenden`, edits: [{ start: tok.s, end: tok.e, text: `/${near}` }] } : undefined,
      })
    } else if ((sx === "/lim" || sx === "/py") && operand && "sub" in operand && operand.sub !== "limit") {
      findings.push({
        code: "suffix-wrong-place",
        severity: "error",
        message: `${tok.raw} gehört hinter eine eckige Klammer: [english]/lim oder [2016-2026]/py.`,
        start: tok.s,
        end: tok.e,
      })
    }
  }

  // Terms.
  const untagged: Operand[] = []
  const quotedStar: Operand[] = []
  for (const o of ctx.terms) {
    if (o.unclosed || !o.text) continue
    if (isHeadingOperand(o) && o.field && !o.field.prefix) {
      findings.push({
        code: "suffix-and-field",
        severity: "error",
        message: `Ein Emtree-Begriff mit ${o.suffix!.raw} bekommt keinen Feldcode. Er sucht im Thesaurus, nicht im Text. Für den Text schreibst du eine zweite Suche: 'begriff':ti,ab,kw.`,
        start: o.field.s,
        end: o.field.e,
        fix: { label: "Feldcode entfernen", edits: [{ start: o.field.s, end: o.field.e, text: "" }] },
      })
    }
    if (isHeadingOperand(o)) {
      if (/[*?$]/.test(o.text)) {
        findings.push({
          code: "trunc-mesh",
          severity: "warning",
          message: "Ein Platzhalter in einem Emtree-Begriff mit /exp oder /de wird nicht ausgewertet wie bei Stichworten. Suche das Wort als Stichwort mit :ti,ab,kw.",
          start: o.textS,
          end: o.textE,
        })
      }
      continue
    }
    if (o.suffix) continue
    if (/^[\d/\-:.]+$/.test(o.text)) continue

    for (const w of wordsOf(o.text)) {
      if (/^[*?]/.test(w)) {
        findings.push({
          code: "trunc-leading",
          severity: "error",
          message: `«${preview(w)}»: In Embase sind Platzhalter am Wortanfang nicht erlaubt (Elsevier: «Leading wildcards are not allowed»).`,
          start: o.textS,
          end: o.textE,
        })
      } else if (w.includes("*") && stemOf(w) < 3) {
        findings.push({
          code: "trunc-short-stem",
          severity: "warning",
          message: `«${preview(w)}»: Vor dem * braucht Embase mindestens drei Zeichen (Elsevier: «type at least three characters before truncating with *»).`,
          start: o.textS,
          end: o.textE,
        })
      }
      if (w.includes("#")) {
        const at = ctx.src.indexOf(w, o.textS)
        findings.push({
          code: "wildcard-hash",
          severity: "error",
          message: `«${preview(w)}»: # ist ein Platzhalter von EBSCOhost (CINAHL). Embase schreibt $ für kein oder ein Zeichen und ? für genau ein Zeichen.`,
          start: o.textS,
          end: o.textE,
          fix: at >= 0 ? { label: "# durch $ ersetzen", edits: [{ start: at, end: at + w.length, text: w.replace(/#/g, "$") }] } : undefined,
        })
      }
    }
    if (o.quoted && /[*?$]/.test(o.text) && o.words > 1) quotedStar.push(o)

    if (o.words === 1 && !o.inProx) {
      const level = genericLevel(o.text)
      if (level) {
        findings.push({
          code: "generic-term",
          severity: level,
          message:
            level === "warning"
              ? `«${o.text.replace(/\*/g, "")}» ist sehr allgemein und trifft fast jede Studie. Formuliere die Komponente genauer, zum Beispiel mit einer Phrase wie 'exercise therapy'.`
              : `«${o.text.replace(/\*/g, "")}» ist als Stichwort breit. Meist ist ein Limit oder ein Schlagwort dafür besser geeignet.`,
          start: o.textS,
          end: o.textE,
        })
      }
    }
    if (o.eff === null && o.tok) untagged.push(o)
  }

  if (quotedStar.length) {
    const edits = quotedStar
      .filter((o) => {
        const w = o.text.replace(/-/g, " ").split(/\s+/)
        return w.every((x) => NEXT_SAFE.test(x)) && o.tok
      })
      .map((o) => ({ start: o.tok!.s, end: o.tok!.e, text: `(${o.text.replace(/-/g, " ").split(/\s+/).join(" NEXT/1 ")})` }))
    findings.push({
      code: "trunc-in-phrase",
      severity: "info",
      message: `Platzhalter innerhalb von Anführungszeichen (${quotedStar
        .slice(0, 3)
        .map((o) => `«${preview(o.text, 22)}»`)
        .join(", ")}${quotedStar.length > 3 ? ", …" : ""}). Die aktuelle Embase-Hilfe erlaubt das, ältere Anleitungen nicht. Sicher in beiden Fällen ist NEXT/1: (back NEXT/1 exercise*).`,
      start: quotedStar[0].textS,
      end: quotedStar[0].textE,
      more: quotedStar.slice(1).map((o) => ({ start: o.textS, end: o.textE })),
      fix: edits.length ? { label: "Als NEXT/1-Kette schreiben", edits } : undefined,
    })
  }

  if (untagged.length) {
    const edits = untagged
      .filter((o) => o.tok && !(o.tok.t === "word" && /[\s]/.test(o.text)))
      .map((o) => ({ start: o.e, end: o.e, text: ":ti,ab,kw" }))
    findings.push({
      code: "no-field-code",
      severity: "info",
      message: `${untagged.length === 1 ? "Ein Begriff hat" : `${untagged.length} Begriffe haben`} keinen Feldcode. Dann sucht Embase breit, je nach Einstellung auch mit Zuordnung zu Emtree-Begriffen. Für Stichworte schreibst du :ti,ab,kw hinter den Begriff.`,
      start: untagged[0].s,
      end: untagged[0].e,
      more: untagged.slice(1).map(toRange),
      fix: edits.length ? { label: ":ti,ab,kw an alle Begriffe hängen", edits } : undefined,
    })
  }
}

function lintEmbaseLine(content: string, lineNo: number, defined: Set<number>, used: Set<number>): LintFinding[] {
  const ctx = newCtx(content, "embase", lineNo, defined, used)
  runCommon(ctx, OPTIONS)
  embaseChecks(ctx, content)
  return ctx.findings
}

/** Lints an Embase string (one line) or a strategy (one search per line, optionally numbered #1, #2 ...). */
export function lintEmbase(src: string): LintFinding[] {
  return lintStrategy(src, "#", lintEmbaseLine)
}

/** Signals of Embase or Ovid syntax in a string: Emtree suffixes, limits, Ovid fields. For the auto-detection. */
export function embaseSignals(src: string): number {
  let n = 0
  n += (src.match(/[\p{L}\p{N}'"’”)]\/(?:exp|de|mj|br)(?![\p{L}\p{N}])/giu) ?? []).length
  n += (src.match(/\]\/(?:lim|py|sd)\b/gi) ?? []).length
  n += (src.match(/'[^']+'\s*:(?:ti|ab|kw)/gi) ?? []).length
  n += (src.match(OVID_RE) ?? []).length
  n += (src.match(/\badj\d+\b/gi) ?? []).length
  n += (src.match(/(?:^|[\s(])exp\s+[^()'"]*\/(?=\s|\)|$)/gim) ?? []).length
  return n
}
