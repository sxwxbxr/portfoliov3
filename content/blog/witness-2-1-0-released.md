---
title: "Witness Pro 2.1 released: monitoring and an evidence bundle for auditors"
excerpt: "Witness Pro 2.1 adds a baseline for the scanner with pull request comments and alert webhooks, and a command that collects register, report and scan into one hash-checked folder for an auditor."
date: 2026-10-13
author: Seya Weber
type: release
packages: [witness]
tags: ["Witness", "EU AI Act", "Article 50", "2.1", "Pro", "release"]
---

Witness Pro 2.1 is out: `witness-locales`, `witness-scan`, `witness-report` and `witness-sign` are at 2.1.0. The free packages stay at 2.0.0. Prices and licences are unchanged.

## What is in 2.1

- **A baseline for the scanner.** A real site often has findings you know about. `witness-scan --write-baseline witness-baseline.json` saves them, and `witness-scan --baseline witness-baseline.json` then fails only on findings that are new. The run says how many are new, fixed and unchanged.
- **Pull request comments.** `--comment witness-comment.md` writes a Markdown comparison for a pull request comment. In GitHub Actions it also goes to the job summary.
- **Alerts.** `--webhook <url>` (or `WITNESS_WEBHOOK_URL`) sends a message to Slack, Mattermost, Discord or any JSON endpoint, but only when something new appears. Run the scan on a schedule and you hear about a label that vanished with a deploy. The URL must be https.
- **An evidence bundle.** `witness-report evidence --out evidence/2026-10` collects the register, the client report, the public AI page, the legal status, a list of open points and, if you pass them, the scan, the change log and the notice events into one folder. `evidence.json` lists every file with its SHA-256 hash, and `witness-report evidence --verify evidence/2026-10` shows what changed since.

## Upgrading

Pro customers update the four `@weber-development/witness-*` packages to 2.1.0. Nothing breaks: the new options are optional and existing commands behave as before. See [Monitoring](/witness/docs/pro/monitoring) and [the report guide](/witness/docs/pro/report#evidence-bundle) in the docs.

## What it is not

The scan checks your build, not the running site, so it does not replace a look at the live pages after a deploy. The evidence bundle is not signed: to prove its date, keep the manifest hash somewhere you do not control alone, for example in an email to your auditor. It documents what you had and did. It does not say whether your use of AI complies with Article 50, and Witness is not legal advice.

Signing MP3 files, timestamps for signatures and the WordPress bridge, which the 2.0 notes put in 2.1, move to a later release.

Get Witness Pro on the [Witness page](/witness).
