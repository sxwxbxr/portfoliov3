---
title: "Vector 0.5.0: hold deliveries to an endpoint"
excerpt: "A new hold option lets you pause deliveries to an endpoint without using up their retries. It is the building block for circuit breakers, maintenance windows and customer-controlled pauses."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Circuit breaker, release]
---

Vector 0.5.0 is out. `@sweberdev/vector` 0.5.0 is on npm under the MIT licence and a drop-in update from [0.4](https://packages.sweber.dev/blog/vector-0-4-0-released).

## The problem with failing endpoints

When a customer's server is down, every message you send it burns through the retry schedule: eight attempts over a day, each one a wasted request, and in the end the deliveries give up and the endpoint is disabled. If the server is back after twenty minutes, most of that effort was pointless, and a lot of messages still ended up failed.

## The hold option

`hold` is asked before every attempt how many seconds deliveries to an endpoint should wait. Return `undefined` to deliver now.

```ts
const vector = createVector({
  store,
  hold: (endpoint) => (endpoint.metadata.paused === "true" ? 300 : undefined),
})
```

A held delivery stays pending. It is **not** counted as an attempt, does not use up the retry schedule and does not count towards disabling the endpoint. When the time is over, it is delivered like any other. If your function throws, the attempt goes ahead, so a bug there never blocks deliveries.

Uses besides circuit breakers: a maintenance window for one customer, a pause switch in your admin, or backing off from an endpoint that answers `429` with a long `Retry-After`.

## A circuit breaker with Vector Pro

[Vector Pro 0.5.0](https://packages.sweber.dev/blog/vector-pro-0-5-0-released) ships a ready-made circuit breaker that uses `hold`.

## Update

```sh
pnpm add @sweberdev/vector@latest
```

See the [documentation](https://packages.sweber.dev/vector/docs) for the retries guide.
