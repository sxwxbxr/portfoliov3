/**
 * Which syntax does a pasted string use? PubMed, Cochrane Library, CINAHL (EBSCOhost) or Embase (embase.com).
 *
 * The signals are the field syntax each platform uses alone:
 *  - CINAHL: (MH "…"), (MM "…"), field codes in capitals in front of a term or group (TI "x", AB (…)), S1 references.
 *  - Embase: 'term'/exp, /de, /mj, [english]/lim, [2016-2026]/py, 'phrase':ti,ab,kw, and Ovid forms (.ti,ab., adj3, exp x/).
 *  - Cochrane: [mh …], :ti,ab,kw behind double quotes, #n lines, NEAR/NEXT.
 *  - PubMed: [tiab], [Mesh] and the other square-bracket tags.
 * A string with no signal counts as PubMed (the default); a mix goes to the side with more signals, and the
 * existing PubMed/Cochrane decision stays untouched when no CINAHL or Embase signal outweighs it.
 */
import { detectLintDatabase as detectPubmedOrCochrane } from "./lint-cochrane"
import { embaseSignals } from "./lint-embase"

export type DetectedDatabase = "pubmed" | "cochrane" | "cinahl" | "embase"

/** Signals of CINAHL syntax. Case sensitive: the field codes of EBSCO are written in capitals. */
export function cinahlSignals(src: string): number {
  let n = 0
  n += (src.match(/\(\s*(?:MH|MM)\s+["“”„]/gi) ?? []).length
  n += (src.match(/(?:^|[\s(])(?:TI|AB|TX|SU|AU|SO)\s+[("“”„]/gm) ?? []).length
  n += (src.match(/(?:^|[\s(])S\d+(?=$|[\s)])/gm) ?? []).length
  n += (src.match(/["”“)\w*]\s+[NW]\d+\s+["“”„(\w]/g) ?? []).length
  return n
}

const MH_BRACKET = /\[\s*mh\s*[\s^"“”„«»‟/]/gi
const PM_TAG = /\[\s*(?:tiab|ti|ab|tw|mesh(?::noexp)?|majr|mh:noexp|pt|dp|la|sb|au|ta)\s*(?::[^\]]*)?\]/gi

export function detectLintDatabase(src: string): DetectedDatabase {
  const base = detectPubmedOrCochrane(src)
  const c = cinahlSignals(src)
  const e = embaseSignals(src)
  if (c === 0 && e === 0) return base
  const other = (src.match(MH_BRACKET) ?? []).length + (src.match(PM_TAG) ?? []).length
  if (c > other && c >= e) return "cinahl"
  if (e > other && e > c) return "embase"
  return base
}
