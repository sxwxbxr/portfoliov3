---
title: "Logarithm Pro 0.6.0 released"
excerpt: "One evidence pack for auditors: events, integrity report, timestamped checkpoints and the retention report with a signed manifest of SHA-256 hashes, as a single ZIP."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, ISO 27001, SOC 2, release]
---

Logarithm Pro 0.6.0 is out and available to all Pro customers. The free packages stay at 0.4.0. Nothing breaks: 0.5.0 code keeps working as it is.

## The evidence pack

When an auditor from ISO 27001, SOC 2 or a financial supervisor asks about your audit log, they want the same things every time: the events, proof that the log was not changed, and proof that your retention rules ran. Until now you had to collect these yourself. `buildEvidencePack()` puts them in one package:

```ts
import { buildEvidencePack, verifyEvidencePack, zipFiles } from "@weber-development/logarithm-export"

const { files } = await buildEvidencePack(store, {
  tenantId: "acme",
  from: "2026-01-01T00:00:00Z",
  title: "Audit evidence Q1 to Q3 2026",
  integrity: await verifyIntegrity(store, { key, tenantId: "acme", checkpoints }),
  checkpoints, // with trusted timestamps from 0.5.0
  retention: { csv: retentionReportCsv(rows), html: retentionReportHtml(rows) },
  signingKey: key,
})
const zip = zipFiles(files) // one download, application/zip
```

The pack contains the events as CSV and NDJSON, the integrity report, the checkpoints, the retention report and a `manifest.json`. The manifest lists every file with its size and SHA-256, plus tenant, period and event count. With a `signingKey` it also carries an HMAC signature, so a changed manifest is detected too.

`verifyEvidencePack(files, { signingKey })` re-computes every hash and tells you which file was changed, is missing or was added. An auditor does not need your software: `sha256sum` against the manifest is enough. You can add your own files, such as policies or notes, with `extra`.

## Update

```bash
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
