---
title: "Permito Pro 0.5.0: signed evidence export for the consent log"
excerpt: "The Permito Pro consent log can now export entries as NDJSON or CSV with a manifest and an HMAC signature, so an agency can hand over evidence and prove later that the file was not changed."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, consent log, evidence, GDPR, release]
---

Permito Pro 0.5.0 is out on GitHub Packages. It adds an evidence export to `@weber-development/permito-log`, the self-hosted consent log. Statistics tell a client how many visitors accept; an authority, a court or a lawyer asks a different question: show me what this site recorded, and prove it is what you recorded.

## Export a period

```ts
import { exportConsentLog } from "@weber-development/permito-log";

const { content, manifest } = await exportConsentLog(log.exportAll(), {
  format: "ndjson", // or "csv"
  from: new Date("2026-10-01"),
  to: new Date("2026-11-01"),
  signingKey: process.env.EXPORT_SIGNING_KEY,
});
```

NDJSON keeps every entry as it is stored, one per line. CSV has one column per category and service and opens in a spreadsheet; cells that a spreadsheet would read as a formula get an apostrophe prefix. Entries are sorted by time and ID, so the same data always gives the same file. As in the log itself, entries contain a visitor hash and no IP address.

## Prove it was not changed

The manifest records the entry count, the period, the first and last timestamp, the export time and the SHA-256 of the file. With a signing key of at least 32 characters it also carries an HMAC signature over those fields.

```ts
import { verifyConsentExport } from "@weber-development/permito-log";

verifyConsentExport(content, manifest, process.env.EXPORT_SIGNING_KEY);
// { valid: false, problems: ["content-changed"] }
```

The check reports `content-changed`, `manifest-changed` or `unsigned`. A signature shows that nobody changed the file after you exported it. It does not show that the entries in the store were never altered before the export. Keep the key apart from the exports.

## Upgrade

```bash
pnpm add @weber-development/permito-log@^0.5.0
```

All Permito Pro packages share the version number and now accept every Permito 0.x release as a peer. Permito Pro subscribers get the new version from the same GitHub Packages feed as before.

## What comes next

A one-command audit report that combines the configuration, the cookie table, a scan, catalog changes and the consent statistics, and a hash chain in the log that makes later changes in the store itself detectable.

Permito is technical consent infrastructure, not legal advice. Whether an export is sufficient evidence in a specific case is for your lawyer to judge.
