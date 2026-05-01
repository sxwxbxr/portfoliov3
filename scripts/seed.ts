import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../lib/schema"
import {
  projects,
  experience,
  blogPosts,
  caseStudies,
  skills,
  siteSettings,
} from "./seed-data"

// Load env vars
import "dotenv/config"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log("Seeding database...")

  // Clear existing data
  await db.delete(schema.projects)
  await db.delete(schema.experienceEntries)
  await db.delete(schema.blogPosts)
  await db.delete(schema.caseStudies)
  await db.delete(schema.skills)
  await db.delete(schema.siteSettings)

  // Insert projects
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]
    await db.insert(schema.projects).values({
      title: p.title,
      shortDescription: p.shortDescription,
      description: p.description,
      image: p.image,
      tags: p.tags,
      slug: p.slug,
      github: p.github,
      demo: p.demo,
      sortOrder: i,
    })
  }
  console.log(`Inserted ${projects.length} projects`)

  // Insert experience
  for (let i = 0; i < experience.length; i++) {
    const e = experience[i]
    await db.insert(schema.experienceEntries).values({
      company: e.company,
      role: e.role,
      period: e.period,
      current: e.current,
      description: e.description,
      responsibilities: e.responsibilities,
      sortOrder: i,
    })
  }
  console.log(`Inserted ${experience.length} experience entries`)

  // Insert blog posts
  for (const post of blogPosts) {
    await db.insert(schema.blogPosts).values({
      slug: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      author: post.author,
      tags: post.tags,
      image: post.image,
    })
  }
  console.log(`Inserted ${blogPosts.length} blog posts`)

  // Insert case studies
  for (const cs of caseStudies) {
    await db.insert(schema.caseStudies).values({
      slug: cs.slug,
      title: cs.title,
      client: cs.client,
      industry: cs.industry,
      duration: cs.duration,
      team: cs.team,
      challenge: cs.challenge,
      solution: cs.solution,
      results: cs.results,
      technologies: cs.technologies,
      image: cs.image,
      testimonialQuote: cs.testimonial?.quote ?? "",
      testimonialAuthor: cs.testimonial?.author ?? "",
      testimonialCompany: cs.testimonial?.company ?? "",
    })
  }
  console.log(`Inserted ${caseStudies.length} case studies`)

  // Insert skills
  for (const skill of skills) {
    await db.insert(schema.skills).values(skill)
  }
  console.log(`Inserted ${skills.length} skills`)

  // Insert site settings (singleton)
  await db.insert(schema.siteSettings).values({ id: 1, ...siteSettings })
  console.log("Inserted site settings")

  console.log("Seeding complete!")
}

seed().catch(console.error)
