---
title: "Permito Pro 0.6.0: one audit report for consent setup, scan, catalog and log"
excerpt: "Permito Pro 0.6.0 adds buildAuditReport: one German or English report as Markdown and HTML that combines configuration, site scan, catalog freshness and the evidence export, and marks everything it did not check."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, audit, GDPR, release]
---

Permito Pro 0.6.0 is out on GitHub Packages. The scanner package gets `buildAuditReport`. Until now the configuration, the scan, the catalog and the consent log each produced their own output. A data protection officer or a client wants one document that says what was checked and what is open.

## One function, one document

```ts
import { analyze, buildAuditReport, buildReport, scan } from "@weber-development/permito-scanner";
import { exportConsentLog } from "@weber-development/permito-log";

const observation = await scan("https://example.ch");
const evidence = await exportConsentLog(records, { signingKey });

const report = buildAuditReport({
  site: "https://example.ch",
  language: "en", // or "de"
  config: consentConfig,
  scan: buildReport(observation, analyze(observation, consentConfig, { catalog })),
  catalog: usedCatalogEntries,
  evidence: evidence.manifest,
});

report.status; // "ok" | "attention" | "incomplete"
report.markdown; // or report.html
```

The report lists the categories and services of the configuration, the pages that were loaded, what the scan found outside the configuration or before consent, catalog entries that are older than a year (you can change the limit) or have no check date, and the manifest of the evidence export with its hash and whether it is signed.

## Nothing is hidden

Every part is optional. A part you leave out appears as "not checked", and the status becomes `incomplete`. A report that only looks at the scan cannot be mistaken for a full review. Names that come from the scanned page are escaped in Markdown and HTML.

The function is pure: no network, no file access, no dependency between the packages. You decide where the inputs come from and where the report goes.

## Upgrade

```bash
pnpm add @weber-development/permito-scanner@^0.6.0
```

All Permito Pro packages share the version number. Permito Pro subscribers get the new version from the same GitHub Packages feed as before.

## What comes next

A hash chain in the consent log that makes later changes in the store itself detectable, and a service catalog in more languages.

The report states what was checked. It is not legal advice and makes no legal statement.
