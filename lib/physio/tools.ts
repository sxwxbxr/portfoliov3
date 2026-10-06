/**
 * Every tool on physio.sweber.dev. The landing page, the /tools hub, the nav,
 * the account page and the sitemap read this list: adding a tool is one entry
 * in PHYSIO_TOOLS (plus its pages under app/physio/tools/<slug>).
 */

/** Same keys as the suggestion categories, minus "anderes": a built tool always belongs somewhere. */
export type ToolCategoryKey = "recherche" | "lernen" | "praxis" | "organisation"

export type ToolCategory = {
  key: ToolCategoryKey
  /** Matches the label students see in /vorschlaege. */
  label: string
  /** One line under the group heading on /tools. */
  description: string
  order: number
}

export const PHYSIO_TOOL_CATEGORIES: readonly ToolCategory[] = [
  { key: "recherche", label: "Recherche", description: "Literatur finden, suchen und einordnen.", order: 1 },
  { key: "lernen", label: "Lernen und Prüfung", description: "Stoff üben, wiederholen und prüfen.", order: 2 },
  { key: "praxis", label: "Praxis und Befund", description: "Hilfen für Praktikum, Befund und Dokumentation.", order: 3 },
  { key: "organisation", label: "Organisation", description: "Studium und Alltag besser planen.", order: 4 },
]

/** Keys of the drawn icons in components/physio/ToolIcon.tsx. Add a path there first, then use the key here. */
export type ToolIconKey = "brackets" | "search" | "book" | "clipboard" | "calendar" | "list"

export type PhysioToolStatus = "live" | "beta" | "soon"

export type PhysioTool = {
  slug: string
  name: string
  /** One sentence for cards. */
  summary: string
  category: ToolCategoryKey
  /** Searchable on /tools and shown on the card. Short and concrete: PubMed, PICO, MeSH. */
  tags: string[]
  /**
   * live: usable. beta: usable, labelled as still changing. soon: announced only,
   * listed on /tools without links, never in the sitemap, nav or landing page.
   */
  status: PhysioToolStatus
  /** Preferred for the landing page. */
  featured?: boolean
  /** ISO date (YYYY-MM-DD) the tool went live. Shows "Neu" for NEW_TOOL_DAYS. */
  addedAt: string
  /** "paid": full version behind the subscription (a demo may be free). "free": no account needed. */
  access: "paid" | "free"
  icon: ToolIconKey
  /** Full tool page (behind the subscription when access is "paid"). */
  path: string
  /** Free demo with fixed examples, if the tool has one. */
  demoPath?: string
}

export const PHYSIO_TOOLS: PhysioTool[] = [
  {
    slug: "suchstring",
    name: "Suchstring-Generator",
    summary:
      "Macht aus deiner PICO-Frage einen PubMed-Suchstring mit Schlagworten (MeSH), Stichworten, Klammern und Trunkierung.",
    category: "recherche",
    tags: ["PubMed", "PICO", "MeSH", "Suchstring"],
    status: "live",
    featured: true,
    addedAt: "2026-10-06",
    access: "paid",
    icon: "brackets",
    path: "/tools/suchstring",
    demoPath: "/tools/suchstring/demo",
  },
]

export const NEW_TOOL_DAYS = 60

/** Hub controls (search and category chips) only appear from this many listed tools on. */
export const TOOLS_FILTER_MIN = 5

export const getTool = (slug: string): PhysioTool | undefined => PHYSIO_TOOLS.find((t) => t.slug === slug)

export const getToolCategory = (key: ToolCategoryKey): ToolCategory =>
  PHYSIO_TOOL_CATEGORIES.find((c) => c.key === key) ?? PHYSIO_TOOL_CATEGORIES[0]

/** Tools a visitor can open (live and beta). */
export const isUsable = (t: PhysioTool): boolean => t.status !== "soon"

export function isNewTool(t: PhysioTool, now: Date = new Date()): boolean {
  const added = Date.parse(t.addedAt)
  if (Number.isNaN(added)) return false
  const age = now.getTime() - added
  return age >= 0 && age < NEW_TOOL_DAYS * 86_400_000
}

/** Order on every list: usable before announced, featured first, then newest. */
export function compareTools(a: PhysioTool, b: PhysioTool): number {
  return (
    Number(!isUsable(a)) - Number(!isUsable(b)) ||
    Number(!!b.featured) - Number(!!a.featured) ||
    b.addedAt.localeCompare(a.addedAt) ||
    a.name.localeCompare(b.name, "de")
  )
}

/** Landing page: usable tools only, in list order, at most `max`. */
export function landingTools(max = 3): PhysioTool[] {
  return PHYSIO_TOOLS.filter(isUsable).sort(compareTools).slice(0, max)
}

/** Lowercase, umlauts and accents folded ("Prüfung" and "pruefung" both become "prufung"), for the hub search. */
export function foldForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
}

/** Every word of the query has to appear in name, summary, tags or category label. */
export function toolMatchesQuery(t: PhysioTool, query: string): boolean {
  const words = foldForSearch(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const hay = foldForSearch([t.name, t.summary, getToolCategory(t.category).label, ...t.tags].join(" "))
  return words.every((w) => hay.includes(w))
}
