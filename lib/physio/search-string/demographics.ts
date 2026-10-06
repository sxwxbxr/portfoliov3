/**
 * Age and sex from a patient case ("Herr Müller, 45 Jahre") as optional filter
 * suggestions. The engine only suggests; the filters stay off until the user
 * switches them on, because every age or sex filter drops studies that do not
 * report these fields.
 */
import type { FilterSuggestion } from "./types"

/** MeSH age group for an age in years (see the MeSH Age Groups). */
export function ageGroupFor(age: number): string | null {
  if (!Number.isFinite(age) || age < 0 || age > 120) return null
  if (age < 2) return "Infant"
  if (age < 6) return "Child, Preschool"
  if (age < 13) return "Child"
  if (age < 19) return "Adolescent"
  if (age < 45) return "Adult"
  if (age < 65) return "Middle Aged"
  if (age < 80) return "Aged"
  return "Aged, 80 and over"
}

/** Words before a number that make it a duration ("seit 2 Jahren"), not an age. */
const DURATION_BEFORE = /(?:\b(?:seit|vor|nach|innerhalb|w(?:ä|ae)hrend|(?:ü|ue)ber|etwa|ca|letzten|vergangenen|f(?:ü|ue)r|in\s+den|for|over|past|last|since|within|after|ago)\b[\s.]*(?:\S+\s+){0,2})$/i

interface Found {
  group: string
  evidence: string
}

function ages(text: string): Found[] {
  const found: Found[] = []
  const push = (raw: string, evidence: string) => {
    const group = ageGroupFor(Number.parseInt(raw, 10))
    if (group) found.push({ group, evidence: evidence.trim() })
  }
  const patterns: Array<{ re: RegExp; checkDuration: boolean }> = [
    { re: /(\d{1,3})\s*[- ]?\s*(?:j(?:ä|ae)hrig\w*|jahre?\s+alt|years?[- ]old|y\/o)/gi, checkDuration: false },
    { re: /(?:\balter\s*(?:von|:)?\s*|\baged?\s*[:=]?\s*)(\d{1,3})\b/gi, checkDuration: false },
    { re: /(\d{1,3})\s*(?:jahre|jahren|jahr|j\.)(?![\wäöü])/gi, checkDuration: true },
  ]
  for (const { re, checkDuration } of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      if (checkDuration && DURATION_BEFORE.test(text.slice(Math.max(0, m.index - 40), m.index))) continue
      push(m[1], m[0])
    }
  }
  return found
}

const AGE_WORDS: Array<{ re: RegExp; group: string }> = [
  { re: /\bmittleren?\s+alters?\b|\bmiddle[- ]aged\b/i, group: "Middle Aged" },
  { re: /\bjugendliche[rnm]?\b|\badolescents?\b|\bteenagers?\b/i, group: "Adolescent" },
  { re: /\bjunge[rn]?\s+erwachsene[rn]?\b|\byoung\s+adults?\b/i, group: "Young Adult" },
  { re: /\bs(?:ä|ae)uglinge?\b|\binfants?\b/i, group: "Infant" },
  { re: /\bkleinkind(?:er)?\b|\bpreschool\b/i, group: "Child, Preschool" },
  { re: /\bneugeborene[rn]?\b|\bnewborns?\b/i, group: "Infant, Newborn" },
  { re: /\bhochbetagte[rn]?\b|\boldest[- ]old\b/i, group: "Aged, 80 and over" },
  { re: /(?<!\b(?:older|elderly|young|(?:ä|ae)ltere[rn]?|junge[rn]?)\s)\b(?:erwachsene[rn]?|adults?)\b/i, group: "Adult" },
]

const MALE = /\b(herr|herrn|mann|m(?:ä|ae)nner|m(?:ä|ae)nnlich\w*|male|males|man|men|boy|boys)\b/i
/** "Junge" is also an adjective ("junge Erwachsene"): only the capitalised noun counts. */
const BOY = /\bJungen?\b(?!\s+(?:Erwachsene|Frauen|M(?:ä|ae)nner|Menschen|Patienten|Leute))/
const FEMALE = /\b(frau|frauen|weiblich\w*|patientin|patientinnen|m(?:ä|ae)dchen|female|females|woman|women|girl|girls)\b/i

export function extractDemographics(text: string): FilterSuggestion[] {
  const out: FilterSuggestion[] = []
  const seen = new Set<string>()
  const add = (kind: "age" | "sex", value: string, evidence: string) => {
    const id = `${kind}:${value}`
    if (seen.has(id)) return
    seen.add(id)
    out.push({ id, kind, value, evidence })
  }

  for (const f of ages(text)) add("age", f.group, f.evidence)
  for (const { re, group } of AGE_WORDS) {
    const m = re.exec(text)
    if (!m) continue
    // "junge Erwachsene" must not also read as "Erwachsene".
    if (group === "Adult" && seen.has("age:Young Adult")) continue
    add("age", group, m[0])
  }

  const male = MALE.exec(text) ?? BOY.exec(text)
  const female = FEMALE.exec(text)
  if (male && !female) add("sex", "Male", male[0])
  if (female && !male) add("sex", "Female", female[0])
  return out
}
