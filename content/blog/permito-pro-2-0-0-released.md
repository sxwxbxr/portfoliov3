---
title: "Permito Pro 2.0: a receiver that passes withdrawals on to your systems and keeps the proof"
excerpt: "Permito Pro 2.0 receives the Permito 2.0 consent webhook, writes it to the consent log, tells your connected systems to stop processing with retries, and records which system confirmed what. The audit report gets a matching section."
date: 2026-10-12
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, release, "2.0", withdrawal, audit]
---

Permito Pro 2.0 is out on GitHub Packages. It is the server half of "consent across systems": the free Permito 2.0 tells your backend when consent changes, and Pro receives that message, acts on it and keeps the evidence.

## What is new

- **A receiver.** `@weber-development/permito-log/sync` accepts the webhook as a standard `Request` to `Response` handler (Next.js route handler, Hono, Bun, Deno, workers). It validates the payload, ignores repeats, writes the change to the consent log, and creates one job for every connected system whose purposes were affected.
- **Delivery with retries.** Each job runs once right away and is retried with growing waits until the system confirms or `maxAttempts` is reached. A system is informed of a withdrawal by default; informing it of a renewed consent is opt-in per system, so a re-subscription is never automatic.
- **Connectors.** `httpTarget` calls any URL you own, for example an internal service that updates the CRM. `brevoTarget` and `mailchimpTarget` block or unsubscribe a contact. These two are **beta**: they are tested against reproduced API answers, not against real accounts, so try them with a test contact first.
- **Proof.** The queue keeps, for each change, which system confirmed when, how often it needed, and where it failed. The person's identifier is deleted as soon as a job is done or has finally failed, only a keyed hash stays. `summarizeConsentSync` and `formatConsentSyncMarkdown` turn that into numbers per system and a list of changes that no system has confirmed yet.
- **Audit report.** `buildAuditReport` from the scanner takes the summary as `consentSync` and adds a section "Withdrawal across systems". Reports without it are unchanged.

## What to know

The receiver is a public endpoint. It validates the format and limits size and origin, but it cannot know whose consent it is: check on your side that the `subject` belongs to the session before you act on it. A browser that is offline when the visitor withdraws cannot send; the decision stays in the browser and the next change is sent. The file queue suits one process; for several instances implement the small `SyncStore` interface on your database.

## Compatibility and upgrade

Node 22 or later is the only breaking change. Pro 2.0 works with Permito 1.x and 2.x; the browser side of the webhook needs Permito 2.0. Existing subscriptions and lifetime licenses cover 2.0, prices are unchanged.

```bash
pnpm add @weber-development/permito-log@^2.0.0
```

The other Pro packages you use move to 2.0.0 the same way. The README of the log package explains the receiver step by step.

Permito is technical consent infrastructure, not legal advice.
