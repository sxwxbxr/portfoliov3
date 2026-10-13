---
title: "Inverse 2.1.0 released"
excerpt: "Inverse Pro 2.1 adds a web inbox for withdrawals and cancellations and continuous monitoring of your shop pages with an alert when a button goes missing. Both are beta. The free package gets a one-line hint about Pro in the CLI."
date: 2026-10-13
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, "2.1", release]
---

Inverse 2.1.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are at 2.1.0 on GitHub Packages for licence holders. Existing subscriptions and lifetime licences cover it; prices and licence are unchanged.

2.1 is about what happens after the buttons are live. The free package gets you through the flow; Pro now helps you run it.

## What is new in Pro

- **Case inbox (beta).** `npx inverse-ledger inbox ./data/inverse.db --company "Acme GmbH"` starts a web inbox. It lists every withdrawal and cancellation with status and refund day, marks overdue withdrawals, moves a case on (processing, refunded, rejected, closed) and sends the customer a reply from a German or English template. The reference, contract and refund day in the mail come from the ledger. Every status change is written to the evidence chain. Access is by password (HTTP Basic auth), changes need a CSRF header, and the server listens on localhost until you put HTTPS in front of it. In code: `createInbox` and `serveInbox`.
- **Continuous monitoring (beta).** `npx inverse-audit watch --sites sites.txt --state state.json --webhook <url>` checks your pages and reports only what changed: a button that vanished after a deploy, a site that stays broken, a site that is back. `npx inverse-audit init-action https://shop.example.com --webhook` prints a GitHub Actions workflow that runs the check on a schedule and fails the run on an alert, so GitHub mails the people watching the repository.

## What is new in the free package

`inverse check` prints one line about Pro on stderr after an interactive run. It is silent when the output is piped, with `--json`, in CI, and when `INVERSE_NO_HINT` is set. The README lists the new Pro features.

## What is not verified

Both features are marked beta because they were not run against real systems. The inbox and its HTTP interface are tested against a real server and a fake mail transport; no real mail provider was used. The monitor and the workflow generator are tested, but the generated workflow has not run on a live GitHub runner yet. GitHub's scheduled runs can also start late, so treat the interval as approximate. A JSON Lines ledger has one writer: use SQLite or PostgreSQL if the shop and the inbox write at the same time.

## Upgrading

Nothing breaks. Update the packages and, for the inbox, set `INVERSE_INBOX_PASSWORD` (at least 12 characters) before you start it.

```sh
pnpm add @sweberdev/inverse@latest @sweberdev/inverse-react@latest
pnpm add @weber-development/inverse-ledger@latest @weber-development/inverse-audit@latest @weber-development/inverse-mail@latest
```

Docs: [case inbox](/inverse/docs/pro/inbox), [monitoring](/inverse/docs/pro/watch). Pro: [packages.sweber.dev/inverse](/inverse).
