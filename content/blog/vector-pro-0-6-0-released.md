---
title: "Vector Pro 0.6.0: OpenTelemetry for every webhook delivery"
excerpt: "The new vector-otel package turns each delivery attempt into an OpenTelemetry span and metrics, so your webhooks show up in Grafana, Datadog or Honeycomb next to the rest of your system."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, OpenTelemetry, Observability, release]
---

Vector Pro 0.6.0 is out, with a sixth package: `@weber-development/vector-otel`. It needs the free `@sweberdev/vector` [0.5](https://packages.sweber.dev/blog/vector-0-5-0-released) or later. All Vector Pro packages are now at 0.6.0 on GitHub Packages.

## Webhooks in the tools you already use

Vector's delivery log tells you what happened to one message. When a customer says "your webhooks are slow since Tuesday", you want the picture across all of them, next to your other services: how long do attempts take, which event types fail, which status codes come back. That is what OpenTelemetry is for.

```ts
import { metrics, trace } from "@opentelemetry/api"
import { instrument } from "@weber-development/vector-otel"

instrument(vector, {
  tracer: trace.getTracer("vector"),
  meter: metrics.getMeter("vector"),
})
```

Call it once, in the process that delivers. It uses whatever OpenTelemetry SDK your app already has, and it does not depend on one: the package describes the few API methods it needs itself, so it works with any version.

## What you get

Every attempt is a client span named `vector.deliver`, with the attempt's real start time and duration. The span carries the event type, the ids of message, delivery and endpoint, the number of the attempt, the HTTP status code and the host of the endpoint. A failed attempt has an error status with the reason, such as `HTTP 503` or `Timed out`, so it appears in your error views.

Metrics are the counter `vector.attempts` and the histogram `vector.attempt.duration` (milliseconds), labelled by event type, outcome and status code, plus the counter `vector.endpoints.disabled`.

## Secrets stay out by default

Webhook URLs often contain secrets: Slack's and Discord's URLs are the secret. So spans carry only host and port, not the URL. If you want the URL, you decide what to keep:

```ts
instrument(vector, { tracer, url: (url) => new URL(url).origin })
```

The tenant is left out as well, because tenant ids can be personal data and many different label values make metrics expensive. `includeTenant: true` turns it on.

## Update

```sh
pnpm add @weber-development/vector-otel
```

Customers with a Vector Pro licence find the package in the same private registry; it is covered by the licence you have. The [documentation](https://packages.sweber.dev/vector/docs) lists every attribute and option.
