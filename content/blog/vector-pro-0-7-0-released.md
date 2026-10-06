---
title: "Vector Pro 0.7.0: inbound webhooks from Polar, GitLab, Paddle, Linear, Sentry and Lemon Squeezy"
excerpt: "vector-inbound verifies six more providers: Polar, GitLab, Paddle, Linear, Sentry and Lemon Squeezy, each with its own signature scheme, event types and ids for deduplication."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Inbound webhooks, Polar, GitLab, Paddle, release]
---

Vector Pro 0.7.0 is out. `@weber-development/vector-inbound` now verifies six more providers. All Vector Pro packages are at 0.7.0 on GitHub Packages. If you have not used inbound webhooks yet, the [0.3.0 post](https://packages.sweber.dev/blog/vector-pro-0-3-0-released) explains the idea: the route only verifies and stores the event, and your services get it behind Vector's queue with retries.

## New sources

```ts
import { createInbound, gitlab, paddle, polar } from "@weber-development/vector-inbound"

export const inbound = createInbound(vector, {
  sources: {
    polar: polar({ secret: process.env.POLAR_WEBHOOK_SECRET! }),
    gitlab: gitlab({ secret: process.env.GITLAB_WEBHOOK_TOKEN! }),
    paddle: paddle({ secret: process.env.PADDLE_WEBHOOK_SECRET! }),
  },
})
```

| Source | Event types look like |
|---|---|
| `polar` | `polar.order.paid`, `polar.subscription.created` |
| `gitlab` | `gitlab.push`, `gitlab.merge_request.open` |
| `paddle` | `paddle.transaction.completed` |
| `linear` | `linear.issue.create` |
| `sentry` | `sentry.issue.created` |
| `lemonSqueezy` | `lemonSqueezy.order_created` |

Every source checks the provider's own signature over the raw body, rejects requests that are too old where the provider sends a timestamp, and derives an id so that a retry from the provider is stored only once. Where a provider sends no event id (Lemon Squeezy), the hash of the body is used.

## Polar secrets

Polar changed its signing in September 2026. Secrets that start with `whsec_` follow Standard Webhooks and are used as they are. Older Polar secrets sign with the secret text itself, which Standard Webhooks libraries expect base64-encoded. `polar()` handles both, so pass the secret exactly as Polar shows it.

## Not included

Slack's Events API needs an answer to its URL verification challenge, and Twilio signs the full URL together with the form fields. Both need more than a signature check and are left out for now. For any service with a plain HMAC over the body, `hmacSource` covers it in a few lines.

## Update

```sh
pnpm add @weber-development/vector-inbound@latest
```

Customers with a Vector Pro licence find the new version in the same private registry. The [documentation](https://packages.sweber.dev/vector/docs) has the full source table.
