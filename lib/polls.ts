import { promises as fs } from "fs"
import path from "path"

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  createdBy: string
  createdAt: string
  endsAt: string
  totalVotes: number
  isActive: boolean
}

const dataFile = path.join(process.cwd(), "data", "polls.json")

export async function readPolls(): Promise<Poll[]> {
  const file = await fs.readFile(dataFile, "utf-8").catch(() => "[]")
  return JSON.parse(file) as Poll[]
}

export async function writePolls(polls: Poll[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(polls, null, 2))
}
