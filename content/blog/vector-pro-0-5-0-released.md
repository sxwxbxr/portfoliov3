---
title: "Vector Pro 0.5.0: a circuit breaker and weekly reports per tenant"
excerpt: "vector-ops now stops hammering endpoints that are down and probes them until they recover, and it sends your customers a weekly report on how their webhooks performed."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Operations, Circuit breaker, release]
---

Vector Pro 0.5.0 is out. The operations package `@weber-development/vector-ops` gets two features that production teams usually build themselves, late and under pressure. All Vector Pro packages are now at 0.5.0 on GitHub Packages and accept `@sweberdev/vector` up to [0.5](https://packages.sweber.dev/blog/vector-0-5-0-released).

## A circuit breaker per endpoint

```ts
import { createCircuitBreaker } from "@weber-development/vector-ops"

const breaker = createCircuitBreaker({
  failureThreshold: 5,
  cooldownSeconds: 60,
  onChange: (change) => notifyTeam(change.to, change.url),
})
const vector = createVector({ store, hold: breaker.hold })
breaker.attach(vector)
```

After five failed attempts in a row the circuit opens. Deliveries to that endpoint wait for the cooldown instead of burning their retries. Then one delivery goes out as a probe. If the server answers, the circuit closes and the backlog flows. If not, it opens again with twice the cooldown, up to 15 minutes.

Held deliveries stay pending, are not counted as attempts and do not count towards disabling the endpoint, so a short outage no longer ends with failed deliveries and a disabled endpoint. Only failures that say the server is unavailable count: no answer, timeouts, `408`, `429` and `5xx`. A `400` means the server is up and refused one message.

The state is kept in memory of the delivering process. With several workers each one learns for itself.

## Weekly reports per tenant

```ts
import { sendTenantReports } from "@weber-development/vector-ops"

await sendTenantReports(vector, {
  since: new Date(Date.now() - 7 * 86_400_000),
  send: async ({ tenant, subject, text, html }) => {
    await transporter.sendMail({ to: await emailOf(tenant), from: "reports@example.com", subject, text, html })
  },
})
```

Run it from a weekly cron job. Every tenant with webhook traffic gets an email with deliveries attempted, success rate, failed attempts and response times, each compared with the week before, the endpoints that need attention with their last error, and the most frequent errors. Tenants without traffic are skipped, and one failing tenant does not stop the others.

The email is yours to send, so wording, language and recipients stay under your control. For a single tenant, `tenantReport` returns the numbers and `renderReport` the subject, text and HTML.

## Also in this release

- The health report lists the most frequent errors (`totals.topErrors`).
- All Pro packages accept `@sweberdev/vector` 0.1 up to 0.5.

## Update

```sh
pnpm add @weber-development/vector-ops@latest
```

Customers with a Vector Pro licence find the new version in the same private registry. The circuit breaker needs `@sweberdev/vector` 0.5; everything else works with older versions. Details are in the [documentation](https://packages.sweber.dev/vector/docs).
