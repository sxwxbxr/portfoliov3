/**
 * Normalisation and shard addressing for the static MeSH index
 * (public/physio/mesh/<year>/). Pure, dependency free, browser and Node safe.
 *
 * The build script (scripts/physio/mesh/build-index.ts) and the runtime
 * matcher both import this file, so an indexed term and a typed term always
 * land on the same key. Changing anything here changes the index format:
 * bump NORMALISATION_VERSION and rebuild.
 *
 * Normalisation spec v1 (`normalizeMeshTerm`):
 *   1. lowercase
 *   2. apostrophes and backticks are removed ("Crohn's" gives "crohns")
 *   3. ä->ae, ö->oe, ü->ue, ß->ss, æ->ae, œ->oe, ø->o, đ->d, ł->l
 *   4. NFKD, then every combining mark is stripped ("é" gives "e")
 *   5. every run of characters that is not a letter or digit becomes one space
 *   6. trim
 * Latin letters end up in [a-z0-9]; other scripts (Greek) are kept as they are.
 *
 * Shard addressing:
 *   terms shard key   = first two characters of the normalised term, every
 *                       character outside [a-z0-9] replaced by "_"
 *   descriptor bucket = FNV-1a 32-bit hash of the UI string, modulo 256,
 *                       written as two lowercase hex digits ("00".."ff")
 *   tree shard key    = first three characters of the tree number ("C23")
 */

export const NORMALISATION_VERSION = 1

const APOSTROPHES = /[’‘'`´ʼ]/g

const FOLD: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  đ: "d",
  ł: "l",
}

/** Lowercase, fold umlauts and diacritics, turn punctuation into single spaces. */
export function normalizeMeshTerm(input: string): string {
  const lower = input.toLowerCase().replace(APOSTROPHES, "")
  let folded = ""
  for (const ch of lower) folded += FOLD[ch] ?? ch
  return folded
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

/** Shard key of the terms index for an already normalised term. */
export function meshTermShardKey(normalised: string): string {
  return normalised.slice(0, 2).replace(/[^a-z0-9]/g, "_")
}

/** FNV-1a 32-bit hash of a string (UTF-16 code units, UIs are ASCII). */
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** Descriptor bucket number 0..255 for a descriptor UI. */
export function meshDescriptorBucket(ui: string): number {
  return fnv1a32(ui) % 256
}

/** File stem of a descriptor bucket: two lowercase hex digits. */
export function meshDescriptorBucketKey(ui: string): string {
  return meshDescriptorBucket(ui).toString(16).padStart(2, "0")
}

/** Shard key of the tree index for a tree number such as "C23.888.592". */
export function meshTreeShardKey(treeNumber: string): string {
  return treeNumber.slice(0, 3)
}

/**
 * Acronym rule shared by build and parser: one token without spaces, at least
 * two uppercase letters, only uppercase letters, digits and hyphens, at most 8
 * characters ("LBP", "COPD", "MRI", "TENS", "LWS"). Such a term is indexed with
 * the acronym flag, so the parser can require the original to be uppercase
 * ("MS" matches multiple sclerosis, "ms" does not).
 */
export function isMeshAcronym(original: string): boolean {
  const s = original.trim()
  if (s.length < 2 || s.length > 8) return false
  if (!/^[A-ZÄÖÜ][A-ZÄÖÜ0-9-]*$/.test(s)) return false
  return (s.match(/[A-ZÄÖÜ]/g) ?? []).length >= 2
}

/**
 * Natural word order of an inverted MeSH heading: "Pain, Low Back" gives
 * "Low Back Pain", "Anemia, Hemolytic, Autoimmune" gives "Autoimmune Hemolytic
 * Anemia". Returns null when the heading is not inverted. Only ", " (comma and
 * space) separates parts, so chemical names such as "1,2-Dimethyl" are left
 * alone.
 */
export function uninvertMeshTerm(term: string): string | null {
  if (!term.includes(", ")) return null
  const parts = term.split(", ").map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return null
  return parts.reverse().join(" ")
}

const STOPWORDS = new Set(
  (
    "a an and are as at be but by for from has have in into is it its of on or such that the their then there " +
    "these they this to was were which with without not no all any other others also can may per via vs " +
    "der die das den dem des ein eine einer einen einem eines und oder mit von vom zu zum zur im in am an auf aus " +
    "bei bis fuer nach ueber um unter vor als auch ist sind war wird werden nicht kein keine sich es er sie wir ihr"
  ).split(" ")
)

/** True when every word of the normalised term is an English or German stopword. */
export function isStopTerm(normalised: string): boolean {
  if (!normalised) return true
  return normalised.split(" ").every((w) => STOPWORDS.has(w))
}

/** Index source of a term reference. */
export type MeshTermSource = "en-name" | "en-entry" | "de-wd" | "de-curated"

/** Numeric codes used inside the terms shards (smaller files). */
export const MESH_SOURCE_CODES: readonly MeshTermSource[] = [
  "en-name",
  "en-entry",
  "de-wd",
  "de-curated",
]
