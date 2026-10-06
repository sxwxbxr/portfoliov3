/**
 * Turns the editable model into a search string: OR inside a Suchkomponente,
 * AND between components, rendered through a database profile.
 *
 * CINAHL and Embase: the subject headings are suggestions derived from MeSH (never claimed to exist in
 * CINAHL Headings or Emtree). They are marked in `components[].headings`, `lines[].suggested` and
 * `vocabulary`, announced by a notice, and can be left out per database (`model.headingsOff`).
 */
import { buildStrategyLines } from "./cochrane"
import { genericLevel } from "./lint"
import { getRenderProfile, type FreeTextRender } from "./profiles"
import {
  BLOCKS,
  type BuiltComponent,
  type BuiltHeading,
  type BuiltQuery,
  type Concept,
  type DatabaseId,
  type Notice,
  type SearchModel,
} from "./types"

/** More components than this usually shrink the result list to almost nothing. */
export const MANY_COMPONENTS = 4

function orderConcepts(model: SearchModel): Concept[] {
  return BLOCKS.flatMap((b) => model.concepts.filter((c) => c.block === b))
}

export function buildQuery(model: SearchModel, databaseId: DatabaseId = "pubmed"): BuiltQuery {
  const profile = getRenderProfile(databaseId)
  if (!profile) throw new Error(`Für ${databaseId} gibt es noch kein Profil.`)

  const notices: Notice[] = []
  const components: BuiltComponent[] = []
  const isCochrane = databaseId === "cochrane"
  const isCinahl = databaseId === "cinahl"
  const isEmbase = databaseId === "embase"
  /** CINAHL and Embase: headings are suggestions and can be switched off. */
  const suggestsHeadings = !!profile.vocabulary
  const headingsOn = !suggestsHeadings || !(model.headingsOff ?? []).includes(databaseId)
  const nextForms: string[] = []
  let headingCount = 0

  for (const concept of orderConcepts(model)) {
    if (!model.includedBlocks[concept.block]) continue

    const meshParts = headingsOn ? concept.mesh.filter((m) => !m.removed) : []
    const textParts = concept.freeText.filter((f) => !f.removed)
    const meshRendered: string[] = []
    const renders: FreeTextRender[] = []
    const schlagworte: string[] = []
    const meshSyntax: string[] = []
    const headings: BuiltHeading[] = []
    const stichworte: string[] = []

    for (const m of meshParts) {
      const meshPart = profile.mesh(m.heading, m.explode)
      meshRendered.push(meshPart)
      meshSyntax.push(meshPart)
      schlagworte.push(m.explode ? m.heading : `${m.heading} (ohne Unterbegriffe)`)
      if (suggestsHeadings) headings.push({ source: m.heading, syntax: meshPart, explode: m.explode, suggested: true })
    }
    for (const f of textParts) {
      const r = profile.freeText(f.trunc && !f.text.includes("*") ? `${f.text}*` : f.text)
      if (!r) continue
      if (renders.some((x) => x.term === r.term)) continue
      renders.push(r)
      stichworte.push(r.plain)
      if (r.nextForm) nextForms.push(r.term)
      if (r.truncationDropped) {
        notices.push({
          severity: "warning",
          code: "trunc-dropped",
          conceptId: concept.id,
          message: isCochrane
            ? `«${f.text}» in «${concept.label}»: Vor dem * braucht die Cochrane Library mindestens ${profile.minStem} Zeichen, und mehrere Sterne in einem Wort gehen nicht. Das Tool hat den Stern weggelassen.`
            : isEmbase
              ? `«${f.text}» in «${concept.label}»: Vor dem * braucht Embase mindestens ${profile.minStem} Zeichen, und ein Stern am Wortanfang ist nicht erlaubt. Das Tool hat den Stern weggelassen.`
              : isCinahl
                ? `«${f.text}» in «${concept.label}»: Das Tool setzt einen Stern in CINAHL erst nach mindestens ${profile.minStem} Zeichen, sonst trifft er viel zu viel. Es hat den Stern weggelassen.`
                : `«${f.text}» in «${concept.label}»: Vor dem * braucht PubMed mindestens 4 Zeichen. Das Tool hat den Stern weggelassen.`,
        })
      }
      if (!/\s/.test(r.plain)) {
        const level = genericLevel(r.plain)
        if (level === "warning") {
          notices.push({
            severity: "warning",
            code: "generic-term",
            conceptId: concept.id,
            message: `«${r.plain}» in «${concept.label}» ist sehr allgemein und trifft fast jede Studie. Entferne es oder ersetze es durch eine genauere Phrase.`,
          })
        }
      }
    }

    const parts = profile.composeParts ? profile.composeParts(meshRendered, renders) : [...meshRendered, ...renders.map((r) => r.term)]
    if (!parts.length) {
      notices.push({
        severity: "warning",
        code: "empty-component",
        conceptId: concept.id,
        message: `«${concept.label}» hat keinen aktiven Begriff mehr und wird weggelassen.`,
      })
      continue
    }
    headingCount += headings.length
    if (!meshParts.length && concept.origin !== "custom" && headingsOn) {
      notices.push({
        severity: "info",
        code: "no-active-mesh",
        conceptId: concept.id,
        message: `«${concept.label}» wird nur mit Stichworten gesucht (kein aktives Schlagwort).`,
      })
    }

    components.push({
      conceptId: concept.id,
      label: concept.label,
      block: concept.block,
      query: profile.group(parts),
      stichworte,
      schlagworte,
      parts,
      meshSyntax,
      ...(suggestsHeadings ? { headings } : {}),
    })
  }

  for (const b of BLOCKS) {
    if (!model.includedBlocks[b] && model.concepts.some((c) => c.block === b)) {
      notices.push({
        severity: "info",
        code: "block-off",
        message: `Der Block «${BLOCK_LABEL[b]}» ist ausgeschaltet. Seine Komponenten stehen nicht im Suchstring.`,
      })
    }
  }

  if (components.length > MANY_COMPONENTS) {
    notices.push({
      severity: "info",
      code: "many-components",
      message: `Der String hat ${components.length} Komponenten, die alle mit AND verknüpft sind. Je mehr Komponenten, desto weniger Treffer. Schalte Blöcke aus oder entferne Komponenten, wenn die Trefferliste leer bleibt.`,
    })
  }

  const f = model.filters
  if (f.yearFrom !== null && f.yearTo !== null && f.yearFrom > f.yearTo) {
    notices.push({
      severity: "warning",
      code: "date-order",
      message: "Das Startjahr liegt nach dem Endjahr. Der Zeitraum ergibt keine Treffer.",
    })
  }
  if (f.studyTypes.length && !isCochrane && !isCinahl) {
    notices.push({
      severity: "info",
      code: "study-filter",
      message: isEmbase
        ? "Die Studientyp-Limits stützen sich auf die Indexierung von Embase. Neue Datensätze sind oft noch nicht indexiert und fehlen dann."
        : "Der Studientyp-Filter nutzt Publikationstypen. Neue Studien sind dort oft noch nicht verschlagwortet und fehlen dann.",
    })
  }

  if (isCochrane && components.length) {
    if (nextForms.length) {
      notices.push({
        severity: "info",
        code: "cochrane-next",
        message: `${nextForms.length === 1 ? "Eine Phrase mit * steht" : `${nextForms.length} Phrasen mit * stehen`} als NEXT-Ausdruck, zum Beispiel ${nextForms[0].replace(/:ti,ab,kw$/, "")}. Die Cochrane Library unterstützt Sterne in Anführungszeichen nicht.`,
      })
    }
    notices.push({
      severity: "info",
      code: "cochrane-mesh-coverage",
      message:
        "Schlagworte [mh] finden in der Cochrane Library nur Einträge aus PubMed, MEDLINE und ClinicalTrials.gov. Einträge aus anderen Quellen, etwa Embase, findest du nur über die Stichworte. Darum stehen beide im String.",
    })
    if (f.ageGroups.length || f.sex) {
      notices.push({
        severity: "info",
        code: "cochrane-checktag",
        message: "Alter und Geschlecht sind MeSH-Check-Tags. Einträge ohne MeSH-Indexierung fallen mit diesem Filter weg.",
      })
    }
  }

  if (suggestsHeadings && components.length) {
    const vocab = profile.vocabulary!
    if (!headingsOn) {
      notices.push({
        severity: "info",
        code: "headings-off",
        message: `Für ${profile.label} stehen nur Stichworte im String, keine Schlagwörter (${vocab.label}). Das ist sauber, findet aber Datensätze nicht, die nur über das Schlagwort erschlossen sind.`,
      })
    } else if (headingCount) {
      notices.push({ severity: "info", code: "heading-suggestion", message: vocab.note })
    }
  }

  if (isEmbase && components.length) {
    if (nextForms.length) {
      notices.push({
        severity: "info",
        code: "embase-next",
        message: `${nextForms.length === 1 ? "Eine Phrase mit * steht" : `${nextForms.length} Phrasen mit * stehen`} als NEXT/1-Kette, zum Beispiel ${nextForms[0].replace(/:ti,ab,kw$/, "")}. Ältere Embase-Anleitungen schreiben, dass Sterne in Anführungszeichen nicht gehen, die NEXT/1-Form gilt in jedem Fall.`,
      })
    }
    notices.push({
      severity: "info",
      code: "embase-platform",
      message:
        "Dieser String ist für embase.com (Elsevier). Viele Fachhochschulen bieten Embase über Ovid an, dort gilt eine andere Syntax, und dieser String läuft dort nicht. Prüfe, welche Oberfläche deine Hochschule nutzt.",
    })
    if (f.humansOnly) {
      notices.push({
        severity: "info",
        code: "embase-humans",
        message: "[humans]/lim findet nur Datensätze, die als Humanstudie indexiert sind. Noch nicht indexierte Datensätze fallen weg.",
      })
    }
  }

  const filterClauses = profile.filterClauses(f)
  const query = profile.assemble(
    components.map((c) => c.query),
    filterClauses,
    f,
  )

  if (!components.length) {
    notices.unshift({
      severity: "warning",
      code: "no-components",
      message: "Der String hat keine Suchkomponente. Schreib eine Fragestellung oder füge eine Komponente hinzu.",
    })
  }

  const result: BuiltQuery = { databaseId, query, components, filterClauses, notices, empty: !components.length }
  if (isCochrane) {
    result.lines = buildStrategyLines(components, filterClauses)
    result.limitNotes = profile.limitNotes?.(f) ?? []
  }
  if (isCinahl || isEmbase) {
    result.lines = buildStrategyLines(components, filterClauses, {
      prefix: profile.linePrefix,
      filterLabel: isEmbase ? embaseFilterLabel : undefined,
    })
    result.limitNotes = profile.limitNotes?.(f) ?? []
    result.platform = profile.platform
    result.platformNotes = profile.platformNotes?.() ?? []
  }
  if (profile.vocabulary) {
    result.vocabulary = { id: profile.vocabulary.id, label: profile.vocabulary.label, suggested: true, included: headingsOn, note: profile.vocabulary.note }
  }
  return result
}

function embaseFilterLabel(clause: string): string {
  if (/\]\/py$/.test(clause)) return "Limit: Erscheinungsjahre"
  if (clause === "[humans]/lim") return "Limit: nur Menschen"
  if (/^\[(english|german|french|italian|spanish)\]\/lim$/.test(clause)) return "Limit: Sprache"
  return "Limit: Studientyp, Alter oder Geschlecht"
}

export const BLOCK_LABEL: Record<(typeof BLOCKS)[number], string> = {
  population: "Population",
  intervention: "Intervention",
  comparison: "Vergleich",
  outcome: "Outcome",
}
