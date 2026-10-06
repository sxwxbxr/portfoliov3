/**
 * "Eigenen String prüfen" for CINAHL on EBSCOhost (CINAHL Complete / Ultimate).
 *
 * Rules (sources in CINAHL_SOURCES, profiles.ts; [EBSCO] = EBSCO handout, [guide] = university guide quoting EBSCO):
 *  - Field codes stand in front of the term or group, in capitals: TI "back pain", AB (a OR b). TX = all text incl. full text.
 *  - Headings: (MH "Low Back Pain") exact, (MH "Low Back Pain+") exploded with the + INSIDE the quotes, (MM ...) major.
 *  - Phrases in double quotes; * ? # also work inside the quotes [guide: UConn]. ? replaces exactly one character
 *    and cannot end a word, # zero or one character [EBSCO handout, guide].
 *  - Proximity N5 / W5, no slash, no NEAR/ADJ [EBSCO handout].
 *  - Boolean operators in capitals. AND is evaluated before OR; EBSCO advises never to mix them without parentheses [EBSCO handout].
 *  - Lines: S1, S2 ...; combinations like S1 OR S2 [guide].
 *
 * Not checked because not verifiable: language, year, publication type and age syntax in the search box
 * (the generator writes them as limiter notes), and a documented minimum word root before *.
 * Subject headings cannot be checked against CINAHL Headings (licensed): the linter checks the syntax only.
 */
import { genericLevel } from "./lint-shared"
import {
  lintStrategy,
  newCtx,
  preview,
  runCommon,
  toRange,
  type Ctx,
  type CommonOptions,
  type Operand,
} from "./lint-platform"
import type { LintFinding } from "./types"

export const CINAHL_FIELD_CODES = ["ti", "ab", "tx", "su", "mh", "mm", "au", "af", "so", "pt", "la", "py", "dt", "em", "an"] as const
const KNOWN = new Set<string>(CINAHL_FIELD_CODES)

/** What people bring over from PubMed, Ovid or Embase. */
const ALIASES: Record<string, string> = {
  tw: "TX",
  mp: "TX",
  kw: "SU",
  de: "SU",
  sh: "MH",
  tiab: "TI",
}

const OPTIONS: CommonOptions = {
  platformLabel: "CINAHL",
  mixedMessage:
    "AND und OR stehen ohne Klammern auf derselben Ebene. EBSCOhost wertet AND vor OR aus: «A OR B AND C» heisst «A OR (B AND C)». Die EBSCO-Hilfe rät, Operatoren nie ohne Klammern zu mischen. Setze jede OR-Gruppe in eine Klammer.",
  unquotedMessage:
    "In CINAHL gehört eine Phrase in Anführungszeichen. Ohne sie behandelt EBSCOhost die Wörter je nach Suchmodus unterschiedlich, zum Beispiel als einzelne Begriffe mit AND.",
  lowerOpSeverity: "warning",
  lowerOpMessage:
    "Schreibe Operatoren gross (AND, OR, NOT). EBSCOhost zeigt sie in der Suchhistorie gross, und nur so sind sie in jedem Fall eindeutig als Operator erkennbar.",
  handleStray(s, ctx) {
    if (s.text === "+" && s.afterQuote) {
      ctx.findings.push({
        code: "heading-plus-outside",
        severity: "error",
        message: 'Das + gehört in CINAHL in die Anführungszeichen: (MH "Low Back Pain+"), nicht dahinter.',
        start: s.s,
        end: s.e,
        fix: {
          label: "+ in die Anführungszeichen verschieben",
          edits: [
            { start: s.s - 1, end: s.s - 1, text: "+" },
            { start: s.s, end: s.e, text: "" },
          ],
        },
      })
      return true
    }
    return false
  },
}

const isHeading = (o: Operand) => !!o.eff && (o.eff.includes("mh") || o.eff.includes("mm"))
const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean)
const stemOf = (w: string) => w.slice(0, w.indexOf("*")).replace(/[^\p{L}\p{N}]/gu, "").length

