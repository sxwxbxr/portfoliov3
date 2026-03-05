export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { caseStudies } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const result = await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.id, parseInt(id)))

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(result[0])
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const result = await db
    .update(caseStudies)
    .set({
      title: body.title,
      slug: body.slug,
      client: body.client,
      industry: body.industry,
      duration: body.duration,
      team: body.team,
      challenge: body.challenge,
      solution: body.solution,
      results: body.results,
      technologies: body.technologies,
      image: body.image,
      testimonialQuote: body.testimonialQuote,
      testimonialAuthor: body.testimonialAuthor,
      testimonialCompany: body.testimonialCompany,
    })
    .where(eq(caseStudies.id, parseInt(id)))
    .returning()

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(result[0])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await db.delete(caseStudies).where(eq(caseStudies.id, parseInt(id)))

  return NextResponse.json({ success: true })
}
