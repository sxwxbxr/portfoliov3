---
title: "Logarithm 0.4.0 released"
excerpt: "French and Italian for the activity log, and in Logarithm Pro an S3 and Cloudflare R2 archive for expired events plus log entries that prove your retention policy and erasures actually ran."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, GDPR, Swiss FADP, release]
---

Logarithm 0.4.0 is out. `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm, and the Logarithm Pro packages are updated for all customers. Nothing breaks: 0.3.0 code keeps working as it is.

## French and Italian

Switzerland has four languages, and your customers' admins read the activity log in theirs. The React views now ship `fr` and `it` labels next to `en` and `de`, and `describeAction()` builds the sentences with the right quotation marks:

```tsx
<AuditLog locale="fr-CH" nouns={{ project: "le projet" }} fetcher={fetchEvents} />
// Anna Muster a modifié le projet « Website »
```

```ts
describeAction(event, { locale: "it-CH", nouns: { project: "il progetto" } })
// "ha modificato il progetto «Website»"
```

French and Italian nouns need their article (`le projet`, `il progetto`), so you pass them with `nouns`. The [React guide](https://packages.sweber.dev/logarithm/docs) has the details, and the [live demo](https://packages.sweber.dev/logarithm/demo) now switches between all four languages.

## Logarithm Pro 0.4.0

- **Archive to S3 or Cloudflare R2.** `s3Archive()` writes every batch of expired events as gzipped NDJSON before they are deleted. It works with AWS S3, R2, Exoscale, Infomaniak, MinIO and other S3-compatible stores, signs requests with Web Crypto and needs no AWS SDK. A failed upload throws, so nothing is deleted without its archive.
- **Proof that retention ran.** Pass your audit log as `recordTo` and `applyRetention` records `audit_log.retention_applied` per tenant, while `eraseActor` records `audit_log.actor_erased` with the pseudonym, never the original id. When an auditor asks whether your deletion periods are applied, the log answers.

```ts
const archive = s3Archive({
  bucket: "audit-archive",
  endpoint: `https://${process.env.R2_ACCOUNT}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_KEY!,
  secretAccessKey: process.env.R2_SECRET!,
})

await applyRetention(store, tenantIds, { keep: "13m", archive, recordTo: audit })
```

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Pro customers update `@weber-development/logarithm-retention` the same way. Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
