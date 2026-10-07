---
title: "Inverse 0.7.0 released"
excerpt: "Inverse now ships example projects for the Next.js Pages Router, Remix, SvelteKit and Express. Inverse Pro adds one reminder per case shortly before a refund or contract end is due."
date: 2026-10-07
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Next.js, Remix, SvelteKit, release]
---

Inverse 0.7.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.6.0 code keeps working as it is.

## What is in 0.7.0

- **Example projects.** The repository now has an [`examples/`](https://github.com/Weber-Development/inverse/tree/main/examples) folder with minimal setups for the Next.js Pages Router, Remix, SvelteKit and Express (with CORS for a static shop on another domain). Copy the files into a project of the same kind and fill in your company details, storage and mail sending. They show how the handler and the forms are wired; the handler and forms themselves are covered by the package's tests.

```sh
pnpm add @sweberdev/inverse@^0.7.0 @sweberdev/inverse-react@^0.7.0
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.7.0

- **Reminders per case.** The weekly digest lists everything that is due. `caseReminders(records)` sends one message per case shortly before its deadline: the refund after a withdrawal (14 days after receipt) and the end of a contract after a cancellation. By default it reminds three days before, one day before and on the day itself. Every reminder has a stable key, so a cron job that runs twice sends nothing twice.

```ts
import { caseReminders } from "@weber-development/inverse-mail";

for (const r of caseReminders(records, { sent: alreadySentKeys })) {
  await transport.send({ from, to, subject: r.subject, text: r.text, html: r.html });
}
```

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
