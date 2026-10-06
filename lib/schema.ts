import { pgTable, serial, text, boolean, integer, timestamp, json } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull().default(""),
  tags: json("tags").$type<string[]>().notNull().default([]),
  slug: text("slug").notNull().unique(),
  github: text("github").notNull().default("#"),
  demo: text("demo").notNull().default("#"),
  sortOrder: integer("sort_order").notNull().default(0),
  // Optional case-study fields. When filled, the project detail page renders
  // a richer Challenge / Solution / Results layout. Empty strings mean
  // "fall back to the legacy caseStudies row matched by slug".
  client: text("client").notNull().default(""),
  duration: text("duration").notNull().default(""),
  challenge: text("challenge").notNull().default(""),
  solution: text("solution").notNull().default(""),
  results: json("results").$type<string[]>().notNull().default([]),
})

export const experienceEntries = pgTable("experience", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  // Source of truth for the date range: "YYYY-MM" strings. `period` and
  // `current` are derived from these on save and persisted for fast reads.
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  period: text("period").notNull(),
  current: boolean("current").notNull().default(false),
  description: text("description").notNull().default(""),
  responsibilities: json("responsibilities").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  publishedAt: text("published_at").notNull(),
  readTime: text("read_time").notNull().default(""),
  author: text("author").notNull().default("Seya Weber"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  image: text("image").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
})

export const educationEntries = pgTable("education_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  institution: text("institution").notNull().default(""),
  // Source of truth: "YYYY-MM" strings. `period` is derived on save.
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  period: text("period").notNull().default(""),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fullTitle: text("full_title").notNull().default(""),
  provider: text("provider").notNull().default(""),
  category: text("category").notNull().default(""),
  status: text("status").notNull().default("planned"),
  description: text("description").notNull().default(""),
  credentialUrl: text("credential_url").notNull().default(""),
  credentialId: text("credential_id").notNull().default(""),
  issueDate: text("issue_date").notNull().default(""),
  expiryDate: text("expiry_date").notNull().default(""),
  plannedStart: text("planned_start").notNull().default(""),
  plannedEnd: text("planned_end").notNull().default(""),
  estimatedHours: integer("estimated_hours").notNull().default(0),
  estimatedCost: text("estimated_cost").notNull().default(""),
  difficulty: integer("difficulty").notNull().default(0),
  skills: json("skills").$type<string[]>().notNull().default([]),
  whyPoints: json("why_points").$type<string[]>().notNull().default([]),
  accentColor: text("accent_color").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  industry: text("industry").notNull().default(""),
  duration: text("duration").notNull().default(""),
  team: text("team").notNull().default(""),
  challenge: text("challenge").notNull().default(""),
  solution: text("solution").notNull().default(""),
  results: json("results").$type<string[]>().notNull().default([]),
  technologies: json("technologies").$type<string[]>().notNull().default([]),
  image: text("image").notNull().default(""),
  testimonialQuote: text("testimonial_quote").notNull().default(""),
  testimonialAuthor: text("testimonial_author").notNull().default(""),
  testimonialCompany: text("testimonial_company").notNull().default(""),
})

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  detail: text("detail").notNull().default(""),
  level: text("level").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
})

