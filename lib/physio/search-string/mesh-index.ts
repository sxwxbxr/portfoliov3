/**
 * Browser-safe client for the static MeSH index in public/physio/mesh/<year>/.
 *
 * Only shard keys ever leave the browser: `lookupTerms` fetches
 * `terms/<first two chars>.json`, `getDescriptors` fetches `desc/<hex>.json`,
 * the tree functions fetch `tree/<C23>.json`. The research question itself is
 * never sent anywhere. Shards are cached in memory for the lifetime of the
 * index instance; a missing shard (404) counts as empty.
 *
 * Static files under /public are served at their real path on every host
 * (middleware.ts lets paths with a file extension pass through unchanged on
 * physio.*), so the default base URL works on sweber.dev and physio.sweber.dev.
 */
import {
  MESH_SOURCE_CODES,
  meshDescriptorBucketKey,
  meshTermShardKey,
  meshTreeShardKey,
  type MeshTermSource,
} from "./mesh-normalize"

export type { MeshTermSource } from "./mesh-normalize"

export const DEFAULT_MESH_BASE_URL = "/physio/mesh/2026"

/** One descriptor a normalised term points to. */
export interface MeshTermRef {
  /** Descriptor UI, e.g. "D017116". */
  ui: string
  source: MeshTermSource
  /**
   * True when the indexed term is an acronym (LBP, COPD, MS). The matcher
   * should only accept it when the original input token is uppercase.
   */
  acronym: boolean
}

export interface MeshDescriptor {
  ui: string
  /** MeSH heading, e.g. "Low Back Pain" or "Osteoarthritis, Knee". */
  name: string
  treeNumbers: string[]
  /** Entry terms for display, most useful first, at most ~25. */
  entryTerms: string[]
  /** German labels, curated first. */
  german: string[]
  /** Scope note, about 300 characters at most. May be empty. */
  scopeNote: string
}

export interface MeshTreeNode {
  treeNumber: string
  ui: string
}

export interface MeshMeta {
  version: string
  format: number
  builtAt: string
  counts: Record<string, number>
  bytes: Record<string, unknown>
  attribution: string[]
  normalisation: { version: number; module: string; spec: string }
  [key: string]: unknown
}

export interface MeshIndexOptions {
  /** Defaults to DEFAULT_MESH_BASE_URL. Trailing slash is ignored. */
  baseUrl?: string
  /** Defaults to globalThis.fetch. Inject for tests or Node. */
  fetch?: typeof fetch
}

export interface MeshIndex {
  /** Resolves normalised terms (see normalizeMeshTerm) to descriptor refs. Terms without a hit are absent from the map. */
  lookupTerms(normalisedTerms: string[]): Promise<Map<string, MeshTermRef[]>>
  /** Full descriptor details. Unknown UIs are absent from the map. */
  getDescriptors(uis: string[]): Promise<Map<string, MeshDescriptor>>
  /** Direct children of a tree number, sorted by tree number. */
  getTreeChildren(treeNumber: string): Promise<MeshTreeNode[]>
  /** Nearest ancestor present in the index, or null for a top level number. */
  getTreeParent(treeNumber: string): Promise<MeshTreeNode | null>
  getMeta(): Promise<MeshMeta>
}

type RawRef = [string, number] | [string, number, number]
type RawDescriptor = { n: string; t: string[]; e?: string[]; de?: string[]; s?: string }

