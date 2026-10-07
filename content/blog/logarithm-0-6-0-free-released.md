---
title: "Logarithm 0.6.0 released"
excerpt: "The table layout gets a version number, so a rollback can no longer run old code against a newer table. Plus framework recipes, a security chapter and timings from a 10 million event load test."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, Postgres, performance, release]
---

Logarithm 0.6.0 is out on npm as `@sweberdev/logarithm` and `@sweberdev/logarithm-react`, with provenance. The Pro packages stay at 0.9.0. Nothing breaks: existing tables keep working, and the next `migrate*` run adds one small table.

## A version for the table layout

The audit table has not changed since 0.1, but 1.0 is the point where it has to be able to. `migratePostgres`, `migrateMysql` and `migrateSqlite` now record a schema version in a small `<table>_meta` table. If a database was created by a newer release than the code that runs, `migrate*` stops with a `SchemaVersionError` instead of carrying on. The typical case is a rollback: you deploy the previous version of your app, and it would otherwise run against a table that a newer Logarithm has changed.

```ts
import { migratePostgres, postgresSchemaVersion } from "@sweberdev/logarithm/postgres"

await migratePostgres({ client: pool }) // throws SchemaVersionError if the table is newer
await postgresSchemaVersion({ client: pool }) // 1
```

If you keep the schema in your own migration tool, regenerate it with `postgresSchema()`, `mysqlSchema()` or `sqliteSchema()`: the output now includes the meta table.

## What 10 million events cost

We load-tested the SQLite store with 10 million events in a 6.6 GB file. The default viewer queries (newest events of a tenant, next page, last seven days) stay below one millisecond. Filtering by actor, action or text within one tenant of 50,000 events takes about 100 milliseconds, because it reads through that tenant's events. Writes ran at about 10,000 events per second. The new [performance guide](https://packages.sweber.dev/logarithm/docs) has the full table, the script to measure your own setup, and the one index to add if single tenants grow to millions of events.

## More docs for 1.0

A guide for Hono, Remix, Express, Fastify and Cloudflare Workers, a chapter on the security model (what is isolated, what gets stored, where tamper evidence starts and ends, how to report a problem), and an API reference that says what is supported.

## Towards 1.0

A few undocumented helpers were exported by accident: `DEFAULT_LIMIT`, `MAX_LIMIT`, `encodeCursor`, `decodeCursor`, `toStoreQuery`, `toStoreFilter`, `sortGroups` and, in the React package, `relativeTime`. They are marked `@deprecated` now and will leave the public exports in 0.9, when the API freezes. If your code uses one, tell us before then.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Logarithm is on the [package page](https://packages.sweber.dev/logarithm).
