import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * Output of the Summand Pro tools for the demo page, generated with the real
 * summand-view and summand-inbox from the sample invoices in
 * public/demos/summand/samples (see content/demos/summand/README.md).
 */

const DIR = path.join(process.cwd(), "content", "demos", "summand")

const read = (file: string) => {
  try {
    return fs.readFileSync(path.join(DIR, file), "utf8")
  } catch {
    return null
  }
}

const prettyJsonLines = (text: string | null) => {
  if (!text) return null
  try {
    return text
      .trim()
      .split("\n")
      .map((line) => JSON.stringify(JSON.parse(line), null, 2))
      .join("\n")
  } catch {
    return null
  }
}

export const getSummandDemo = cache(() => ({
  view: read("view-en.html"),
  viewDe: read("view-de.html"),
  cli: read("inbox-en.txt"),
  report: read("inbox-report-en.html"),
  audit: prettyJsonLines(read("audit-en.jsonl")),
  watch: read("watch-en.txt"),
  datev: read("datev-en.txt"),
}))
