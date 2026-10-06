---
title: "Vector 0.6.0: send many events at once, skip repeated deliveries"
excerpt: "sendMany sends up to 1000 events in one call, and new dedupers on the receiving side remember handled webhook ids in memory, Postgres, SQLite or MySQL."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Idempotency, release]
---

Vector 0.6.0 is out. `@sweberdev/vector` 0.6.0 is on npm under the MIT licence and a drop-in update from [0.5](https://packages.sweber.dev/blog/vector-0-5-0-released). It adds one helper for the sending side and one for the receiving side.

## Sending many events

After an import or a nightly job, a loop of `send` calls reads the tenant's endpoints again for every single event. `sendMany` does it once per tenant:

```ts
const results = await vector.sendMany(
  invoices.map((invoice) => ({
    eventType: "invoice.created",
    payload: invoice,
    tenant: invoice.accountId,
    idempotencyKey: `invoice-created-${invoice.id}`,
  })),
)
```

It takes up to 1000 events per call and checks all of them before it stores anything, so one bad payload does not leave half a batch behind. Results come back in the order of the inputs, and a repeated idempotency key inside the batch is recognised as a duplicate. It is not one database transaction: if the database fails midway, the first events are already stored, which is why every event should carry an `idempotencyKey` and the call can simply be repeated.

## Skipping repeated deliveries

Webhooks are delivered at least once. If your answer is slow or gets lost, the same `webhook-id` arrives again. Receivers should skip ids they have handled, and that code is easy to get subtly wrong. Vector now ships it:

```ts
import { memoryDeduper, once, verifyRequest } from "@sweberdev/vector"

const deduper = memoryDeduper()

export async function POST(request: Request) {
  const { id, payload } = await verifyRequest(request, process.env.WEBHOOK_SECRET!)
  await once(deduper, id, () => handle(payload))
  return new Response(null, { status: 204 })
}
```

`once` runs the work only the first time. If the work throws, the id is forgotten again so the retry is handled, and the error is rethrown. With several processes or restarts, `postgresDeduper`, `sqliteDeduper` and `mysqlDeduper` keep the ids in a table instead. Ids are remembered for seven days, longer than the retry schedule, and `prune()` deletes old ones.

## Update

```sh
pnpm add @sweberdev/vector@latest
```

The [documentation](https://packages.sweber.dev/vector/docs) covers both in the sending and receiving guides.
