---
title: "Vector Pro 0.2.0: log search, event catalog and themes for the customer portal"
excerpt: "The Vector Pro portal now lets your customers search their webhook log by id, payload text, status and endpoint, browse your event catalog with examples and schemas, and it can take on the look of shadcn/ui."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Customer portal, shadcn/ui, release]
---

Vector Pro 0.2.0 is out. It is the first feature update since the [0.1.0 launch](https://packages.sweber.dev/blog/vector-0-1-0-released), and all of it is in the customer portal, the part of Vector Pro your customers see. `@weber-development/vector-portal` and `@weber-development/vector-catalog` 0.2.0 are on GitHub Packages for every Vector Pro licence. The free `@sweberdev/vector` is unchanged.

## Search the message log

"Did you send us the webhook for invoice 4711?" is the support question a webhook portal should answer without you. The message log now has a search bar and filters:

- **Search** by message id, or by any text in the payload, such as an invoice number or an email address.
- **Event type**: pick one from your catalog; the API also takes a pattern such as `invoice.*`.
- **Status**: for example only messages with a failed delivery.
- **Endpoint**: what one endpoint received.

The same filters are available on the API as `GET /messages?q=…&status=failed&endpointId=…&eventType=invoice.*&since=…`, and on the typed client.

Everything stays scoped to the customer's tenant. The search reads at most `searchScanLimit` messages per request (default 500) and then continues with the next cursor, so a long history never slows down one request.

## Event catalog

A new "Event catalog" tab lists every event type your customers can subscribe to, in place of a separate docs page. Types are grouped by their prefix and are searchable. Each one shows:

- its description and since when it exists;
- a deprecation note, if it has one;
- an example request body;
- its JSON Schema.

With `vector-catalog` you write that information once. `catalog.eventTypes()` now returns examples and schemas too, so one line fills the tab:

```ts
createPortalHandler(vector, { authorize, eventTypes: () => catalog.eventTypes() })
```

The tab appears automatically as soon as the portal knows about at least one event type.

## Themes

The portal always followed the operating system's light or dark mode. `colorScheme="light"` or `colorScheme="dark"` now forces one.

If your app uses shadcn/ui on Tailwind 4, `theme="shadcn"` makes the portal take its colours, radius and font from your CSS variables and follow your `.dark` class:

```tsx
<WebhookPortal apiBase="/api/webhooks" theme="shadcn" />
```

The portal then looks like the rest of your settings pages without a line of CSS. Every colour is still a `--vector-*` custom property you can override.

## Update

```bash
pnpm add @weber-development/vector-portal@^0.2.0 @weber-development/vector-catalog@^0.2.0
```

Nothing changes for existing code: all new options are optional and the API only gained fields. The [portal docs](https://packages.sweber.dev/vector/docs) describe every filter and prop.

Vector Pro starts at 29 CHF a month for one person. See the [package page](https://packages.sweber.dev/vector) for all plans.
