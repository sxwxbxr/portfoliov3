---
title: "Vector Pro 0.4.0: webhooks for Slack, Teams, Discord and Google Chat"
excerpt: "The new vector-transform package writes webhooks in the format Slack, Microsoft Teams, Discord and Google Chat expect, with templates per event type, and shapes the body for every other receiver."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Slack, Microsoft Teams, Discord, Google Chat, release]
---

Vector Pro 0.4.0 is out, with a fifth package: `@weber-development/vector-transform`. It needs the free `@sweberdev/vector` [0.3](https://packages.sweber.dev/blog/vector-0-3-0-released), which adds the `transform` hook it plugs into. All Vector Pro packages are now at 0.4.0 on GitHub Packages.

## Why chat services need their own format

Chat services do not accept the usual `{ type, timestamp, data }` body. Teams wants an Adaptive Card, Slack wants blocks, Discord wants embeds with hard length limits. Without help every project writes four formatters, forgets an escaping rule once, and lets a customer's data ping `@channel`.

## Set up

```ts
import { createVector } from "@sweberdev/vector"
import { createTransform } from "@weber-development/vector-transform"

const vector = createVector({
  store,
  transform: createTransform({
    templates: {
      "invoice.paid": {
        title: "Invoice {{ data.id }} paid",
        text: "{{ data.amount | divide:100 | number:2 }} CHF from {{ data.customer.email }}",
        fields: { Plan: "{{ data.plan }}" },
        url: "https://admin.example.com/invoices/{{ data.id }}",
      },
    },
  }),
})
```

An endpoint that points at Slack, Teams, Discord or Google Chat gets that service's format, chosen from the URL. Every other endpoint keeps the normal JSON body. Each message is still signed, retried and logged by Vector.

## What it handles for you

- **Templates per event type.** `invoice.paid` beats `invoice.*` beats `*`. The language reads values and has a few filters (`default`, `truncate`, `number`, `divide`, `date`, `upper`), and cannot run code.
- **No accidental pings.** Values are escaped for Slack and Google Chat, and Discord messages are sent with mentions disabled.
- **Limits.** Header, field and embed size limits of each service are respected, so a long value never makes the service reject the webhook.
- **Sensible defaults.** Without a template a message shows the event type and the first values of `data`, coloured by event type: failures red, successes green.

## Shape the body for everyone else

For receivers that take the normal body, `shapeMetadata` keeps the data small and free of secrets without code:

```ts
metadata: shapeMetadata({ pick: ["id", "customer.email"], redact: ["customer.email"] })
```

`pick`, `omit` and `redact` apply per endpoint; the stored message is not changed.

## Update

```sh
pnpm add @weber-development/vector-transform
```

Customers with a Vector Pro licence find the package in the same private registry; it is covered by the licence you have. Details are in the [documentation](https://packages.sweber.dev/vector/docs).