export type HeroMetric = { value: string; label: string }

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  // Hero
  heroAvailable: boolean("hero_available").notNull().default(true),
  heroAvailabilityLabel: text("hero_availability_label")
    .notNull()
    .default("Available for projects"),
  heroMetrics: json("hero_metrics")
    .$type<HeroMetric[]>()
    .notNull()
    .default([]),
  // Contact / public identity
  contactEmail: text("contact_email").notNull().default("info@sweber.dev"),
  contactPhone: text("contact_phone").notNull().default(""),
  contactLocation: text("contact_location")
    .notNull()
    .default("St. Gallen, Switzerland"),
  // Social URLs (single source of truth for footer + JSON-LD)
  linkedinUrl: text("linkedin_url").notNull().default(""),
  githubUrl: text("github_url").notNull().default(""),
  twitterUrl: text("twitter_url").notNull().default(""),
  // Structured data
  currentEmployer: text("current_employer").notNull().default(""),
  currentRole: text("current_role").notNull().default(""),
  alumniOf: text("alumni_of").notNull().default(""),
  knowsAbout: json("knows_about").$type<string[]>().notNull().default([]),
  // Privacy / legal copy (Markdown). Rendered on /privacy.
  privacyContent: text("privacy_content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// AI feature configuration (singleton, one row, id = 1). Each public AI feature
// has a primary model (a free OpenRouter `:free` model) and a paid fallback
// (a Chinese model) — chosen in the admin dashboard from the live OpenRouter
// model list. `dailyLimit` is the durable global request cap (kill-switch).
// Defaults use DeepSeek so the features work before any admin edit; confirm the
// exact IDs against the live list via the admin dropdown.
export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  chatPrimary: text("chat_primary").notNull().default("deepseek/deepseek-chat-v3-0324:free"),
  chatFallback: text("chat_fallback").notNull().default("deepseek/deepseek-chat"),
  contactPrimary: text("contact_primary").notNull().default("deepseek/deepseek-chat-v3-0324:free"),
  contactFallback: text("contact_fallback").notNull().default("deepseek/deepseek-chat"),
  deepdivePrimary: text("deepdive_primary").notNull().default("deepseek/deepseek-chat-v3-0324:free"),
  deepdiveFallback: text("deepdive_fallback").notNull().default("deepseek/deepseek-chat"),
  pitchPrimary: text("pitch_primary").notNull().default("deepseek/deepseek-chat-v3-0324:free"),
  pitchFallback: text("pitch_fallback").notNull().default("deepseek/deepseek-chat"),
  skillPrimary: text("skill_primary").notNull().default("deepseek/deepseek-chat-v3-0324:free"),
  skillFallback: text("skill_fallback").notNull().default("deepseek/deepseek-chat"),
  dailyLimit: integer("daily_limit").notNull().default(500),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// News, tutorials and release notes for packages.sweber.dev. Separate from
// blog_posts (the portfolio blog) because these link to packages, can be
// drafts, and may be pushed in by an external blog system. Field meanings
// match the Post type in lib/blog/types.ts.
export const packagePosts = pgTable("package_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  type: text("type").notNull().default("news"),
  status: text("status").notNull().default("draft"),
  // YYYY-MM-DD; a future date schedules the post.
  publishedAt: text("published_at").notNull(),
  author: text("author").notNull().default("Seya Weber"),
  coverImage: text("cover_image").notNull().default(""),
  tags: json("tags").$type<string[]>().notNull().default([]),
  packages: json("packages").$type<string[]>().notNull().default([]),
  videos: json("videos").$type<string[]>().notNull().default([]),
  canonicalUrl: text("canonical_url").notNull().default(""),
  // "admin" for posts written in /admin/news, otherwise the external system.
  source: text("source").notNull().default("admin"),
  // The external system's own ID, so repeated deliveries update one row.
  externalId: text("external_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ── physio.sweber.dev ────────────────────────────────────────────────────────
// Student accounts of the physio tool platform. Separate from `users` (admin):
// a physio session must never open /admin, so it is signed with its own secret.

export const physioUsers = pgTable("physio_users", {
  id: serial("id").primaryKey(),
  // Stored lowercased and trimmed.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Bumped on password reset and "log out everywhere"; sessions carry the
  // version they were issued with and die when it no longer matches.
  sessionVersion: integer("session_version").notNull().default(0),
  // Mirrored from Polar webhooks (subscription.*). Polar is the source of truth.
  polarCustomerId: text("polar_customer_id"),
  subscriptionId: text("subscription_id"),
  // Polar status: none | incomplete | trialing | active | past_due | canceled | unpaid
  subscriptionStatus: text("subscription_status").notNull().default("none"),
  subscriptionProductId: text("subscription_product_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  // `modified_at` of the last applied subscription payload; older deliveries
  // arriving out of order are ignored.
  subscriptionModifiedAt: timestamp("subscription_modified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/** One-time links for e-mail verification and password reset. Only the SHA-256 of the token is stored. */
export const physioTokens = pgTable("physio_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => physioUsers.id, { onDelete: "cascade" }),
  // "verify" | "reset"
  type: text("type").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/** Tool ideas sent in by students via physio.sweber.dev/vorschlaege. */
export const physioSuggestions = pgTable("physio_suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Free label chosen in the form, e.g. "Recherche", "Lernen", "Praxis".
  category: text("category").notNull().default(""),
  // Optional, only if the student wants an answer.
  contactEmail: text("contact_email").notNull().default(""),
  userId: integer("user_id").references(() => physioUsers.id, { onDelete: "set null" }),
  // new | planned | in_progress | done | declined
  status: text("status").notNull().default("new"),
  adminNote: text("admin_note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
