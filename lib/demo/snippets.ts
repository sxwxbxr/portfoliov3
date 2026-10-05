/** Code shown on the demo page. Plain strings, no package imports. */

export const MAPPER_SNIPPET = `import { catalog, toConsentService } from "@weber-development/permito-catalog"

const entry = catalog.find((e) => e.id === "google-analytics-4")
if (!entry) throw new Error("Entry not found")

// The category is your decision. The catalog never sets it.
const service = toConsentService(entry, { category: "statistics" })`

export const TABLE_CONFIG_SNIPPET = `// consent.config.ts
import type { ConsentConfig } from "@permitojs/core"
import { catalog, toConsentService } from "@weber-development/permito-catalog"

const entry = (id: string) => {
  const found = catalog.find((e) => e.id === id)
  if (!found) throw new Error(\`Catalog entry missing: \${id}\`)
  return found
}

export const consentConfig: ConsentConfig = {
  consentVersion: "2026-10",
  categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
  services: [
    toConsentService(entry("google-analytics-4"), { category: "statistics" }),
    toConsentService(entry("meta-pixel"), { category: "marketing" }),
    toConsentService(entry("youtube-nocookie"), { category: "marketing" }),
  ],
}`

export const TABLE_BUILD_SNIPPET = `import { buildCookieTable, toHtml, toMarkdown } from "@weber-development/permito-cookie-table"
import { catalog } from "@weber-development/permito-catalog"
import { consentConfig } from "./consent.config"

const table = buildCookieTable(consentConfig, {
  language: "de",
  catalog,
  includeConsentCookie: { duration: "180 Tage" },
})

toHtml(table, { classes: true })
toMarkdown(table)`

export const TABLE_CHECK_SNIPPET = `permito-cookie-table --config ./consent.config.ts --lang en --catalog \
  --include-consent-cookie --consent-cookie-duration "180 days" \
  --check ./content/cookies.en.md`

export const SCAN_COMMAND = `npx permito scan https://client.example --config consent.config.ts`

export const LOG_RECORD = `{
  "id": "6f1c0b0e-4a52-4d0e-9b57-0e2a3f6c8d11",
  "visitorHash": "9b1d5c3a7e0f42a8c6d4b2e19f08a7d3c5e6b4a1f2d0c9e8b7a6f5d4c3b2a190",
  "timestamp": "2026-10-05T09:41:12.000Z",
  "consentVersion": "2026-10",
  "categories": { "necessary": true, "statistics": true, "marketing": false },
  "services": {},
  "source": "banner",
  "region": "CH",
  "language": "de-CH"
}`

export const LOG_ROUTE = `// lib/consent-log.ts
import { createConsentLog } from "@weber-development/permito-log"
import { fileStore } from "@weber-development/permito-log/file"

export const log = createConsentLog({
  store: fileStore(process.env.CONSENT_LOG_FILE ?? "./data/consent-log.jsonl"),
  salt: process.env.CONSENT_LOG_SALT!, // at least 32 characters
  retentionDays: 90, // your decision, there is no default
})

// app/api/consent-log/route.ts
import { createConsentLogRoute } from "@weber-development/permito-log/next"
import { log } from "@/lib/consent-log"

export const runtime = "nodejs"
export const { POST } = createConsentLogRoute(log, {
  allowedOrigins: ["https://www.example.ch"],
})`

export const SURJECTION_CHECK_COMMAND = `npx surjection check https://baeckerei-muster.example/ \\
  --project "Bäckerei Muster" --out-md a11y.md --out-json a11y.json

✗ https://baeckerei-muster.example/ (6 issues)

6 accessibility issue(s) on 1 page(s).`

export const SURJECTION_PRO_COMMANDS = `npx surjection-history record --results a11y.json
npx surjection-checklist apply --checklist checklist.json --results a11y.json
npx surjection-report --results a11y.json --brand brand.json \\
  --checklist checklist.json --history-dir .surjection-history \\
  --locale de --out bericht.pdf`