export function createMeshIndex(options: MeshIndexOptions = {}): MeshIndex {
  const base = (options.baseUrl ?? DEFAULT_MESH_BASE_URL).replace(/\/+$/, "")
  const doFetch = options.fetch ?? ((...a: Parameters<typeof fetch>) => globalThis.fetch(...a))
  const cache = new Map<string, Promise<unknown>>()

  function shard<T>(path: string, empty: T): Promise<T> {
    let p = cache.get(path) as Promise<T> | undefined
    if (!p) {
      p = (async () => {
        const res = await doFetch(`${base}/${path}`)
        if (res.status === 404) return empty
        if (!res.ok) throw new Error(`MeSH index ${path}: HTTP ${res.status}`)
        return (await res.json()) as T
      })()
      cache.set(path, p)
      p.catch(() => cache.delete(path))
    }
    return p
  }

  return {
    async lookupTerms(terms) {
      const keys = [...new Set(terms.map(meshTermShardKey))]
      const shards = new Map<string, Record<string, RawRef[]>>()
      await Promise.all(
        keys.map(async (k) => shards.set(k, await shard<Record<string, RawRef[]>>(`terms/${k}.json`, {})))
      )
      const out = new Map<string, MeshTermRef[]>()
      for (const term of terms) {
        const raw = shards.get(meshTermShardKey(term))?.[term]
        if (!raw || out.has(term)) continue
        out.set(
          term,
          raw.map((r) => ({
            ui: r[0],
            source: MESH_SOURCE_CODES[r[1]],
            acronym: r[2] === 1,
          }))
        )
      }
      return out
    },

    async getDescriptors(uis) {
      const buckets = [...new Set(uis.map(meshDescriptorBucketKey))]
      const shards = new Map<string, Record<string, RawDescriptor>>()
      await Promise.all(
        buckets.map(async (b) => shards.set(b, await shard<Record<string, RawDescriptor>>(`desc/${b}.json`, {})))
      )
      const out = new Map<string, MeshDescriptor>()
      for (const ui of uis) {
        const raw = shards.get(meshDescriptorBucketKey(ui))?.[ui]
        if (!raw || out.has(ui)) continue
        out.set(ui, {
          ui,
          name: raw.n,
          treeNumbers: raw.t,
          entryTerms: raw.e ?? [],
          german: raw.de ?? [],
          scopeNote: raw.s ?? "",
        })
      }
      return out
    },

    async getTreeChildren(treeNumber) {
      const tree = await shard<Record<string, string>>(`tree/${meshTreeShardKey(treeNumber)}.json`, {})
      const prefix = `${treeNumber}.`
      const out: MeshTreeNode[] = []
      for (const [tn, ui] of Object.entries(tree)) {
        if (tn.startsWith(prefix) && !tn.includes(".", prefix.length)) out.push({ treeNumber: tn, ui })
      }
      return out.sort((a, b) => (a.treeNumber < b.treeNumber ? -1 : 1))
    },

    async getTreeParent(treeNumber) {
      const tree = await shard<Record<string, string>>(`tree/${meshTreeShardKey(treeNumber)}.json`, {})
      let tn = treeNumber
      while (tn.includes(".")) {
        tn = tn.slice(0, tn.lastIndexOf("."))
        const ui = tree[tn]
        if (ui) return { treeNumber: tn, ui }
      }
      return null
    },

    getMeta() {
      return shard<MeshMeta>("meta.json", {} as MeshMeta)
    },
  }
}

const defaults = new Map<string, MeshIndex>()

/** Shared instance per base URL, so pages share one in-memory cache. */
export function getMeshIndex(options: MeshIndexOptions = {}): MeshIndex {
  if (options.fetch) return createMeshIndex(options)
  const key = options.baseUrl ?? DEFAULT_MESH_BASE_URL
  let idx = defaults.get(key)
  if (!idx) defaults.set(key, (idx = createMeshIndex(options)))
  return idx
}

export const lookupTerms = (terms: string[], options?: MeshIndexOptions) =>
  getMeshIndex(options).lookupTerms(terms)
export const getDescriptors = (uis: string[], options?: MeshIndexOptions) =>
  getMeshIndex(options).getDescriptors(uis)
export const getTreeChildren = (treeNumber: string, options?: MeshIndexOptions) =>
  getMeshIndex(options).getTreeChildren(treeNumber)
export const getTreeParent = (treeNumber: string, options?: MeshIndexOptions) =>
  getMeshIndex(options).getTreeParent(treeNumber)
export const getMeshMeta = (options?: MeshIndexOptions) => getMeshIndex(options).getMeta()
