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
