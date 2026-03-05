export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { caseStudies } from "@/lib/schema"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db.select().from(caseStudies)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.title || !body.slug) {
    return NextResponse.json(
      { error: "title and slug are required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(caseStudies)
    .values({
      title: body.title,
      slug: body.slug,
      client: body.client ?? "",
      industry: body.industry ?? "",
      duration: body.duration ?? "",
      team: body.team ?? "",
      challenge: body.challenge ?? "",
      solution: body.solution ?? "",
      results: body.results ?? [],
      technologies: body.technologies ?? [],
      image: body.image ?? "",
      testimonialQuote: body.testimonialQuote ?? "",
      testimonialAuthor: body.testimonialAuthor ?? "",
      testimonialCompany: body.testimonialCompany ?? "",
    })
    .returning()

  return NextResponse.json(result[0], { status: 201 })
}
