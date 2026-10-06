---
title: "Vector 0.4.0: rate limits per endpoint and egress through a proxy"
excerpt: "Vector can now cap the requests per second to each endpoint, so a burst of events does not overload a customer's server, and send deliveries through an egress proxy with a fixed IP."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Rate limiting, Proxy, release]
---

Vector 0.4.0 is out. `@sweberdev/vector` 0.4.0 is on npm under the MIT licence and is a drop-in update from [0.3](https://packages.sweber.dev/blog/vector-0-3-0-released). It adds two options that production setups ask for sooner or later.

## Rate limits per endpoint

An import, a bulk update or a busy hour can produce thousands of events in a minute, and every one of them is a request to your customer's server. A server that is slowed down answers `429` or times out, and then Vector retries, which makes it worse.

```ts
const vector = createVector({
  store,
  rateLimit: 5, // requests per second to each endpoint
})
```

The limit can also be a function, so free plans get a slower pace than paying ones, or be set on one endpoint with `metadata: { rateLimit: "2" }`, which wins over the option.

A limit of 2 allows a burst of two requests and then one every half second. A delivery over the limit is put back for the moment its turn comes. It is **not** counted as an attempt, does not use up the retry schedule and does not count towards disabling an endpoint. Test events and manual retries ignore the limit.

The limit lives in memory, so with several worker processes each one applies it separately. No database changes are needed.

## Egress through a proxy

Some customers allow-list the IP address your webhooks come from. On serverless platforms that address changes all the time. Run an egress proxy with a static IP and pass an [undici](https://undici.nodejs.org) dispatcher:

```ts
import { ProxyAgent } from "undici"

const vector = createVector({
  store,
  dispatcher: new ProxyAgent(process.env.EGRESS_PROXY_URL!),
})
```

Vector still resolves the host name itself and refuses private addresses before each request, so the SSRF protection stays in place. On Node.js 24 and later you can also start the process with `NODE_USE_ENV_PROXY=1` and `HTTPS_PROXY` set, with no code change.

## Update

```sh
pnpm add @sweberdev/vector@latest
```

The [documentation](https://packages.sweber.dev/vector/docs) has the details in the retries and security guides. Vector Pro 0.4 and earlier work with 0.4.0 without changes.
