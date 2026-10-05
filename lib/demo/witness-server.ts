import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * Output of the Witness Pro tools for the demo page. Generated with the real
 * witness-scan and witness-report CLIs from the made-up Muster Travel build
 * and the register in content/demos/witness/witness.config.json.
 */

const DIR = path.join(process.cwd(), "content", "demos", "witness")

const read = (file: string) => {
  try {
    return fs.readFileSync(path.join(DIR, file), "utf8")
  } catch {
    return null
  }
}

const section = (json: string | null, key: string) => {
  if (!json) return null
  try {
    return JSON.stringify({ [key]: (JSON.parse(json) as Record<string, unknown>)[key] }, null, 2)
  } catch {
    return null
  }
}

export const getWitnessDemo = cache(() => {
  const config = read("witness.config.json")
  return {
    scanConfig: section(config, "scan"),
    register: section(config, "register"),
    scan: read("scan-en.txt"),
    report: read("report-en.html"),
    page: read("page-en.html"),
  }
})
