---
title: "Logarithm 0.5.0 released"
excerpt: "A conformance suite so your own audit-log store behaves exactly like the built-in ones, a verified WCAG AA contrast for the viewer, and new guides for migrations, Drizzle and Prisma."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, TypeScript, accessibility, release]
---

Logarithm 0.5.0 is out. `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm. Nothing breaks: 0.4.0 code keeps working as it is. (Logarithm Pro has its own version numbers and is at 0.7.0.)

## A conformance suite for your own store

Logarithm ships stores for Postgres, MySQL, MariaDB and SQLite, and `AuditStore` is a small interface if you need another database. The hard part is not the interface, it is the details: newest-first ordering, paging across events in the same millisecond, tenant isolation, searches that treat `%` and `_` literally. `@sweberdev/logarithm/testing` now ships the same checks the built-in stores run:

```ts
import { storeConformanceChecks } from "@sweberdev/logarithm/testing"
import { describe, it } from "vitest" // or jest, node:test

describe("my store", () => {
  for (const check of storeConformanceChecks) {
    it(check.name, () => check.run(async () => {
      await truncateTable()
      return myStore(client)
    }))
  }
})
```

A failing check names what differed. A store that ignores tenants, for example, fails "isolates tenants", which is exactly the bug that would leak one customer's audit log to another. Without a test runner, `runStoreConformance(factory)` returns the list of failures.

## Contrast you can rely on

The viewer's default stylesheet is now checked by a test: every text and background colour pair in the light and the dark theme meets the WCAG AA contrast of 4.5:1. The docs describe the theming variables, the keyboard and screen reader behaviour, and what to keep in mind when you change the colours.

## Guides for migrations, Drizzle and Prisma

- [Migrations and upgrades](https://packages.sweber.dev/logarithm/docs): the idempotent `migrate*` functions, how to put the SQL into your own migration tool, and what to do with very large tables.
- [Drizzle and Prisma](https://packages.sweber.dev/logarithm/docs): share your connection pool with Logarithm and keep the audit table in your ORM's migration history.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```
