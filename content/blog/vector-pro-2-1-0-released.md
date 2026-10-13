---
title: "Vector Pro 2.1.0: a standalone server, regions and tenant limits"
excerpt: "Vector Pro 2.1.0 adds vector-server, which runs Vector as its own service for applications in any language, and delivery controls: regions with a fixed egress route and limits per tenant and endpoint."
date: 2026-10-13
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, "2.1", release]
---

Vector Pro 2.1.0 is on GitHub Packages for every Vector Pro licence. There are now seven packages, and all of them move together. Nothing breaks: if you use Pro 2.0 you can update without changing code. Existing licences stay valid, prices are unchanged.

## What is new

- **`@weber-development/vector-server`.** Vector as a service. Your PHP, Python, Go or Ruby application sends a plain HTTP request to the server; the server stores the event in your PostgreSQL, MySQL or SQLite database, signs it, delivers it and retries it. It has a REST API (events, batches, endpoints, deliveries, replay, test events, secret rotation), a worker in the same process, an admin page at `/admin`, health checks, Prometheus metrics, retention, and short-lived portal tokens, so your customers can use the portal from your own dashboard without you writing a backend for it.
- **Regions.** An endpoint, a tenant or the default can deliver through a region: a proxy with a fixed IP or your own `fetch`. A customer who allow-lists your address gets the IP of the region that fits. A region is an outgoing route, not a place where data is stored.
- **Tenant limits.** Per tenant: requests per second, requests in flight and requests per day. Per endpoint: `metadata.maxConcurrent` and `metadata.dailyLimit`, next to the `rateLimit` that Vector already had. Deliveries over a limit wait; they do not count as failed attempts.

The regions and limits are `createDeliveryControls` in `vector-ops`, and the server reads them from environment variables. In your own Node code:

```ts
const controls = createDeliveryControls({
  regions: { eu: { dispatcher: new ProxyAgent("http://proxy-eu.internal:3128") } },
  defaultRegion: "eu",
  limits: { default: { perSecond: 20, maxConcurrent: 10 } },
});
const vector = createVector({ store, ...controls.options });
```

Run the server:

```bash
docker run -d -p 3000:3000 -e VECTOR_API_KEY=… -e DATABASE_URL=postgres://… \
  ghcr.io/weber-development/vector-server:latest
```

## What is not verified yet

- The server is tested against a real PostgreSQL 16 and SQLite, and the proxy route against a proxy that speaks CONNECT. I have not run it against a MySQL server yet; Vector's own MySQL store is tested against MySQL 8.4.
- The Docker image is built and smoke-tested in the release pipeline. Whether every customer with repository access can pull it from the container registry is something I still have to confirm with a test account; `npx vector-server` works either way.
- The limits count in memory. With several worker processes each one applies them on its own.
- The admin page has no user accounts, only API keys. Put it behind your own login or network rules.

## Upgrading

Update all Vector Pro packages together: `npm install @weber-development/vector-ops@2.1` and the others you use. The server needs `@sweberdev/vector` 2.x and Node.js 22. Details are in the [Vector Pro documentation](https://packages.sweber.dev/vector/docs/pro/server).
