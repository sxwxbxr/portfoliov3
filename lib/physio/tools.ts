/** Every tool on physio.sweber.dev. The landing page, nav and sitemap read this list. */
export type PhysioTool = {
  slug: string
  name: string
  /** One sentence for cards. */
  summary: string
  status: "live" | "soon"
  /** Paid tool page (behind the subscription). */
  path: string
  /** Free demo with fixed examples, if the tool has one. */
  demoPath?: string
}

export const PHYSIO_TOOLS: PhysioTool[] = [
  {
    slug: "suchstring",
    name: "Suchstring-Generator",
    summary:
      "Macht aus deiner PICO-Frage einen PubMed-Suchstring mit MeSH-Schlagworten, Stichworten, Klammern und Trunkierung.",
    status: "live",
    path: "/tools/suchstring",
    demoPath: "/tools/suchstring/demo",
  },
]
