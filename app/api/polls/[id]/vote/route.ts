import { NextResponse } from "next/server"
import { readPolls, writePolls } from "../../../../../lib/polls"

interface Params {
  params: { id: string }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { optionId } = await req.json()
    const polls = await readPolls()
    const poll = polls.find((p) => p.id === params.id)
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }
    const option = poll.options.find((o) => o.id === optionId)
    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }
    option.votes += 1
    poll.totalVotes += 1
    await writePolls(polls)
    return NextResponse.json(poll)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
