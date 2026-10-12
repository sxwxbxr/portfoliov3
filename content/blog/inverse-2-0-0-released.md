---
title: "Inverse 2.0.0 released"
excerpt: "Inverse 2.0 knows legal areas: a jurisdiction on every record, legal status per country, a case workflow and a format field in the Pro ledger. Eight countries are covered, and the page says which ones rest on the national act and which on the EU directive only."
date: 2026-10-12
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, "2.0", release]
---

Inverse 2.0.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are at 2.0.0 on GitHub Packages for licence holders. Existing Pro subscriptions and lifetime licences cover 2.0; prices and licence are unchanged.

1.0 froze the API. 2.0 is the first major version, and it is small on purpose: it changes where the legal status lives and what a record carries, and it keeps the flow, the request bodies and the evidence chain as they were.

## What is in 2.0

- **Legal areas as an API.** A `jurisdiction` option on the handler (`de`, `at`, `ch`, `fr`, `it`, `es`, `nl`, `pl`), an allow-list for shops that sell in several countries, and `data-jurisdiction` on the script-tag form. Every record now carries `jurisdiction` and `legalCheckedOn`, so an evidence sheet shows which state of the rules the texts followed on the day of receipt.
- **Legal status per country.** `getLegalRevision("fr")`, `legalChangesSince(id, date)` and `npx inverse legal --jurisdiction fr --since 2026-10-01`, which exits with 1 when something is newer, for a CI or cron job.
- **Honest coverage.** Germany and Austria are checked against the national provision. France, Italy, Spain, the Netherlands and Poland rest on Article 11a of Directive (EU) 2023/2673 only: the national acts were not read, and the translations were not reviewed by a lawyer or native speaker. Each entry says so. The cancellation button is claimed for Germany only.
- **End-to-end test.** The browser flow is tested against a real HTTP server, including CORS and validation.
- **Node 22.** Node 20 is out of support and no longer declared.

## Breaking changes

- `legalRevision` is replaced by `legalRevisions` and `getLegalRevision(id)`.
- `DeclarationRecord` has two new required fields, `jurisdiction` and `legalCheckedOn`.
- `engines.node` is `>=22`.

## Upgrading

```sh
pnpm add @sweberdev/inverse@^2 @sweberdev/inverse-react@^2
```

Replace `legalRevision` if you use it, then run `npx inverse legal` and `npx inverse check`. The [migration guide](https://packages.sweber.dev/inverse/docs/migrating-to-2) has the details. A ledger written by 1.x verifies unchanged in 2.x, and `@1` script pins keep working. Version 1.x gets security and bug fixes for 12 months.

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). The [demo](https://packages.sweber.dev/inverse/demo) has a country selector now.

## Inverse Pro 2.0.0

- **Case management.** Every declaration is a case with a status (open, processing, refunded, rejected, closed), a refund date for withdrawals, an overdue flag and a history written into the hash chain. A refund needs an amount. `inverse-ledger cases` and `inverse-ledger case` on the command line.
- **Ledger format field and `migrate`.** New entries carry `v: 2`. The field is not part of the hash, so no hash changes and nothing old is rewritten. `inverse-ledger migrate` upgrades the storage of an old SQL table, verifies the chain before and after and refuses if the head hash would change.
- **Lemon Squeezy.** `cancelSubscription` ends a subscription at Lemon Squeezy at the end of the billing period, next to Stripe and Paddle. Like the other two it is tested against recorded requests, not against a live provider account, and the docs say so.

Inverse is software, not legal advice. Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
