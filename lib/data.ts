import { db } from "./db"
import { projects, experienceEntries, blogPosts, caseStudies } from "./schema"
import { eq, asc } from "drizzle-orm"

export async function getProjects() {
  return db.select().from(projects).orderBy(asc(projects.sortOrder))
}

export async function getProjectBySlug(slug: string) {
  const results = await db.select().from(projects).where(eq(projects.slug, slug))
  return results[0] ?? null
}

export async function getExperience() {
  return db.select().from(experienceEntries).orderBy(asc(experienceEntries.sortOrder))
}

export async function getBlogPosts() {
  return db.select().from(blogPosts)
}

export async function getBlogPostBySlug(slug: string) {
  const results = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug))
  return results[0] ?? null
}

export async function getCaseStudies() {
  return db.select().from(caseStudies)
}

export async function getCaseStudyBySlug(slug: string) {
  const results = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug))
  return results[0] ?? null
}
