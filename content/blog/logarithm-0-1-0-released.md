---
title: "Logarithm 0.1.0 released"
excerpt: "A self-hosted audit log for SaaS apps: who changed what, and when. Field-level diffs in your own Postgres or SQLite, and a ready React view for your customers' admins."
date: 2026-10-05
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, Postgres, SQLite, React, release]
---

Logarithm 0.1.0 is out. It is an audit log you add to your SaaS app with one call, stored in your own database. `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm under the MIT licence.

## Why

Sooner or later a B2B customer asks who changed what in their account, and security questionnaires, ISO 27001 and SOC 2 audits ask the same. Logarithm records it: actor, action, targets and a field-level diff computed from the state before and after. Passwords, tokens and card numbers are never stored, also inside nested objects. There is no external service involved.

## What is in 0.1.0

- Record events in one call, with a field-level diff from `before` and `after`.
- Passwords, tokens, API keys and card numbers stored as `[redacted]`, also in nested objects and metadata.
- Stores for Postgres 13+ (also Neon and Supabase) and SQLite (better-sqlite3, `node:sqlite`, Bun), or your own.
- Multi-tenant by default: a scoped log cannot read other tenants.
- Filters by actor, action prefix, target, time and text, with keyset paging.
- A Fetch API handler for Next.js, Remix, Hono and Workers, with your own access check.
- A React activity view for your customers' admins, with search, filters, day groups and diffs, in English and German.

## Install

```bash
pnpm add @sweberdev/logarithm @sweberdev/logarithm-react
```

Record a change where it happens:

```ts
import { createAuditLog } from "@sweberdev/logarithm"
import { postgresStore } from "@sweberdev/logarithm/postgres"

const audit = createAuditLog({ store: postgresStore({ client: pool }) })

await audit.with({ tenantId: org.id, actor: { id: user.id, name: user.name } }).record({
  action: "project.updated",
  targets: [{ type: "project", id: project.id, name: project.name }],
  before: project, // { plan: "free", smtpPassword: "…" }
  after: updated,  // diff: plan free → pro, smtpPassword [redacted]
})
```

See the activity view in the [live demo](https://packages.sweber.dev/logarithm/demo). The full reference is at [packages.sweber.dev/logarithm/docs](https://packages.sweber.dev/logarithm/docs).

## Logarithm Pro

Logarithm Pro is available for teams with stricter requirements. It adds tamper evidence with an HMAC hash chain per tenant and a verifier that names changed, removed or reordered events, retention periods per customer with archiving and erasure and access requests under the GDPR and the Swiss FADP, streamed CSV, NDJSON and JSON exports, and forwarding to signed webhooks, Splunk and Datadog.

Plans start at CHF 29 per month, and every version you received keeps working after you cancel. Try the [Pro demo](https://packages.sweber.dev/logarithm/demo) and see all plans on the [package page](https://packages.sweber.dev/logarithm).
