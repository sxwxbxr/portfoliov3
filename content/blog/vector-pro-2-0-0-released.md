---
title: "Vector Pro 2.0.0: customer replay, Slack and Twilio sources, SLO alerts"
excerpt: "Vector Pro 2.0.0 works with Vector 2.x. Customers can replay a time range and set payload filters in the portal, inbound adds Slack and Twilio, ops adds SLO status with Prometheus rules and a Grafana dashboard."
date: 2026-10-12
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, "2.0", release]
---

Vector Pro 2.0.0 is on GitHub Packages for every Vector Pro licence. All six packages move together and need `@sweberdev/vector` 2.x and Node.js 22. Existing licences stay valid.

## What is new

- **Portal:** endpoints accept and show a payload `filter`, and `POST /endpoints/:id/replay` lets a customer send the stored messages of a time range (up to 31 days) to one endpoint again. It is scoped to the customer's tenant and endpoint, and available in the client as `client.replay(...)`.
- **Inbound:** `slack()` verifies Slack events (`X-Slack-Signature`, event type from the inner event) and `twilio()` verifies SMS, WhatsApp and voice callbacks, including JSON bodies signed with `bodySHA256`.
- **Ops:** `sloStatus()` compares the success rate of a window with an objective and reports the error budget and burn rate. `prometheusRules()` writes alert rules for fast and slow burn, backlog and disabled endpoints; `grafanaDashboard()` writes a dashboard.
- **Transform:** `previewTransform()` shows the Slack, Teams, Discord or Google Chat message for an example event without sending anything.

## What is not verified yet

The Slack and Twilio sources are tested with generated and documented signatures, not against live accounts. The Prometheus rules and the Grafana dashboard are parsed and checked in tests, but I have not run them through `promtool` or imported them into Grafana. Treat them as a starting point and tell me what needs changing.

## Breaking changes and upgrading

- Node.js 22 or newer.
- The peer range still allows `@sweberdev/vector` 1.x, but Pro 2.0 is only tested against 2.x, and replay and filters need the 2.x core and its schema upgrade (`await store.migrate()`).
- The portal's endpoint objects have a new `filter` field (`null` by default).

Update all Vector Pro packages together: `npm install @weber-development/vector-portal@2` and the others you use. The [Vector 2.0 post](https://packages.sweber.dev/blog/vector-2-0-0-released) and the [migration guide](https://packages.sweber.dev/vector/docs/migrating-to-2) cover the core. Pro 1.x gets security and bug fixes for 12 months.
