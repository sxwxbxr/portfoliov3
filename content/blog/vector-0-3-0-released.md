---
title: "Vector 0.3.0: change the body of a webhook per endpoint"
excerpt: "A new transform hook lets you rewrite the body for one endpoint, add headers or skip a delivery, while the stored message and its signature stay intact."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Transformations, release]
---

Vector 0.3.0 is out. `@sweberdev/vector` 0.3.0 is on npm under the MIT licence, and it is a drop-in update from [0.2](https://packages.sweber.dev/blog/vector-0-2-0-released).

## The problem

One event, several receivers, and not all of them want the same body. A partner wants only three fields, a chat service wants its own message format, and one endpoint should not get debug events at all. Until now the answer was a second event type or a copy of the payload per receiver.

## The transform hook

`transform` is called once per delivery, right before the request is signed. It sees the message, the endpoint and the default body, and returns what should change:

```ts
const vector = createVector({
  store,
  transform: ({ message, endpoint, body }) => {
    if (endpoint.metadata.audience === "partner") {
      return { body: { id: message.id, type: message.eventType } }
    }
    if (message.eventType.startsWith("debug.")) {
      return { skip: "debug events are internal" }
    }
    return { headers: { "x-tenant": message.tenant ?? "" } }
  },
})
```

- **`body`** replaces the body for this delivery. It must be JSON.
- **`headers`** are added to the request. Vector's own `webhook-*` headers cannot be overridden.
- **`skip`** cancels the delivery for that endpoint and records the reason in the log.
- Returning nothing leaves the delivery as it is.

The stored message is never changed, so replays and the delivery log still show the original event. The new body is signed like any other, so receivers verify it with the usual Standard Webhooks library. If your function throws, the attempt fails and is retried like any other failure, and the log shows `Transform failed: ...`.

## Chat formats with Vector Pro

The hook is the building block. [Vector Pro 0.4.0](https://packages.sweber.dev/blog/vector-pro-0-4-0-released) uses it for Slack, Teams, Discord and Google Chat messages.

## Update

```sh
pnpm add @sweberdev/vector@latest
```

The guide is in the [documentation](https://packages.sweber.dev/vector/docs). Vector is free; [Vector Pro](https://packages.sweber.dev/vector) adds the customer portal, event catalog, operations tooling, inbound webhooks and chat formats.
