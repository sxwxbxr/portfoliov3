---
title: "Vector 0.2.0: Ed25519 signatures, SQLite and MySQL"
excerpt: "Vector can now sign webhooks with Ed25519, so your customers only hold a public key that cannot forge requests, and it keeps its data in SQLite or MySQL as well as PostgreSQL."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Standard Webhooks, Ed25519, SQLite, MySQL, release]
---

Vector 0.2.0 is out. It is the first feature update of the free library since the [0.1.0 launch](https://packages.sweber.dev/blog/vector-0-1-0-released). `@sweberdev/vector` 0.2.0 is on npm under the MIT licence.

## Ed25519: a public key for your customers

Until now every endpoint had a `whsec_` secret that Vector and the receiver share. That is the usual way to sign webhooks, but it has a catch: whoever can check a signature can also create one. If a customer's secret ends up in a log, a ticket or a frontend bundle, someone else can send them webhooks that look like yours.

The Standard Webhooks specification has an answer for that, and Vector now supports it: Ed25519 signatures, sent as `v1a`. Vector keeps a `whsk_` secret key, and your customer gets only the `whpk_` public key. A leaked public key lets nobody forge a request.

```ts
const vector = createVector({ store, signing: "ed25519" }) // or per endpoint

const endpoint = await vector.endpoints.create({ tenant: "acme", url, signing: "ed25519" })
const { publicKey } = await vector.endpoints.publicKey(endpoint.id) // whpk_...
```

On the receiving side nothing changes but the key: `verifyRequest(request, "whpk_...")`. Rotation works as before. During the grace period every request carries signatures from the old and the new key, and `publicKey()` also returns the previous key. Existing HMAC endpoints keep working, and one store can hold both kinds.

`vector keypair` on the command line, or `generateKeyPair()` in code, creates a key pair. Everything runs on the Web Crypto API, so it needs no native module and works on Node.js, Bun, Deno and edge runtimes.

## SQLite and MySQL

Vector 0.1.0 kept its data in memory or in PostgreSQL. 0.2.0 adds two stores.

- `@sweberdev/vector/sqlite` takes `DatabaseSync` from `node:sqlite` or a `better-sqlite3` database. It suits a single server, a small app or local development.
- `@sweberdev/vector/mysql` works with MySQL 8. It takes any `query` function, and `mysql2Query(pool)` adapts `mysql2` in one line.

```ts
import { DatabaseSync } from "node:sqlite"
import { createSqliteStore } from "@sweberdev/vector/sqlite"

const store = createSqliteStore({ database: new DatabaseSync("webhooks.db") })
await store.migrate()
const vector = createVector({ store })
```

Both are safe with several workers. Claiming due deliveries is a single statement, so no delivery is sent twice at the same time. Both run the same test suite as the PostgreSQL store, the MySQL one against a real MySQL 8.4 server in CI.

## Update

```bash
pnpm add @sweberdev/vector@^0.2.0
```

Nothing changes for existing code. HMAC stays the default, and the new options are optional. The [docs](https://packages.sweber.dev/vector/docs) have new guides for public-key signatures and for SQLite and MySQL.

Need a customer portal, a typed event catalog or alerts on top? See [Vector Pro](https://packages.sweber.dev/vector).
