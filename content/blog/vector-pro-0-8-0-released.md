---
title: "Vector Pro 0.8.0: mount the customer portal in Hono and Fastify"
excerpt: "vector-portal gets toHonoHandler and toFastifyHandler, so the customer portal API mounts in Hono and Fastify with one line, next to the existing Fetch, Node and Express support."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, Customer portal, Hono, Fastify, release]
---

Vector Pro 0.8.0 is out. All Vector Pro packages are at 0.8.0 on GitHub Packages. The one change is in `@weber-development/vector-portal`: the portal API now has ready-made adapters for two more frameworks.

The portal handler has always been a plain Fetch handler, which works in Next.js route handlers, Bun, Deno and Workers, and `toNodeHandler` covered Node and Express. Hono and Fastify users had to write the glue themselves. Now:

```ts
import {
  createPortalHandler,
  toFastifyHandler,
  toHonoHandler,
} from "@weber-development/vector-portal"

const portal = createPortalHandler(vector, {
  basePath: "/webhooks",
  authorize: (request) => tenantFromSession(request),
})

hono.all("/webhooks/*", toHonoHandler(portal))
fastify.all("/webhooks/*", toFastifyHandler(portal))
```

The adapters use small structural types for the Hono context and the Fastify request and reply, so they add no dependency and keep working across framework versions. Fastify parses JSON bodies by default; the adapter serialises the parsed body again before it reaches the portal, so you do not need to change the content-type parser.

Update with your usual package manager. There are no breaking changes. The full portal documentation is at [packages.sweber.dev/vector](https://packages.sweber.dev/vector).
