---
title: "Vector Pro 1.0.0: customer portal, operations and inbound webhooks with a stable API"
excerpt: "Vector Pro 1.0.0 brings all six packages to a stable API: customer portal, event catalog, operations tooling, inbound webhooks, message formats and OpenTelemetry. The licence terms are final."
date: 2026-10-07
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, "1.0", release]
---

Vector Pro 1.0.0 is out. All six packages are at 1.0.0 on GitHub Packages, one day after [Vector 1.0.0](https://packages.sweber.dev/blog/vector-1-0-0-released). The API is the one from 0.9.x, so upgrading needs no code changes.

## What 1.0 means for Pro

The same rules as the free package now apply to every Pro package: breaking changes only in major versions, deprecations announced one minor version ahead, and no change to documented behaviour within a major version. The Pro packages share one version number and are released together; Pro 1.x works with Vector 1.x.

The licence terms are final as well (version 1.0). They are per person, with no licence key and no phone-home, and versions you have installed keep working after a subscription ends.

## What is in the six packages

- **vector-portal**: an embeddable customer portal. A tenant-scoped REST handler with adapters for Fetch frameworks, Node, Express, Hono and Fastify, plus React components for endpoints, secrets, a searchable message log, retries, test events and the event catalog.
- **vector-catalog**: a typed event catalog that validates payloads with any Standard Schema library before sending and generates Markdown docs, an AsyncAPI 3 file and TypeScript types for receivers.
- **vector-ops**: failure-rate alerts, a circuit breaker for endpoints that are down, weekly reports per tenant, bulk recovery after an outage, health reports, Prometheus metrics and data retention.
- **vector-inbound**: verified inbound webhooks from Stripe, GitHub, Shopify, Polar, GitLab, Paddle, Linear, Sentry, Lemon Squeezy and any Standard Webhooks or HMAC source, stored once and forwarded through Vector's queue.
- **vector-transform**: message formats for Slack, Teams, Discord and Google Chat from templates.
- **vector-otel**: OpenTelemetry traces and metrics for every delivery.

Pricing is unchanged. Details and checkout are on the [Vector page](https://packages.sweber.dev/vector).