function cinahlChecks(ctx: Ctx) {
  const { findings } = ctx

  // Syntax of other platforms.
  const pm = ctx.foreignBrackets.filter((b) => !/^\s*mh\b/i.test(b.inner))
  const cochraneMh = ctx.foreignBrackets.filter((b) => /^\s*mh\b/i.test(b.inner))
  if (pm.length) {
    findings.push({
      code: "pubmed-syntax",
      severity: "error",
      message: `${pm.length === 1 ? "Das Field Tag" : "Field Tags"} ${pm
        .slice(0, 3)
        .map((b) => `[${b.inner}]`)
        .join(" ")}${pm.length > 3 ? " …" : ""} ${pm.length === 1 ? "ist" : "sind"} PubMed-Syntax. In CINAHL stehen Feldcodes vor dem Begriff: TI (…) OR AB (…) für Stichworte, (MH "…+") für Schlagwörter.`,
      start: pm[0].s,
      end: pm[0].e,
      more: pm.slice(1).map(toRange),
    })
  }
  if (cochraneMh.length) {
    findings.push({
      code: "cochrane-syntax",
      severity: "error",
      message: `[mh …] ist Cochrane-Syntax. In CINAHL schreibst du ein Schlagwort als (MH "Low Back Pain+").`,
      start: cochraneMh[0].s,
      end: cochraneMh[0].e,
      more: cochraneMh.slice(1).map(toRange),
    })
  }
  const colon = ctx.fieldToks.filter((f) => !f.prefix)
  if (colon.length) {
    findings.push({
      code: "colon-field",
      severity: "error",
      message: `Der Feldcode :${colon[0].raw} hinter dem Begriff ist Cochrane- oder Embase-Syntax. In CINAHL steht der Code davor: TI "low back pain" OR AB "low back pain".`,
      start: colon[0].s,
      end: colon[0].e,
      more: colon.slice(1).map(toRange),
    })
  }
  if (ctx.suffixToks.length) {
    const sx = ctx.suffixToks.map((x) => x.tok)
    findings.push({
      code: "heading-suffix",
      severity: "error",
      message: `${sx[0].raw} ist Embase-Syntax (Emtree). In CINAHL schreibst du ein Schlagwort als (MH "…") oder (MH "…+") für Unterbegriffe.`,
      start: sx[0].s,
      end: sx[0].e,
      more: sx.slice(1).map(toRange),
    })
  }
  const sq = ctx.singleQuoted.filter((q) => q.closed)
  if (sq.length) {
    findings.push({
      code: "quotes-single",
      severity: "error",
      message: "EBSCOhost kennt für Phrasen nur doppelte Anführungszeichen. Einfache gehören zu Embase.",
      start: sq[0].s,
      end: sq[0].s + 1,
      more: sq.slice(1).map((q) => ({ start: q.s, end: q.s + 1 })),
      fix: {
        label: 'Einfache durch doppelte Anführungszeichen ersetzen',
        edits: sq.flatMap((q) => [
          { start: q.s, end: q.s + 1, text: '"' },
          { start: q.e - 1, end: q.e, text: '"' },
        ]),
      },
    })
  }
  const hashRefs = ctx.refs.filter((o) => o.refStyle === "#")
  if (hashRefs.length) {
    findings.push({
      code: "ref-style",
      severity: "error",
      message: "In CINAHL heissen die Suchzeilen S1, S2 …, nicht #1, #2. Das # gehört zu Embase und zur Cochrane Library.",
      start: hashRefs[0].s,
      end: hashRefs[0].e,
      more: hashRefs.slice(1).map(toRange),
      fix: { label: "# durch S ersetzen", edits: hashRefs.map((o) => ({ start: o.s, end: o.s + 1, text: "S" })) },
    })
  }
  const proxWrong = ctx.prox.filter((p) => p.kind === "NEAR" || p.kind === "NEXT" || p.kind === "ADJ")
  if (proxWrong.length) {
    const p = proxWrong[0]
    findings.push({
      code: "prox-syntax",
      severity: "error",
      message: `${p.text} gibt es in CINAHL nicht. EBSCOhost schreibt N5 (beliebige Reihenfolge) und W5 (in der Reihenfolge, wie getippt), ohne Schrägstrich. Die Zählung weicht von Embase und Ovid ab, prüfe die Zahl.`,
      start: p.s,
      end: p.e,
      more: proxWrong.slice(1).map(toRange),
    })
  }
  for (const p of ctx.prox) {
    if ((p.kind === "N" || p.kind === "W") && p.n !== null && p.n > 255) {
      findings.push({
        code: "prox-distance",
        severity: "error",
        message: `${p.text}: EBSCOhost erlaubt Abstände bis 255 Wörter.`,
        start: p.s,
        end: p.e,
      })
    }
  }

  // Field codes.
  for (const f of ctx.fieldToks.filter((x) => x.prefix)) {
    const code = f.raw
    const lower = code.toLowerCase()
    if (!KNOWN.has(lower)) {
      const suggestion = ALIASES[lower] ?? null
      findings.push({
        code: "field-unknown",
        severity: "error",
        message: `Der Feldcode ${code} ist in CINAHL nicht bekannt.${suggestion ? ` Meinst du ${suggestion}?` : ""} Übliche Codes: TI (Titel), AB (Abstract), MH (Schlagwort), TX (ganzer Text).`,
        start: f.s,
        end: f.e,
        fix: suggestion ? { label: `${suggestion} verwenden`, edits: [{ start: f.s, end: f.e, text: suggestion }] } : undefined,
      })
    } else if (code !== code.toUpperCase()) {
      findings.push({
        code: "field-lowercase",
        severity: "warning",
        message: `Schreibe den Feldcode ${code} gross (${code.toUpperCase()}). EBSCO empfiehlt Grossbuchstaben bei Feldcodes in der Suchzeile.`,
        start: f.s,
        end: f.e,
        fix: { label: "Feldcode gross schreiben", edits: [{ start: f.s, end: f.e, text: code.toUpperCase() }] },
      })
    }
  }
  const tx = ctx.fieldToks.filter((f) => f.prefix && f.raw.toLowerCase() === "tx")
  if (tx.length) {
    findings.push({
      code: "field-tx",
      severity: "info",
      message: "TX durchsucht den ganzen Text, bei CINAHL Complete auch den Volltext. Das ist sehr breit. Für Stichworte reichen TI und AB.",
      start: tx[0].s,
      end: tx[0].e,
      more: tx.slice(1).map(toRange),
    })
  }

  // Terms.
  const noExplode: Operand[] = []
  const untagged: Operand[] = []
  for (const o of ctx.terms) {
    if (o.unclosed || !o.text) continue
    if (isHeading(o)) {
      if (o.text.includes("*")) {
        findings.push({
          code: "trunc-mesh",
          severity: "error",
          message: "Ein Stern gehört nicht in ein Schlagwort. Das Schlagwort wird exakt gesucht, Unterbegriffe schliesst das + ein.",
          start: o.textS,
          end: o.textE,
        })
      }
      if (o.eff!.includes("mh") && !o.text.endsWith("+")) noExplode.push(o)
      continue
    }
    if (/^[\d/\-:.]+$/.test(o.text)) continue

    for (const w of wordsOf(o.text)) {
      if (w.includes("$")) {
        const at = ctx.src.indexOf(w, o.textS)
        findings.push({
          code: "wildcard-dollar",
          severity: "error",
          message: `«${preview(w)}»: $ ist ein Embase-Platzhalter. In CINAHL steht # für kein oder ein Zeichen (colo#r) und ? für genau ein Zeichen.`,
          start: o.textS,
          end: o.textE,
          fix: at >= 0 ? { label: "$ durch # ersetzen", edits: [{ start: at, end: at + w.length, text: w.replace(/\$/g, "#") }] } : undefined,
        })
      }
      if (w.endsWith("?") && !w.endsWith("*?")) {
        findings.push({
          code: "wildcard-question-end",
          severity: "warning",
          message: `«${preview(w)}»: In EBSCOhost ersetzt ? genau ein Zeichen und darf nicht am Wortende stehen. Für beliebige Endungen nimm *.`,
          start: o.textS,
          end: o.textE,
        })
      }
      if (w.includes("*") && stemOf(w) < 3) {
        findings.push({
          code: "trunc-short-stem",
          severity: "info",
          message: `«${preview(w)}»: Vor dem * stehen weniger als drei Zeichen. EBSCO nennt kein Minimum, aber so kurze Wortanfänge treffen viel zu viel. Das Tool schreibt den Stern erst ab drei Zeichen.`,
          start: o.textS,
          end: o.textE,
        })
      }
    }

    if (o.words === 1 && !o.inProx && !o.text.includes("$")) {
      const level = genericLevel(o.text)
      if (level) {
        findings.push({
          code: "generic-term",
          severity: level,
          message:
            level === "warning"
              ? `«${o.text.replace(/\*/g, "")}» ist sehr allgemein und trifft fast jede Studie. Formuliere die Komponente genauer, zum Beispiel mit einer Phrase wie "exercise therapy".`
              : `«${o.text.replace(/\*/g, "")}» ist als Stichwort breit. Meist ist ein Filter oder ein Schlagwort dafür besser geeignet.`,
          start: o.textS,
          end: o.textE,
        })
      }
    }
    if (o.eff === null && o.tok) untagged.push(o)
  }

  if (noExplode.length) {
    findings.push({
      code: "heading-no-explode",
      severity: "info",
      message: `${noExplode.length === 1 ? "Ein Schlagwort steht" : `${noExplode.length} Schlagwörter stehen`} ohne +. Dann sucht CINAHL nur genau diesen Begriff, Unterbegriffe fehlen. Das + (zum Beispiel "Low Back Pain+") schliesst sie ein.`,
      start: noExplode[0].textS,
      end: noExplode[0].textE,
      more: noExplode.slice(1).map((o) => ({ start: o.textS, end: o.textE })),
      fix: {
        label: "+ an alle Schlagwörter setzen",
        edits: noExplode.filter((o) => o.quoted).map((o) => ({ start: o.textE - 1, end: o.textE - 1, text: "+" })),
      },
    })
  }

  if (untagged.length) {
    findings.push({
      code: "no-field-code",
      severity: "info",
      message: `${untagged.length === 1 ? "Ein Begriff hat" : `${untagged.length} Begriffe haben`} keinen Feldcode. Dann sucht EBSCOhost im ganzen Text (TX), bei CINAHL Complete auch im Volltext. Für Stichworte setze TI (…) OR AB (…).`,
      start: untagged[0].s,
      end: untagged[0].e,
      more: untagged.slice(1).map(toRange),
    })
  }
}

function lintCinahlLine(content: string, lineNo: number, defined: Set<number>, used: Set<number>): LintFinding[] {
  const ctx = newCtx(content, "cinahl", lineNo, defined, used)
  runCommon(ctx, OPTIONS)
  cinahlChecks(ctx)
  return ctx.findings
}

/** Lints a CINAHL string (one line) or a strategy (one search per line, optionally numbered S1, S2 ...). */
export function lintCinahl(src: string): LintFinding[] {
  return lintStrategy(src, "S", lintCinahlLine)
}
