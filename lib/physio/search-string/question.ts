/**
 * Does the input look like a case description instead of a research question?
 *
 * The tool takes a question (ideally PICO-shaped) and gets the most reliable
 * string out of it. A pasted case still works, because the pipeline cleans
 * task-sheet lines and reads demographics, but the result is less reliable. This
 * is a pure heuristic for a friendly notice; it never blocks anything.
 */

/** "Herr Müller", "Frau Meier", "Patient", "Patientin". */
const PATIENT = /\b(?:Herr|Frau|Hr\.|Fr\.)\s+[A-ZÄÖÜ][\p{L}-]+|\b[Pp]atient(?:in)?\b/u
/** "45 Jahre", "45 Jahre alt", "45-jährig", "45 years old". Durations like "seit 2 Jahren" do not match. */
const AGE = /\b\d{1,3}[\s-]*(?:j(?:ä|ae)hrig\w*|jahre(?![\p{L}])(?:\s+alt)?|years?[\s-]old|y\/o)/iu
const ANAMNESE = /\b(?:anamnese|befund|fallbeschreibung|ausgangslage|diagnose\s*:)/i
/** Task-sheet lines: "Formulieren Sie …", "Aufgabe 2:", "Übung 3". */
const TASK_LINE = /^\W*(?:\d+[.)]\s*)?(?:\p{L}+(?:en|ieren)\s+sie\b|aufgabe\b|(?:ü|ue)bung\s*\d)/imu
const QUESTION_START =
  /^\W*(?:wie|welche[rnms]?|was|wann|warum|wieso|weshalb|wodurch|inwiefern|ist|sind|hat|haben|kann|k(?:ö|oe)nnen|wirkt|wirken|reduziert|verbessert|senkt|erh(?:ö|oe)ht|unterscheidet|hilft|bringt|lohnt|does|do|is|are|can|what|which|how|in\s+(?:patients|adults|people|children|women|men|older)|among|for)\b/iu

export interface CaseSignals {
  /** Names of the patient markers found ("herr", "alter", "anamnese", "aufgabe"). */
  markers: string[]
  chars: number
  sentences: number
  /** A question mark, or an interrogative opening. */
  question: boolean
}

export function caseSignals(text: string): CaseSignals {
  const t = text.replace(/\r\n?/g, "\n").trim()
  const markers: string[] = []
  if (PATIENT.test(t)) markers.push("patient")
  if (AGE.test(t)) markers.push("age")
  if (ANAMNESE.test(t)) markers.push("anamnese")
  if (TASK_LINE.test(t)) markers.push("task")
  const sentences = t.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim().length > 2).length
  return { markers, chars: t.length, sentences, question: t.includes("?") || QUESTION_START.test(t) }
}

/**
 * True for a case description: patient markers (Herr/Frau, "45 Jahre alt", Anamnese, task-sheet
 * lines) together with length or several sentences, or a long text without any question.
 * A short question never counts, even with a patient marker ("Wie wirkt X bei Patienten mit Y?").
 */
export function looksLikeCase(text: string): boolean {
  const s = caseSignals(text)
  if (s.chars < 20) return false
  const long = s.chars > 300
  const multi = s.sentences >= 3
  // One or two sentences with a question mark are a question, whatever words they contain.
  if (s.question && s.sentences <= 2 && !long) return false
  const strong = s.markers.filter((m) => m !== "patient").length
  let score = 0
  if (strong) score += 2
  else if (s.markers.length) score += 1
  if (long) score += 1
  if (multi) score += 1
  if (!s.question) score += 1
  if (s.question) score -= 1
  return score >= 3
}
