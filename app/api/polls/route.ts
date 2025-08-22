import { NextResponse } from "next/server"
import { readPolls, writePolls, Poll } from "../../../lib/polls"

export async function GET() {
  const polls = await readPolls()
  return NextResponse.json(polls)
}

export async function POST(req: Request) {
  try {
    const poll = (await req.json()) as Poll
    const polls = await readPolls()
    polls.unshift(poll)
    await writePolls(polls)
    return NextResponse.json(poll, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Invalid request" }, { status: 400 })
  }
}
