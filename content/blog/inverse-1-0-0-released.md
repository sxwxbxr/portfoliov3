---
title: "Inverse 1.0.0 released"
excerpt: "Inverse 1.0 is stable: the Widerrufsbutton and Kündigungsbutton kit for Next.js, React, WordPress, WooCommerce, Shopware and Shopify now has a frozen public API under semantic versioning, a maintained legal status, and a Pro edition with an evidence ledger, audit reports and mail."
date: 2026-10-09
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, "1.0", release]
---

Inverse 1.0.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are at 1.0.0 on GitHub Packages for licence holders. Since 19 June 2026, German shops need a withdrawal function (§ 356a BGB) as well as the cancellation button (§ 312k BGB); Inverse gives you both, with the statutory labels, a two-step flow, a receipt with date and time, and a check that your pages really show the buttons.

## What 1.0 means

- **A frozen API.** The public API of 0.9 is now covered by semantic versioning. Removing or renaming an export, an option, a request or response field, a CLI flag or the ledger format needs a major version. A test in every package pins the exports. Read the [stability page](https://packages.sweber.dev/inverse/docs/reference/stability) for the details, including what can still change in a minor version (texts that follow the law, report layouts).
- **Nothing to migrate.** Code that runs on 0.9 runs on 1.0 unchanged, and a ledger written by 0.x verifies in 1.x. See [Upgrading to 1.0](https://packages.sweber.dev/inverse/docs/guides/upgrading).
- **A maintained legal status.** `legalRevision` and `npx inverse legal` tell you when the kit was last checked against its sources and what changed. Austria and Switzerland have their own notes that say what Inverse covers and what it does not claim.

## What you get

- Buttons and two-step forms for React and Next.js, a script-tag build for any site, a WordPress plugin, and ready-to-paste snippets for WooCommerce, Shopware and Shopify (`inverse snippet`).
- A handler for Next.js, Remix, SvelteKit, Astro, Hono, Express and Fastify with optional rate limit, duplicate protection and CORS, and example projects.
- Deadlines with weekends and holidays, seven languages, and axe tests for the forms.
- `inverse check` to find missing or mislabelled buttons on a page, with an exit code for CI.

```sh
pnpm add @sweberdev/inverse@^1 @sweberdev/inverse-react@^1
npx @sweberdev/inverse snippet woocommerce --endpoint https://api.example.com/inverse
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 1.0.0

- **Evidence ledger.** Every declaration and receipt in a SHA-256 hash chain, on JSON Lines, PostgreSQL or SQLite, with erasure and retention that keep the chain verifiable, RFC 3161 time stamp anchors (also on a schedule), one ledger per client for agencies, and an evidence dossier for your lawyer as HTML or PDF.
- **Site audit.** Every page from the sitemap, buttons followed to the form, reports for clients as HTML, PDF and CSV, and a comparison with the last run that flags what got worse.
- **Mail.** Branded receipts, a team notification, a weekly digest, one reminder per case before a deadline, and transports for Resend, Postmark, SendGrid, Brevo, Mailgun and SMTP. Plus `cancelSubscription` to end a Stripe or Paddle subscription after a cancellation.

Inverse is software, not legal advice. Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
