---
title: "Permito 2.0: consent that reaches your CRM and e-mail tool, not only the browser"
excerpt: "Permito 2.0 adds purposes and a webhook that tells your own backend whenever consent changes, so a withdrawal can stop processing outside the browser too. Decisions saved by 1.x keep working."
date: 2026-10-12
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, release, "2.0", webhook, withdrawal]
---

Permito 2.0 is out on npm, for `@permitojs/core` and `@permitojs/react`.

A consent banner stops scripts in the browser. When a visitor withdraws consent, your newsletter tool, your CRM and your analytics backend still hold the data and keep processing it unless something tells them to stop. India's DPDP Act spells this out for processors; the GDPR expects withdrawal to take effect, too. Until now Permito covered the browser only. Version 2.0 adds the missing half.

## What is new

- **Purposes.** Next to categories, a config can now name the processing purposes behind them (`newsletter`, `ad-personalisation`). Their ids are the same in the browser, in the stored decision and in the webhook. `hasPurposeConsent`, `setPurposeConsent`, and the hooks and stores `useHasPurposeConsent` and `purposeStore` work like their category and service counterparts. A service can list the purposes it serves.
- **A webhook for every change.** `connectConsentWebhook` sends the purposes, the decision and what this change withdrew to your own URL. It uses `sendBeacon` so it survives closing the page, falls back to `fetch` with retries, and sends from the tab where the visitor decided only. `parseConsentWebhookPayload` validates it on your server.
- **Two new guides.** "Withdrawal across systems" walks through the browser side and the server side, what a receiver has to handle (repeats, public endpoint, downstream failures) and an end-to-end test to run whenever you add a system. "Migrating to 2.0" lists what changes.

## What changes

The stored decision is now schema 2 and carries the purposes. A decision stored by 1.x is read and upgraded when it loads: every purpose follows its category, so nobody is asked again and `consentVersion` does not need to change. Without `purposes` in your config, each category is one purpose with the category's id, and the built-in banner still works per category.

Breaking for code that touches the types: custom storages and hand-built decisions, a mocked `ConsentSnapshot` or `ConsentManager`, and TypeScript props that were typed `ConsentState | null` for the cookie you read on the server. The migration guide has the one-line fix for each. Node 22 or later is required, since Node 20 has reached end of life.

If you roll back to 1.x, visitors who decided after the upgrade see the banner again, because 1.x does not read schema 2.

## Not in 2.0

The built-in banner decides per category, not per purpose. A purpose-level preference center is possible through the API today and is not built in. The Shopware adapter is not part of this release.

## Upgrade

```bash
pnpm add @permitojs/core@^2.0.0 @permitojs/react@^2.0.0
```

Upgrade Permito Pro first if you use it: Pro 1.0.1 and 2.0 accept Permito 2.x. Version 1.x keeps getting bug and security fixes for 12 months.

Permito is technical consent infrastructure, not legal advice.
