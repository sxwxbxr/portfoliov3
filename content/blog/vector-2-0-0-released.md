---
title: "Vector 2.0.0: ordered delivery, payload filters and replay"
excerpt: "Vector 2.0.0 adds per-key ordered delivery, payload filters on endpoints, replay of a time range, pruning of old messages and a versioned database schema. Node.js 22 is the new minimum."
date: 2026-10-12
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Svix alternative, "2.0", release]
---

Vector 2.0.0 is on npm as `@sweberdev/vector`. The sending API of 1.x keeps working; what is new is ordering, filtering and recovery, and a database schema that knows its own version.

## What is new

- **Ordered delivery per key.** Give related messages the same `orderingKey`, for example an order id. For each endpoint and key, Vector delivers the next message only after the earlier ones have succeeded, failed for good or been cancelled. A message that keeps failing delays later messages of the same key, but never other keys.
- **Payload filters on endpoints.** An endpoint can say `{ path: "amount", op: "gte", value: 1000 }` on top of its event types. Operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `exists`, `prefix`, `contains`, combined with `and`, `or`, `not`. Invalid filters are rejected when the endpoint is saved.
- **Replay.** `vector.replay({ tenant, from, to })` sends the stored messages of a time range again, oldest first, as new deliveries. It respects event types and filters and needs an explicit tenant, so a range never crosses customers.
- **Prune.** `vector.prune({ olderThan })` deletes old messages with their deliveries and attempts in batches, on every store. Messages that still wait for a delivery are kept.
- **A versioned schema.** The database records its schema version. `store.migrate()` upgrades a 1.x database in place, adds the new columns and index, and is safe on every deploy; `store.schemaVersion()` tells you where you are.

## Breaking changes

- **Node.js 22 or newer.** Node 20 is end of life.
- **Schema version 2.** Run `await store.migrate()` once after updating. The new columns are nullable, so 1.x workers can keep running during a rolling deploy. If you maintain your own migrations from the SQL helpers, those helpers describe a fresh install; add the three columns or call `migrate()`.
- **New fields on stored objects.** `Endpoint.filter`, `Message.orderingKey` and `Delivery.orderingKey` are always present (`null` by default). Hand-built fixtures need them.
- **Custom stores** must implement `deleteMessagesBefore` and `schemaVersion` and honour the ordering rule when claiming deliveries. The built-in memory, PostgreSQL, MySQL and SQLite stores do.

## Upgrading

1. `npm install @sweberdev/vector@2` and use Node.js 22.
2. Deploy once so that `await store.migrate()` runs.
3. Update the Pro packages to 2.x together if you use them.

The [migration guide](https://packages.sweber.dev/vector/docs/migrating-to-2) lists every step. Vector 1.x gets security and bug fixes for 12 months from today. The ordered claim query on MySQL is covered by the existing integration job but has not been run under heavy parallel load; the demo at [packages.sweber.dev/vector/demo](https://packages.sweber.dev/vector/demo) now shows ordering with a failing receiver.
