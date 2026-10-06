---
title: "Vector 0.1.0 released"
excerpt: "Self-hosted webhooks for Node.js and TypeScript: Standard Webhooks signatures, retries for 27 hours, a delivery log and SSRF protection, in your own PostgreSQL. A Svix alternative as a library."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Standard Webhooks, Svix alternative, PostgreSQL, TypeScript, release]
---

Vector 0.1.0 is out. It sends, retries, logs and verifies the webhooks your product sends to its customers. `@sweberdev/vector` is on npm under the MIT licence and has no dependencies.

## Why

Sooner or later every SaaS product sends webhooks. Doing it properly takes more than a `fetch`:

- every request has to be signed;
- a receiver that is down needs retries for hours, with backoff;
- support needs a log it can read;
- URLs that point into your own network must be refused;
- secrets have to be rotated without downtime.

Hosted services such as Svix or Hookdeck do this from several hundred dollars a month, and every event and customer URL passes through their infrastructure.

Vector is the same building block as a library. It runs inside your application and keeps its data in your own database.

## What is in 0.1.0

- Signatures in the [Standard Webhooks](https://www.standardwebhooks.com) format that Svix uses: HMAC-SHA256 in `webhook-id`, `webhook-timestamp` and `webhook-signature`. Receivers can verify with any Standard Webhooks or Svix library.
- `verify()` and `verifyRequest()` for the receiving side, with replay protection. They accept `svix-*` headers too.
- Endpoints per tenant with event type filters (`invoice.*`), custom headers and their own secret. Secret rotation keeps a grace period during which both secrets sign.
- Eight attempts over about 27 hours with exponential backoff, jitter, `Retry-After` and timeouts. Dead endpoints are disabled automatically, also on `410 Gone`.
- A log of every message, delivery and attempt with status code and response. A delivery can be retried and a message resent with one call.
- SSRF protection: no localhost, private networks or cloud metadata. URLs are checked when an endpoint is created and again before every attempt, so DNS rebinding does not get through.
- Idempotency keys, test events and an `envelope: false` option that sends the bare payload, as Svix does.
- Stores:
  - an in-memory store;
  - a PostgreSQL store that works with pg, postgres.js, Neon, Supabase and PGlite and is safe with several workers;
  - the `VectorStore` interface for anything else.
- The `vector` CLI to generate secrets, sign, verify, send test events and receive webhooks locally.

## Install

```bash
pnpm add @sweberdev/vector
```

```ts
import { createVector } from "@sweberdev/vector"
import { createPostgresStore } from "@sweberdev/vector/postgres"

const vector = createVector({
  store: createPostgresStore({ query: (text, params) => pool.query(text, params) }),
})

await vector.endpoints.create({ tenant: "acme", url: "https://example.com/webhooks", eventTypes: ["invoice.*"] })
await vector.send({ tenant: "acme", eventType: "invoice.paid", payload: { invoiceId: "inv_123" } })
vector.start()
```

On serverless platforms, call `vector.process()` from a cron route instead of `start()` and send with `deliverNow: true`.

The [live demo](https://packages.sweber.dev/vector/demo) runs the real package in your browser. It signs and verifies a webhook, delivers to a flaky endpoint with retries, and shows which URLs the SSRF guard refuses. The guides and the API reference are at [packages.sweber.dev/vector/docs](https://packages.sweber.dev/vector/docs).

## Vector Pro

Vector Pro adds the parts you would otherwise build next:

- `vector-portal` is an embeddable portal where your customers manage their own endpoints, read the delivery log, retry, rotate secrets and send test events. It ships as a REST handler scoped to one tenant plus React components.
- `vector-catalog` is a typed event catalog. It validates payloads with any Standard Schema library before sending and generates Markdown docs, an AsyncAPI 3 file and TypeScript types for your customers.
- `vector-ops` sends alerts to Slack, email or a webhook. It also handles bulk recovery after an outage, health reports, Prometheus metrics and data retention.

Licences start at 29 CHF a month for one person, with no licence key and no phone-home. See the [package page](https://packages.sweber.dev/vector) for all plans.
