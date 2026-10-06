---
title: "Permito Pro 0.8.0: catalog in Spanish and a freshness check for CI"
excerpt: "Permito Pro 0.8.0 adds Spanish to the service catalog and the cookie table, a new command that lists catalog entries older than a limit, and accepts Permito 1.x."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, catalog, cookie table, release]
---

Permito Pro 0.8.0 is out on GitHub Packages.

## Spanish in the catalog and the cookie table

All 71 catalog entries now have their texts in German, English, French, Italian and Spanish: purpose, notes, cookie descriptions and durations. The cookie table headings, storage types and standard texts are available in Spanish too, so `permito-cookie-table --lang es` works.

The Spanish texts are translations of the English ones and have not been read by a native speaker yet. The README says so. Have a native speaker or your lawyer read what you publish.

## Is the catalog still current?

Every catalog entry carries its source and the date its facts were collected. A new command checks those dates:

```bash
npx permito-catalog stale --config consent.config.ts
```

It lists the entries of your services that are older than six months (or `--max-age-months`) and exits with 1, so you can run it in CI. It only reads the dates in the package you installed and does not contact any provider. The README now has a section on how catalog updates work: new facts arrive with new package versions, `changes.json` lists what differs from the version before, and `permito-catalog changes --since <version>` shows what that means for your services.

## Ready for Permito 1.0

The Pro packages now accept Permito 1.x as peer (`@permitojs/core` and `@permitojs/react` `>=0.1.0 <2.0.0`). Permito 0.8 pins its public API, so Pro will keep working when 1.0 arrives.

## Upgrade

```bash
pnpm add @weber-development/permito-catalog@^0.8.0
```

The other Pro packages share the version number and move together to 0.8.0.

Permito is technical consent infrastructure, not legal advice.
