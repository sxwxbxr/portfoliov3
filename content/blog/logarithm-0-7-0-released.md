---
title: "Logarithm Pro 0.7.0 released"
excerpt: "Elasticsearch, OpenSearch and Grafana Loki sinks, plus retries with exponential backoff and a dead-letter queue so a SIEM outage no longer costs you audit events."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, SIEM, Elasticsearch, Loki, release]
---

Logarithm Pro 0.7.0 is out and available to all Pro customers. The free packages stay at 0.4.0. Nothing breaks: 0.6.0 code keeps working as it is.

Security teams want audit events in their SIEM, and they want them reliably. This release adds two more destinations and makes every destination robust against outages.

## Elasticsearch, OpenSearch and Loki

```ts
import { elasticSink, lokiSink } from "@weber-development/logarithm-export"

elasticSink({ url: "https://es.example.ch:9200", index: "audit-log", apiKey: process.env.ES_KEY! })
lokiSink({ url: "https://loki.example.ch/loki/api/v1/push", orgId: "acme", labels: { env: "prod" } })
```

`elasticSink` uses the `_bulk` API with the event id as document id, so a redelivery never creates duplicates. It also reports item errors that Elasticsearch hides inside a 200 response, which a naive status check would miss. `lokiSink` writes one JSON line per event, with nanosecond timestamps and the action as a label. Both work with basic auth, API keys or bearer tokens, and with your own `fetch`.

## Retries and dead letters

A SIEM that is down for ten minutes used to mean ten minutes of missing events. `withRetry` wraps any sink, including the existing Splunk, Datadog and webhook sinks:

```ts
const siem = withRetry(splunkSink({ url, token }), {
  attempts: 5,
  deadLetter: (letter) => saveDeadLetter(letter), // { sink, events, error, failedAt }
})

// from a cron job
const stillFailing = await replayDeadLetters(await loadDeadLetters(), siem)
```

It retries with exponential backoff and jitter. Refused requests, such as a wrong token (4xx except 408 and 429), are not retried, because waiting does not fix them. After the last attempt the events go to your `deadLetter` callback and the error is still thrown, so `onError` of `withForwarding` hears of it. `replayDeadLetters` sends them again and returns the ones that still fail.

## Update

```bash
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
