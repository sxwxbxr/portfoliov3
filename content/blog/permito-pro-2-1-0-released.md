---
title: "Permito Pro 2.1: a Consent Mode check, a Tag Manager container and alerts that name what is new"
excerpt: "Permito Pro 2.1 checks whether Google tags run in a denied consent state, writes an importable Tag Manager container for the default state, and lets the weekly monitor post new observations per site to Slack or Teams."
date: 2026-10-13
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, release, "2.1", scanner, "consent mode"]
---

Permito Pro 2.1 is out on GitHub Packages. It adds what the free package cannot give you: a check of the live site, a ready starting point for Tag Manager, and an alert that says what changed.

## What is new

- **Consent Mode check (beta).** `permito scan` and the monitor now look at the requests Google tags send while the page loads without interaction. Google appends the consent state to them (`gcs`, and `gcd` for Consent Mode v2). A tag that reports `ad_storage` or `analytics_storage` as granted before any decision, or that sends data with no consent state at all, becomes a finding of the new type `consentMode`. A denied state is not a finding. The result is an observation of what the tags reported, not a statement about how Google processes the data.
- **Tag Manager container (beta).** `npx permito gtm-template` writes a container export with one tag: the default consent state (everything denied except `security_storage`), fired on Consent Initialization, before every other tag. Import it with **Merge**. The update after the visitor's decision still comes from `connectGoogleConsentMode` in the free package.
- **Alerts that name what is new.** The monitor stores which observations it has seen. With a Slack or Teams webhook in the secret `PERMITO_ALERT_WEBHOOK`, one message per run lists the new observations per site, those active before consent first. Without the secret nothing is sent. Everything runs in your own GitHub account.

## What to know

Both beta parts are marked because we could not test them end to end. The Consent Mode check is covered by tests with the parameter values as Google documents them, but not yet run against many live sites. The container follows Google's export format, but we have not imported it into a real Tag Manager account; if the import fails, the README shows how to create the tag by hand. Issues opened by an earlier version have no stored keys, so the first run names nothing as new for those sites.

## Upgrade

Minor release, nothing breaks. Existing subscriptions and lifetime licenses cover it, prices are unchanged.

```bash
pnpm add @weber-development/permito-scanner@^2.1.0
```

The other Pro packages move to 2.1.0 together. The README of the scanner explains the check, the container and the alerts.

Permito is technical consent infrastructure, not legal advice.
