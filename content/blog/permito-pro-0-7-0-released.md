---
title: "Permito Pro 0.7.0: seals that make changes to the consent log visible"
excerpt: "Permito Pro 0.7.0 adds seals to the consent log: a keyed hash chain over each period, linked from period to period, so later changes, removals and additions can be detected."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, consent log, evidence, GDPR, release]
---

Permito Pro 0.7.0 is out on GitHub Packages. The signed export from 0.5.0 shows that an exported file stayed the same. A seal answers the next question: were the entries in the store changed after the fact?

## Seal a period

```ts
import { sealConsentLog } from "@weber-development/permito-log";

// At the end of each month:
const seal = await sealConsentLog(log.exportAll(), {
  key: process.env.SEAL_KEY, // at least 32 characters, kept apart from the log
  from: new Date("2026-10-01"),
  to: new Date("2026-11-01"),
  previous: lastSeal, // leave out for the first seal
});
```

Every entry gets a keyed hash, and the hashes form a chain. The seal records the last value of that chain and names the head of the previous seal, so a removed or replaced seal breaks the link. A seal holds only entry IDs and hashes, no visitor hash and no content. Store it where the application cannot overwrite it, for example a write-once archive.

## Verify later

```ts
import { verifyConsentLogSeal, verifyConsentSealChain } from "@weber-development/permito-log";

await verifyConsentLogSeal(log.exportAll(), seal, process.env.SEAL_KEY);
// { valid: false, problems: [{ type: "changed", id: "…" }, { type: "missing", id: "…" }] }

verifyConsentSealChain([sealOctober, sealNovember], process.env.SEAL_KEY);
```

The check names changed, missing and added entries by ID. Entries removed after a deletion request or after the retention period show up as missing, which is expected.

## What a seal does not show

It does not show that the store was correct before sealing, and it does not stop anyone who holds the key and rewrites both the log and the seals. Keep the key and the seals away from the system that writes the log. A seal makes a change visible; it does not prevent it.

## Upgrade

```bash
pnpm add @weber-development/permito-log@^0.7.0
```

All Permito Pro packages share the version number and accept every Permito 0.x release as a peer. No store or schema change is needed.

## What comes next

A service catalog in more languages with a freshness check, and adapters for WordPress, Shopware and WooCommerce.

Permito is technical consent infrastructure, not legal advice. Whether a seal is sufficient evidence in a specific case is for your lawyer to judge.
