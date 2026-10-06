/**
 * Text normalisation for German and English research questions.
 *
 * Goal: "Rückenschmerzen", "Rueckenschmerzen", "rückenschmerz" and
 * "Rückenschmerzen." land on the same key, so one terminology alias matches all
 * of them. The stemmer is deliberately crude: it only has to be consistent
 * between alias and input, not linguistically correct.
 */

const TYPOGRAPHIC_APOSTROPHES = /[’‘'`´]/g

/** Lowercase, transliterate umlauts and ß, drop other diacritics, keep letters, digits, spaces. */
export function normalizeText(input: string): string {
  return transliterate(input.toLowerCase().replace(TYPOGRAPHIC_APOSTROPHES, ""))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

function transliterate(s: string): string {
  return s
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export interface Token {
  /** As typed. */
  orig: string
  /** Lowercase, umlauts kept. Used when a word is shown back to the user. */
  raw: string
  /** Transliterated lowercase. */
  norm: string
  /** Crude stem of `norm`. */
  stem: string
}

/** Splits into words. Hyphens and slashes separate words ("LWS-Bereich" gives "LWS", "Bereich"). */
export function tokenize(input: string): Token[] {
  const cleaned = input.replace(TYPOGRAPHIC_APOSTROPHES, "")
  const tokens: Token[] = []
  for (const orig of cleaned.split(/[^\p{L}\p{N}]+/u)) {
    if (!orig) continue
    const raw = orig.toLowerCase()
    const norm = transliterate(raw)
    tokens.push({ orig, raw, norm, stem: stemToken(norm) })
  }
  return tokens
}

const SUFFIXES = ["innen", "ungen", "en", "er", "es", "e", "n", "s"]

/** Strips one plural or inflection ending, keeping at least four letters. */
export function stemToken(norm: string): string {
  if (norm.length <= 4 || /\d/.test(norm)) return norm
  if (norm.endsWith("ies")) return norm.slice(0, -3) + "y"
  for (const suffix of SUFFIXES) {
    if (norm.endsWith(suffix) && norm.length - suffix.length >= 4) {
      // "ss" and "us"/"is" endings are not plurals ("stress", "status", "arthritis").
      if (suffix === "s" && /(ss|us|is)$/.test(norm)) return norm
      return norm.slice(0, -suffix.length)
    }
  }
  return norm
}

/** Matching key of a phrase: stems joined by one space. */
export function phraseKey(phrase: string): string {
  return tokenize(phrase)
    .map((t) => t.stem)
    .join(" ")
}

const STOPWORDS_DE = `
der die das den dem des ein eine einen einem einer eines und oder aber ist sind war waren wird werden wurde wurden
hat haben hatte hatten kann koennen soll sollen im in am an auf aus bei mit nach von vom zu zum zur ueber unter vor
fuer gegen ohne durch um als wie was wer wo wann welche welcher welches welchen wirkt wirken wirkung wirkungen effekt
effekte einfluss auswirkung auswirkungen ob sich nicht kein keine keinen auch nur noch schon sehr mehr weniger dass da
dann wenn dieser diese dieses diesen es er sie wir ihr ich du man zwischen waehrend bis seit nun etwa ca bzw
herr frau mann patient patienten patientin patientinnen person personen menschen klient klientin
jahr jahre jahren jaehrig alt alter mittleres mittlere mittleren
studie studien untersuchung frage fragestellung thema hilft helfen bringt gibt
verbessert verbessern verringert verringern reduziert reduzieren senkt senken erhoeht erhoehen
nur kurz kurze kurzem mehrere einige viele lange langem langen sowie damit dabei davon dazu dafuer
sein seine seinen ihm ihn ihre ihren wegen worden werden wuerde moechte will soll empfohlen empfiehlt
freund freundin gut besser beste bestes wirksam wirksamer sinnvoll sinnvoller
bereich bereichs vorderem vorderen vorderer vorderes
`

const STOPWORDS_EN = `
the a an and or of in on for to with without versus vs compared than from by at as is are was were be been does do
effect effects effective effectiveness impact influence patients patient people person study studies trial trials improve
improving reduce reducing what which how whether that this these those between during after before among into over
under about more less comparing compare adults adult males male females female
`

export const STOPWORDS: ReadonlySet<string> = new Set(
  `${STOPWORDS_DE} ${STOPWORDS_EN}`
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => normalizeText(w)),
)

export function isStopword(norm: string): boolean {
  return STOPWORDS.has(norm)
}
