import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * Output of Cosine Pro for the demo page: an insights report rendered by the
 * real cosine-insights package from made-up searches. This repository holds
 * only the output, never the package.
 */

const DIR = path.join(process.cwd(), "content", "demos", "cosine")

export const getCosineDemo = cache(() => {
  try {
    return { insights: fs.readFileSync(path.join(DIR, "insights-en.html"), "utf8") }
  } catch {
    return { insights: null }
  }
})
