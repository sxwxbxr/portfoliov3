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
