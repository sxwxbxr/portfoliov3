---
title: "Inverse 0.5.0 released"
excerpt: "Inverse can now serve forms on another domain with a cors option, and says which legal state it reflects with legalRevision and inverse legal. Inverse Pro adds RFC 3161 time stamp anchors for the evidence ledger and an evidence dossier you can hand to your lawyer."
date: 2026-10-06
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Next.js, React, release]
---

Inverse 0.5.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.4.0 code keeps working as it is.

## What is in 0.5.0

- **CORS for forms on another domain.** A static shop or a WordPress page on `shop.example.com` can now post to a handler on `api.example.com`. `cors: { origin }` answers the preflight request and adds the headers to every response, including errors and rate-limit answers. It is off by default.

```ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company,
  onDeclaration,
  cors: { origin: ["https://shop.example.com"] },
});
```

- **Legal status.** The rules behind the two buttons (§ 356a and § 312k BGB, EU 2023/2673) are still being interpreted. `legalRevision` tells you when the kit was last checked against its sources and what changed in which version, and `inverse legal` prints the same from the command line, so you can see at a glance whether an update affects you.

```sh
pnpm add @sweberdev/inverse@^0.5.0 @sweberdev/inverse-react@^0.5.0
npx inverse legal
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.5.0

- **Time stamp anchors.** A hash chain proves order, but whoever holds the file could rewrite all of it. `inverse-ledger anchor --tsa <url>` sends the head hash to an RFC 3161 time stamp authority and stores the signed answer in the ledger. Later you can prove with `openssl ts -verify` that the chain up to that point existed at that time. `inverse-ledger anchors` lists the anchors and checks that each still matches the chain.
- **Evidence dossier.** `inverse-ledger dossier --from 2026-06-19 --html dossier.html` collects what a lawyer or authority asks for: chain status and head hash, every declaration in the period, whether personal data was already erased, the anchors, and a SHA-256 of the manifest. The HTML is printable, in German or English.

Which time stamp authority you use, and whether its stamps are qualified under eIDAS, is your decision.

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
