---
title: "Vector 1.0.0: a self-hosted webhook library with a stable API"
excerpt: "Vector 1.0.0 is out. Signed webhooks with retries, a delivery log and your own database, now under semantic versioning: no breaking changes outside major versions."
date: 2026-10-07
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Svix alternative, "1.0", release]
---

Vector 1.0.0 is on npm as `@sweberdev/vector`. It has the same API as the 0.7.0 release candidate, so upgrading needs no code changes. What changes is the promise: from now on Vector follows semantic versioning, and the [stability rules](https://packages.sweber.dev/vector) apply.

## What 1.0 means

- **Breaking changes only in major versions.** That covers the exports and their types, documented options and defaults, the wire format, the command line and the event names.
- **The database only grows.** Within a major version, columns and indexes are added, never removed or changed, and `migrate()` is safe to run on every deploy. Old and new code can share one database during a rolling deploy.
- **Deprecations come first.** A feature is marked deprecated in a minor version and removed no earlier than the next major.
- **Receivers keep working.** Signatures follow Standard Webhooks (HMAC `v1`, Ed25519 `v1a`), so any Standard Webhooks or Svix library verifies them.

## What is in it

Vector is the part of a webhook service you would otherwise rent: it signs every request, retries eight times over about 27 hours, keeps a log of every message, delivery and attempt, refuses URLs that point into your own network, and rotates secrets without downtime. It keeps everything in your own PostgreSQL, MySQL or SQLite, has no dependencies, and runs on Node.js, Bun and Deno.

Since 0.1.0 it gained Ed25519 signatures, MySQL and SQLite stores, a `transform` hook for Slack, Teams and Discord formats, per-endpoint rate limits, an egress proxy, a `hold` hook for circuit breakers, `sendMany` for batches and receiver-side deduplication. The 1.0 documentation adds [Running Vector in production](https://packages.sweber.dev/vector): delivery guarantees, upgrades, retention, monitoring and what happens when a database or receiver is down.

## Vector Pro

Vector Pro, with the customer portal, event catalog, operations tooling, inbound webhooks, message formats and OpenTelemetry, is at 0.9.1 and works with Vector 1.0.0. Pro 1.0.0 follows once its licence texts are final.

Install with `npm install @sweberdev/vector`. The source and documentation are at [packages.sweber.dev/vector](https://packages.sweber.dev/vector).
