---
title: "Logarithm Pro 0.5.0 released"
excerpt: "Trusted RFC 3161 timestamps for integrity checkpoints, and a retention report with the legal basis per tenant that you can hand to an auditor as CSV or a printable page."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, GDPR, ISO 27001, release]
---

Logarithm Pro 0.5.0 is out and available to all Pro customers. The free packages stay at 0.4.0. Nothing breaks: 0.4.0 code keeps working as it is.

The theme of this release is evidence. An audit log is only as good as what you can show an auditor, so 0.5.0 adds two things that are hard to rebuild in an afternoon.

## Trusted timestamps for checkpoints

A signed checkpoint proves what the chain head was, but whoever holds the integrity key could backdate one. A time-stamping authority (RFC 3161) closes that gap: it certifies that the checkpoint existed at a point in time, and it only ever sees a SHA-256 digest, never your data.

```ts
import { createCheckpoint, timestampCheckpoint, verifyTimestamp } from "@weber-development/logarithm-integrity"

const checkpoint = await createCheckpoint(store, { key, tenantId: "acme" })
const stamped = await timestampCheckpoint(checkpoint!, { tsa: "https://freetsa.org/tsr" })
// { checkpoint, token, genTime: "2026-10-06T12:00:00Z", tsa }

await verifyTimestamp(stamped) // "2026-10-06T12:00:00Z", or null if the token belongs to another checkpoint
```

For regulated customers, point `tsa` at a qualified authority. `verifyTimestamp()` checks that the token covers the checkpoint and returns the certified time. To also verify the authority's signature and certificate chain, the [documentation](https://packages.sweber.dev/logarithm/docs) shows the `openssl ts -verify` command. The request and response handling was tested against a real OpenSSL time-stamping authority.

## Retention report for audits

Since 0.4.0, `applyRetention` and `eraseActor` record their own runs in the log. `retentionReport()` turns those entries into one row per run or erasure: what was deleted when, for which tenant, on what legal basis.

```ts
import { retentionReport, retentionReportCsv, retentionReportHtml } from "@weber-development/logarithm-retention"

const rows = await retentionReport(store, {
  legalBasis: { "bank-ag": "FINMA, 10 years", "*": "Contract, 13 months" },
})
const csv = retentionReportCsv(rows)
const html = retentionReportHtml(rows, { title: "Retention report 2026" }) // print to PDF from the browser
```

Values that start with `=`, `+`, `-` or `@` are neutralised in the CSV, so spreadsheets never run them as formulas, and the HTML page escapes everything.

## Update

Pro customers update the packages they use:

```bash
pnpm add @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest @weber-development/logarithm-export@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
