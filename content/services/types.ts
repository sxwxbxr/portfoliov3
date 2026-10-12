export type ServiceKey = "custom-software" | "process-automation-ai" | "digital-project-leadership"

export const SERVICE_KEYS: readonly ServiceKey[] = [
  "custom-software",
  "process-automation-ai",
  "digital-project-leadership",
]

export interface ServiceReference {
  /** Project slug, shared by both editions. */
  slug: string
  name: string
  text: string
}

export interface ServiceFaq {
  q: string
  a: string
}

export interface ServicePricingItem {
  /** Bold lead of the line, e.g. "Fixed price". */
  title: string | null
  text: string
}

export interface ServiceContent {
  /** Language-independent id; also the English path segment. */
  key: ServiceKey
  /** Path segment in this edition. */
  slug: string
  /** ISO date shown as "Last updated". */
  updatedAt: string
  /** Page title without the brand suffix. */
  metaTitle: string
  metaDescription: string
  h1: string
  lead: string
  forWhomIntro: string
  forWhom: string[]
  forWhomNote?: string
  deliverables: string[]
  process: { step: string | null; text: string; duration?: string }[]
  processNote?: string
  /** Pricing model only; amounts are placeholders in the content file and never rendered. */
  pricing: { intro?: string; items: ServicePricingItem[]; note?: string }
  references: ServiceReference[]
  referencesNote?: string
  faq: ServiceFaq[]
  cta: { lead: string; text: string }
}

export interface ServicesOverviewContent {
  slug: string
  updatedAt: string
  metaTitle: string
  metaDescription: string
  h1: string
  lead: string
  servicesHeading: string
  services: { key: ServiceKey; title: string; text: string; linkLabel: string }[]
  startHeading: string
  start: { step: string | null; text: string }[]
  serviceArea: string
  cta: { lead: string; text: string }
}

export interface ServiceLabels {
  forWhom: string
  deliverables: string
  process: string
  pricing: string
  references: string
  faq: string
  updated: string
  furtherReading: string
  /** Appended to links to German-only articles on the English edition. */
  inGerman: string
  overviewCrumb: string
}
