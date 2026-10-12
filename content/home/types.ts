export interface HomeContent {
  metaTitle: string
  metaDescription: string
  /** Full opening paragraph from the draft; the hero already carries its first two sentences. */
  intro: string
  /** Last sentence of `intro`, rendered under the hero as the complement. */
  complement: string
  serviceArea: string
  faq: { q: string; a: string }[]
  cta: { lead: string; text: string }
}
