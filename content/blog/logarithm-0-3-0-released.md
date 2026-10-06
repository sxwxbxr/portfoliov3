---
title: "Logarithm 0.3.0 released"
excerpt: "Counts and breakdowns for dashboards, typed action catalogs, a MySQL and MariaDB store, and in Logarithm Pro alerts to Slack and Teams plus anomaly detection for unusual exports, deletions and failed logins."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, MySQL, Slack, release]
---

Logarithm 0.3.0 is out. `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm, and the Logarithm Pro packages are updated for all customers. Nothing breaks: 0.2.0 code keeps working as it is.

## Counts for dashboards

"How many logins today?" used to mean loading events and counting them yourself. `audit.count()` takes the same filters as `query()` and counts in the database. With `groupBy` it returns a breakdown per day, action or actor:

```ts
const total = await audit.count({ action: "user.login", from: startOfMonth })

const perDay = await audit.count({ action: "user.login", groupBy: "day" })
// [{ key: "2026-10-05", count: 412 }, { key: "2026-10-06", count: 388 }]
```

A log scoped with `with({ tenantId })` only counts that tenant.

## Typed action catalogs

Pass your actions as a type and TypeScript catches misspelled action names and wrong metadata at compile time, in `record()`, `query()` and `count()`. It is types only, with zero runtime cost:

```ts
type Actions = {
  "user.login": { method: "password" | "sso" }
  "project.deleted": { name: string }
}

const audit = createAuditLog<Actions>({ store })

await audit.record({ action: "project.deleted", metadata: { name: "Website" } })
await audit.record({ action: "project.delete" }) // compile error
```

## MySQL and MariaDB

`@sweberdev/logarithm/mysql` joins the Postgres and SQLite stores. It works with `mysql2`, the `mariadb` driver or any client with `query(sql, values)`, and the shared store tests run in CI against real MySQL 8.4 and MariaDB 11.4 servers. See the [MySQL guide](https://packages.sweber.dev/logarithm/docs).

## Logarithm Pro 0.3.0

- **Slack and Teams alerts.** `slackSink()` and `teamsSink()` post selected events, filtered with patterns like `api_key.*` or `*.deleted`, to an incoming webhook. User content is escaped, so a name like `<!channel>` pings nobody, and errors never include the webhook URL.
- **Anomaly detection.** `detectAnomalies()` runs from cron and alerts your team when an actor exports, deletes or fails to log in far more often than usual within a time window, counted per tenant. Thresholds are configurable; the defaults are 10 exports, 25 deletions and 5 failed logins per hour. With `record: true` each alert is also stored in the audit log and not sent twice.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Pro customers update `@weber-development/logarithm-export` the same way. Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
