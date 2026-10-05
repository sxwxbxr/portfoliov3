---
title: "Logarithm 0.2.0 released"
excerpt: "Request context in one line, a compact activity feed for dashboards, and in Logarithm Pro signed checkpoints and legal holds."
date: 2026-10-05
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, React, release]
---

Logarithm 0.2.0 is out. `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm, and the Logarithm Pro packages are updated for all customers.

## Request context in one line

Every event can carry the client IP, the browser, a request id and a location. Until now you read those from the headers yourself. `contextFromRequest()` does it from the usual proxy headers of Vercel, Cloudflare, Nginx and AWS, including city and country:

```ts
import { contextFromRequest } from "@sweberdev/logarithm"

const log = audit.with({
  tenantId: session.orgId,
  actor: { id: session.userId, name: session.name },
  context: contextFromRequest(request),
})
```

It also accepts a `Headers` object, e.g. from a Next.js server action. Without a proxy in front of your app, pass `{ trustProxy: false }` so clients cannot forge their IP.

## Activity feed

`<ActivityFeed>` shows the latest events as a short list with relative times ("5 minutes ago", "vor 5 Minuten") and a link to the full log. It fits a dashboard or a project page and uses the same endpoint and stylesheet as `<AuditLog>`:

```tsx
<ActivityFeed endpoint="/api/audit" limit={5} href="/settings/activity" locale="de-CH" />
```

With `scope={{ targetId: project.id }}` it shows the activity of one object. Try it in the [live demo](https://packages.sweber.dev/logarithm/demo).

## Logarithm Pro 0.2

- **Checkpoints.** The hash chain shows changed and removed events, but not whether someone deleted the newest events or rebuilt the whole chain. `createCheckpoint()` signs the chain head. Keep checkpoints outside the database, e.g. daily in object storage, and `verifyIntegrity({ checkpoints })` reports both cases.
- **Legal holds.** During litigation or an authority's request, data must be kept beyond its retention period. `applyRetention` and `eraseActor` now take `holds: { tenants, actors }`: tenants on hold are skipped, nothing about a person on hold is deleted, and their erasure is refused until the hold is lifted.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Pro customers update `@weber-development/logarithm-integrity` and `@weber-development/logarithm-retention` the same way. The guides are at [packages.sweber.dev/logarithm/docs](https://packages.sweber.dev/logarithm/docs), plans on the [package page](https://packages.sweber.dev/logarithm).
