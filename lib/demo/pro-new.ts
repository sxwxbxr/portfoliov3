import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * "New in Pro 2.1.0" section of a demo page. The text lives in
 * content/demos/<slug>/pro-2-1.json (Pro) and free-2-0.json (free) so every package keeps its own file.
 * Code is copied from the Pro documentation; recorded output only appears
 * when it came from a real run (see `output`).
 */
export type ProNewItem = {
  title: string
  text: string
  beta?: boolean
  codeTitle?: string
  code?: string
  /** Real output of the command above, only when it was recorded from an actual run. */
  outputTitle?: string
  output?: string
}

export type ProNew = {
  label: string
  title: string
  sub: string
  lede: string
  items: ProNewItem[]
  /** What the demo cannot show and why, e.g. "needs your own mail server". */
  note?: string
  /** Docs path on the package site, e.g. "/summand/docs/summand-server". */
  docsPath?: string
}

export type ProNewFile = "pro-2-1" | "free-2-0"

export const getProNew = cache((slug: string, file: ProNewFile = "pro-2-1"): ProNew | null => {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "content", "demos", slug, `${file}.json`),
      "utf8",
    )
    const data = JSON.parse(raw) as ProNew
    return Array.isArray(data.items) && data.items.length > 0 ? data : null
  } catch {
    return null
  }
})
