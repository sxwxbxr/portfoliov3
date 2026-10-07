---
title: "Logarithm Pro 0.9.1 released"
excerpt: "A security review of the Pro packages found two problems in export. An evidence pack with its signature removed no longer passes verification, and the download endpoint rejects odd format names."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, security, release]
---

Logarithm Pro 0.9.1 is out and available to all Pro customers. The free packages stay at 0.7.0. Please update, because this is a security fix.

Before 1.0 we reviewed the Pro packages for the usual weak spots: spreadsheet formula injection in CSV exports, how webhook signatures are compared, HTML escaping in the retention report, request signing for S3, error messages that could leak URLs, and tenant scoping of the export endpoint. Most of it held up. Two things did not.

## An evidence pack could lose its signature

`verifyEvidencePack(files, { signingKey })` re-computes the hashes of a pack and, with the key, checks the signature of its manifest. Someone who can change the files can also rewrite the manifest, and if they simply remove the signature from it, the check had nothing to compare and the pack passed. With a key, verification now fails a pack that carries no signature (`the pack is not signed`).

If you verify with a key and see this message on packs you built yourself, check whether they were built without `signingKey`.

## The download endpoint accepted odd format names

`createExportHandler` checked the `format` parameter with an `in` test, which also matches names from the object prototype, so `?format=constructor` got past the check and produced a download with a broken content type. It was not a way to read other tenants' data, and the endpoint is read-only and scoped to the tenant that `authorize` returns, but it was wrong. Only `csv`, `ndjson` and `json` are accepted now, everything else answers `400`.

## Update

```bash
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
