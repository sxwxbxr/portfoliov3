---
title: "Compliance Bundle 2.0: all five packages on 2.0, plus new Pro extensions"
excerpt: "Permito, Surjection, Logarithm, Inverse and Witness are on 2.0, for free and Pro. Pro 2.1 adds a case inbox and monitoring for Inverse, a Consent Mode check for Permito and pull request comments for Surjection, all marked beta. Prices stay as they are."
date: 2026-10-13
author: Seya Weber
type: news
packages: [permito, surjection, logarithm, inverse, witness]
tags: [Compliance, Bundle, "2.0", Permito, Surjection, Logarithm, Inverse, Witness, news]
---

Since 12 October the five packages of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance) are on 2.0.0, and with Witness on 13 October the set is complete: Permito, Surjection, Logarithm, Inverse and Witness, each as a free package on npm and as a Pro add-on. If you hold the bundle, Pro 2.0 is already covered by your subscription or lifetime licence. Prices and licences did not change.

## What each package got

- **Permito 2.0** adds purposes and a webhook that tells your own backend whenever consent changes, so a withdrawal can stop processing in your CRM and e-mail tool, not only in the browser. Pro 2.0 brings the receiver that passes withdrawals on to connected systems with retries and keeps the proof. [Release post](https://packages.sweber.dev/blog/permito-2-0-0-released).
- **Surjection 2.0** checks whole user journeys and single components, lists which WCAG 2.2 criteria automated tests can and cannot cover, and moves results files to version 2. Pro adds the WCAG-EM conformance report, an ACR export and re-tests. [Release post](https://packages.sweber.dev/blog/surjection-2-0-0-released).
- **Logarithm 2.0** records failed and denied actions, adds correlation ids, CloudEvents and OpenTelemetry mappings and Postgres partitioning. Pro maps your events to SOC 2 and ISO 27001 controls, builds monthly evidence packs and gives auditors read-only access. [Release post](https://packages.sweber.dev/blog/logarithm-2-0-0-released).
- **Inverse 2.0** puts a jurisdiction on every record and tracks the legal status per country for eight countries. Pro adds case management and Lemon Squeezy cancellation next to Stripe and Paddle. [Release post](https://packages.sweber.dev/blog/inverse-2-0-0-released).
- **Witness 2.0** records and checks the machine-readable marking layers of AI content and shows C2PA Content Credentials in the browser. Pro adds a layer check for CI and a review workflow in the AI register. [Release post](https://packages.sweber.dev/blog/witness-2-0-0-released).

## New in Pro: version 2.1, marked beta

Three Pro add-ons got a 2.1 release on 13 October. All the new parts are beta, because they have not been run against real systems yet. Each release post says what was tested and what was not.

- **Inverse Pro 2.1:** a web inbox for withdrawals and cancellations with status, refund day and reply templates, and monitoring of your shop pages that reports when a button disappears after a deploy. [Release post](https://packages.sweber.dev/blog/inverse-2-1-0-released).
- **Permito Pro 2.1:** a check of whether Google tags report a denied consent state while the page loads, an importable Tag Manager container for the default state, and monitor alerts that name what is new. [Release post](https://packages.sweber.dev/blog/permito-pro-2-1-0-released).
- **Surjection Pro 2.1:** one pull request comment with only the new accessibility issues, and scheduled monitoring of live sites with Slack or mail alerts. [Release post](https://packages.sweber.dev/blog/surjection-2-1-0-released).

## Upgrading

Node.js 22 or newer is required across the packages, since Node 20 is out of support. Each release post lists its other breaking changes, and the migration guides in the docs walk through them. Version 1.x keeps getting security and bug fixes for 12 months. Pro 2.0 packages are installed the same way as before, from GitHub Packages with your Pro access.

## Prices

| Plan | Monthly | Yearly | One-time |
|---|---|---|---|
| Freelancer, one person | CHF 49 | CHF 490 | |
| Agency, up to ten people | CHF 149 | CHF 1'490 | |
| Lifetime, up to ten people | | | CHF 4'990 |

Bought one by one, the five Pro add-ons cost CHF 105 a month for Freelancer and CHF 325 for Agency, so the bundle costs less than half. Existing subscriptions and lifetime licences keep their price and include 2.0 and 2.1.

## What is not verified

The beta features above are tested against recorded requests, local servers and reproduced API answers, not against real provider accounts, so try them with test data first. Of the translations, the French, Italian, Spanish, Dutch and Polish texts of Inverse and the French and Italian texts of the Surjection reports have not been reviewed by a lawyer or a native speaker. The Inverse legal status for France, Italy, Spain, the Netherlands and Poland rests on the EU directive only; the national acts were not read.

All five packages are software that helps you build and evidence compliance. They are not legal advice and do not promise that your site or app meets a law.
