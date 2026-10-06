"use client"

import { useEffect, useState } from "react"
import { getMeshIndex, type MeshDescriptor } from "@/lib/physio/search-string/mesh-index"
import { normalizeMeshTerm } from "@/lib/physio/search-string/mesh-normalize"
import type { MeshChoice } from "@/lib/physio/search-string"

export type Loadable<T> = { status: "idle" | "loading" | "error" } | { status: "ready"; value: T }

/** Looks up the descriptor of a MeSH heading by its name ("Low Back Pain"). Null when the index does not know it. */
export async function resolveHeading(name: string): Promise<MeshDescriptor | null> {
  const idx = getMeshIndex()
  const key = normalizeMeshTerm(name)
  const refs = (await idx.lookupTerms([key])).get(key) ?? []
  const ref = refs.find((r) => r.source === "en-name") ?? refs[0]
  if (!ref) return null
  return (await idx.getDescriptors([ref.ui])).get(ref.ui) ?? null
}

export interface Neighbours {
  parents: MeshDescriptor[]
  children: MeshDescriptor[]
}

/** Broader (nearest ancestors) and narrower (direct children) descriptors across all tree numbers. */
export async function loadNeighbours(d: Pick<MeshChoice, "ui" | "treeNumbers">): Promise<Neighbours> {
  const idx = getMeshIndex()
  const [parentNodes, childLists] = await Promise.all([
    Promise.all(d.treeNumbers.map((tn) => idx.getTreeParent(tn))),
    Promise.all(d.treeNumbers.map((tn) => idx.getTreeChildren(tn))),
  ])
  const parentUis = [...new Set(parentNodes.flatMap((n) => (n ? [n.ui] : [])))].filter((ui) => ui !== d.ui)
  const childUis = [...new Set(childLists.flat().map((n) => n.ui))].filter((ui) => ui !== d.ui && !parentUis.includes(ui))
  const all = await idx.getDescriptors([...parentUis, ...childUis])
  const pick = (uis: string[]) => uis.flatMap((ui) => (all.has(ui) ? [all.get(ui)!] : []))
  const byName = (a: MeshDescriptor, b: MeshDescriptor) => a.name.localeCompare(b.name)
  return { parents: pick(parentUis).sort(byName), children: pick(childUis).sort(byName) }
}

/** Neighbours of a descriptor, loaded when the descriptor changes. */
export function useNeighbours(d: Pick<MeshChoice, "ui" | "treeNumbers"> | null): Loadable<Neighbours> {
  const [state, setState] = useState<{ ui: string; result: Loadable<Neighbours> } | null>(null)
  const ui = d?.ui ?? null
  const trees = d?.treeNumbers

  useEffect(() => {
    if (!ui || !trees) return
    let cancelled = false
    loadNeighbours({ ui, treeNumbers: trees }).then(
      (value) => !cancelled && setState({ ui, result: { status: "ready", value } }),
      () => !cancelled && setState({ ui, result: { status: "error" } }),
    )
    return () => {
      cancelled = true
    }
    // The tree numbers belong to the UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui])

  if (!ui) return { status: "idle" }
  if (state?.ui !== ui) return { status: "loading" }
  return state.result
}
