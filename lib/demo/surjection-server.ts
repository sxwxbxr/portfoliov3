import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * Output of the Surjection Pro packages for the demo page. The files were
 * produced by the real CLIs (surjection-report, surjection-history,
 * surjection-checklist) against lib/demo/surjection-shop.ts; this repository
 * holds only their output, never the packages.
 */

const DIR = path.join(process.cwd(), "content", "demos", "surjection")

const read = (file: string) => {
  try {
    return fs.readFileSync(path.join(DIR, file), "utf8")
  } catch {
    return null
  }
}

export const getSurjectionDemo = cache(() => ({
  reportDe: read("report-de.html"),
  reportEn: read("report-en.html"),
  dashboard: read("dashboard-en.html"),
  editor: read("editor-en.html"),
  markdown: read("run1-en.md"),
  regressions: read("regressions-en.md"),
  statement: read("statement-de-CH.md"),
}))
