---
title: "Vector Pro 0.3.0: inbound webhooks from Stripe, GitHub and Shopify"
excerpt: "The new vector-inbound package verifies webhooks you receive from Stripe, GitHub, Shopify, Svix-based services and HMAC-signed APIs, stores each event once and forwards it to your services with retries and a log."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Stripe, GitHub, Shopify, Inbound webhooks, release]
---

Vector Pro 0.3.0 is out, with a fourth package: `@weber-development/vector-inbound`. Until now Vector was about the webhooks you send. This release covers the webhooks you receive. All Vector Pro packages are now at 0.3.0 on GitHub Packages and work with the free `@sweberdev/vector` 0.1 and [0.2](https://packages.sweber.dev/blog/vector-0-2-0-released).

## The problem with handling webhooks in a route

The usual Stripe or GitHub webhook handler verifies the signature, does the work and answers 200. That has two weak spots.

- **Failures after the 200 are lost.** Once you answer, the provider stops retrying. If your code then fails, the event is gone unless you notice and replay it by hand.
- **Slow handlers cause retries.** If the work takes longer than the provider waits, it retries while the first attempt is still running, and you process the event twice.

`vector-inbound` splits the two. The route only verifies the request and stores the event, which takes a few milliseconds. The work happens behind Vector's queue.

## How it works

```ts
import { createInbound, github, stripe } from "@weber-development/vector-inbound"

export const inbound = createInbound(vector, {
  sources: {
    stripe: stripe({ secret: process.env.STRIPE_WEBHOOK_SECRET! }),
    github: github({ secret: process.env.GITHUB_WEBHOOK_SECRET! }),
  },
})

// app/webhooks/[source]/route.ts
export const POST = (request: Request) => inbound.handler(request)
```

Every request is checked with the provider's own signature scheme. A verified event is stored once, keyed by the provider's event id, so a retry from Stripe never creates a second message. Then the provider gets its 200.

The event is now an ordinary Vector message with a type such as `stripe.invoice.paid` or `github.pull_request.opened`. Your services subscribe to it like any other webhook endpoint:

```ts
await vector.endpoints.create({
  tenant: "inbound",
  url: "https://billing.internal.example.com/events",
  eventTypes: ["stripe.invoice.*"],
})
```

From there Vector does what it does for outgoing webhooks:

- up to eight attempts over about 27 hours;
- a log of every attempt;
- retry and replay with one call;
- alerts from Vector Pro when a service stays down.

Each forwarded request is signed in the Standard Webhooks format, so every internal service verifies one format, whatever the provider.

## Supported providers

- **Stripe**, with timestamp tolerance and several secrets while you roll one. The check is tested against Stripe's own library.
- **GitHub**: the event type combines the event and its action, e.g. `pull_request.opened`.
- **Shopify**: topics such as `orders/create` become `orders.create`.
- **Standard Webhooks**, which covers Svix and every service that sends through it, such as Clerk and Resend. Public-key (`whpk_`) signatures work too.
- **Any HMAC-signed API**, through `hmacSource()`. You choose the header, the algorithm, the encoding, an optional signed timestamp and where the event type comes from.

Express works too, with `express.raw()` and `toNodeHandler(inbound)`.

## Update

```bash
pnpm add @weber-development/vector-inbound@^0.3.0
pnpm add @weber-development/vector-portal@^0.3.0 @weber-development/vector-catalog@^0.3.0 @weber-development/vector-ops@^0.3.0
```

The other Pro packages have no breaking changes. They now accept `@sweberdev/vector` 0.2 as well. The [inbound docs](https://packages.sweber.dev/vector/docs) list every source and option.

Vector Pro starts at 29 CHF a month for one person. See the [package page](https://packages.sweber.dev/vector) for all plans.
