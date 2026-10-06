/**
 * Turns the editable model into a search string: OR inside a Suchkomponente,
 * AND between components, rendered through a database profile.
 */
import { genericLevel } from "./lint"
import { getRenderProfile } from "./profiles"
import { BLOCKS, type BuiltComponent, type BuiltQuery, type Concept, type DatabaseId, type Notice, type SearchModel } from "./types"

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

  for (const concept of orderConcepts(model)) {
    if (!model.includedBlocks[concept.block]) continue

    const meshParts = concept.mesh.filter((m) => !m.removed)
    const textParts = concept.freeText.filter((f) => !f.removed)
    const parts: string[] = []
    const schlagworte: string[] = []
    const stichworte: string[] = []

    for (const m of meshParts) {
      parts.push(profile.mesh(m.heading, m.explode))
      schlagworte.push(m.explode ? m.heading : `${m.heading} (ohne Unterbegriffe)`)
    }
    for (const f of textParts) {
      const r = profile.freeText(f.text)
      if (!r) continue
      if (parts.includes(r.term)) continue
      parts.push(r.term)
      stichworte.push(r.plain)
      if (r.truncationDropped) {
        notices.push({
          severity: "warning",
          code: "trunc-dropped",
          conceptId: concept.id,
          message: `«${f.text}» in «${concept.label}»: Vor dem * müssen mindestens 4 Zeichen stehen. Der Stern wurde weggelassen.`,
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

    if (!parts.length) {
      notices.push({
        severity: "warning",
        code: "empty-component",
        conceptId: concept.id,
        message: `«${concept.label}» hat keinen aktiven Begriff mehr und wird weggelassen.`,
      })
      continue
    }
    if (!meshParts.length && concept.origin === "terminology") {
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
  if (f.studyTypes.length) {
    notices.push({
      severity: "info",
      code: "study-filter",
      message: "Der Studientyp-Filter nutzt Publikationstypen. Neue Studien sind dort oft noch nicht verschlagwortet und fehlen dann.",
    })
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

  return { databaseId, query, components, filterClauses, notices, empty: !components.length }
}

export const BLOCK_LABEL: Record<(typeof BLOCKS)[number], string> = {
  population: "Population",
  intervention: "Intervention",
  comparison: "Vergleich",
  outcome: "Outcome",
}
