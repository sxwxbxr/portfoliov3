import { z } from "zod"

/**
 * Shape of one file in content/packages/*.json.
 *
 * Everything the package site renders about a library comes from that file:
 * the overview card, the detail page, the pricing block, /packages.json,
 * /feed.xml, the sitemap and the OG image. Publishing a new library means
 * adding one file; no page or component knows a package by name.
 */

const url = z.string().url()

const priceTier = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  /** Price per month in `pricing.currency`. Omit when the tier has no monthly plan. */
  monthly: z.number().nonnegative().optional(),
  /** Price per year. Omit when the tier has no yearly plan. */
  yearly: z.number().nonnegative().optional(),
  /** One-time price, e.g. a lifetime licence. */
  oneTime: z.number().nonnegative().optional(),
  /** Maximum number of people covered by one licence. */
  seats: z.number().int().positive(),
  /**
   * Prices are per person (Polar seat pricing): the buyer picks 1..`seats`
   * seats at checkout and pays the price once per seat.
   */
  perSeat: z.boolean().default(false),
  support: z.boolean(),
  highlighted: z.boolean().default(false),
  /**
   * Hosted checkout links at the merchant of record, one per billing period.
   * A missing link renders the waitlist button instead.
   */
  checkout: z
    .object({
      monthly: url.optional(),
      yearly: url.optional(),
      oneTime: url.optional(),
    })
    .default({}),
})

export const packageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  /** One sentence. Used as the card line, the hero line and the meta description. */
  tagline: z.string(),
  /** SEO title, e.g. "Permito – self-hosted cookie consent for React & Next.js". */
  seoTitle: z.string().optional(),
  /** One or more paragraphs, Markdown. */
  description: z.string(),
  status: z.enum(["stable", "beta", "coming-soon"]),
  tags: z.array(z.string()).default([]),
  license: z.enum(["MIT", "commercial", "MIT + Pro"]),
  /** Lower sorts first on the overview. */
  order: z.number().int().default(100),
  install: z.string(),
  /** npm package names that belong to the open-source part. */
  npm: z.array(z.string()).default([]),
  code: z
    .object({
      title: z.string().optional(),
      language: z.string().default("tsx"),
      snippet: z.string(),
    })
    .optional(),
  links: z
    .object({
      docs: url.optional(),
      github: url.optional(),
      npm: url.optional(),
      changelog: url.optional(),
    })
    .default({}),
  features: z.object({
    free: z.array(z.string()).min(1),
    pro: z.array(z.string()).optional(),
  }),
  /** Free-vs-Pro table rows. `true`/`false` render as check/dash, strings as text. */
  comparison: z
    .array(
      z.object({
        feature: z.string(),
        free: z.union([z.boolean(), z.string()]),
        pro: z.union([z.boolean(), z.string()]),
      })
    )
    .optional(),
  pro: z
    .object({
      name: z.string(),
      /** "coming-soon" keeps the pricing visible but routes every button to the waitlist. */
      availability: z.enum(["available", "coming-soon"]),
      packages: z
        .array(z.object({ name: z.string(), description: z.string() }))
        .default([]),
      waitlistUrl: z.string().optional(),
      /** Path on the package site of a live demo of the Pro packages, e.g. "/permito/demo". */
      demoUrl: z.string().startsWith("/").optional(),
    })
    .optional(),
  pricing: z
    .object({
      currency: z.literal("CHF"),
      merchant: z.string(),
      tiers: z.array(priceTier).min(1),
      /** Shown under the cards: what a person covers, what happens after cancelling. */
      notes: z.array(z.string()).default([]),
      /** Above the largest tier, e.g. "11+ people". */
      custom: z.object({ label: z.string(), email: z.string().email() }).optional(),
    })
    .optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  videos: z
    .array(z.object({ youtubeId: z.string(), title: z.string() }))
    .default([]),
  /** External articles, shown only when no blog post references this package. */
  articles: z.array(z.object({ title: z.string(), url })).default([]),
  /** Releases feed into /feed.xml next to the package launch itself. */
  releases: z
    .array(
      z.object({
        version: z.string(),
        date: z.string().date(),
        title: z.string(),
        url: url.optional(),
      })
    )
    .default([]),
  ogImage: z.string().optional(),
  publishedAt: z.string().date(),
})

export type Package = z.infer<typeof packageSchema>
export type PriceTier = z.infer<typeof priceTier>
