---
title: "Inverse 0.1.0 released"
excerpt: "The withdrawal button (§ 356a BGB) and the cancellation button (§ 312k BGB) for Next.js and React: statutory labels, the two-step flow, the receipt e-mail and a page check. MIT, no backend."
date: 2026-10-05
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Next.js, React, Compliance, release]
---

Inverse 0.1.0 is out. It adds the withdrawal button and the cancellation button to your own Next.js or React app. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence.

## Why

Since 19 June 2026, every business that concludes contracts with consumers online in the EU needs a withdrawal function labelled "Vertrag widerrufen", with a second step labelled "Widerruf bestätigen" and an acknowledgement of receipt on a durable medium (§ 356a BGB in Germany). German subscription businesses have needed a cancellation button labelled "Verträge hier kündigen" since 2022 (§ 312k BGB), and courts read those rules strictly.

Shop systems have plugins for this. Custom shops, SaaS products and booking apps mostly don't, and building it by hand means getting a lot of small things right. Inverse packages them, and you keep the data and the e-mail provider you already have.

## What is in 0.1.0

- `<InverseLink>` with the statutory labels for the footer of every page.
- `<WithdrawalForm>` and `<CancellationForm>`: details, a review step with "Widerruf bestätigen" or "Jetzt kündigen", and the receipt with a download of the declaration.
- `createInverseHandler()`, a `Request → Response` handler for Next.js, Remix, Hono, SvelteKit and Astro. It validates the fields the law asks for, sets the time of receipt on the server, calls your storage and sends the acknowledgement with your mail provider.
- The acknowledgement e-mail with the content of the declaration, date and time of receipt and, for cancellations, the end of the contract, in German, English, French and Italian.
- `withdrawalDeadline()` and `contractEndDate()` for the 14-day period and the end of a cancelled subscription, with weekends and your public holidays.
- `inverse check <url>`, a CLI that loads a page like a logged-out visitor and reports missing or mislabelled buttons, with an exit code for CI.

## Install

```bash
pnpm add @sweberdev/inverse @sweberdev/inverse-react
```

```ts
// app/api/inverse/route.ts
import { createInverseHandler } from "@sweberdev/inverse"

export const POST = createInverseHandler({
  company: { name: "Acme GmbH", email: "hallo@acme.de" },
  onDeclaration: (record) => db.declaration.create({ data: record }),
  sendReceipt: (receipt) => resend.emails.send({ from: "service@acme.de", ...receipt }),
})
```

```tsx
// footer
<InverseLink kind="withdrawal" href="/widerruf" />
<InverseLink kind="cancellation" href="/kuendigen" />

// app/widerruf/page.tsx
<WithdrawalForm endpoint="/api/inverse" />
```

Try both flows in a made-up shop in the [live demo](https://packages.sweber.dev/inverse/demo). The full reference is at [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs).

## Inverse Pro

Inverse Pro is coming soon. It adds three packages: an evidence ledger that stores every declaration and receipt in a hash chain and prints an evidence sheet per declaration, a site audit that checks every page of a site and follows the buttons to the form without login, with a report for clients, and branded receipts with a notification to your team and transports for the common mail providers. See the [package page](https://packages.sweber.dev/inverse) for the plans and the waiting list.

Inverse is software, not legal advice.
