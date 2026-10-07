---
title: "Permito Pro 1.0.0: stable packages, pinned exports and a versioning policy"
excerpt: "Permito Pro 1.0.0 is out. All six packages share the version, the runtime exports are pinned by tests, and the versioning and compatibility rules are written down. The code is the same as 0.9.0."
date: 2026-10-07
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, release, "1.0", semver]
---

Permito Pro 1.0.0 is out on GitHub Packages. The code is the same as 0.9.0. What is new is the promise, and the tests that back it.

## What 1.0 means for Pro

All six packages move to 1.0.0 together: catalog, cookie table, consent log, scanner, themes and the WordPress plugin generator. From now on they follow semantic versioning:

- Patch releases fix bugs. Minor releases add features and catalog updates. Neither removes or changes an export, a command line option, a config key or a documented output format.
- A major release can. What it removes was marked `@deprecated` in at least one earlier minor release and is named in the release notes with a migration hint.
- One test per package pins the runtime exports of every entry point: the catalog, the cookie table and its React component, the consent log with its client, stores and framework adapters, the scanner and the themes. An export cannot disappear by accident.

The service catalog is data and is treated as such: minor releases change facts, add services and update retrieval dates, and `changes.json` lists what differs between versions. Texts in translations can be corrected in any release.

## What is in Pro 1.0

- A catalog of 71 services in five languages, each entry with its source and retrieval date, a freshness check for CI and a list of changes per version
- A cookie table for your privacy policy, generated from the same config as the banner
- A self-hosted consent log with statistics, a signed evidence export and tamper-evident seals
- A scanner for CI, Google Tag Manager exports and monitoring of many sites, plus an audit report for clients and authorities
- Six themes with checked contrast and two layouts
- A WordPress plugin generator that also blocks scripts of other plugins, WooCommerce included

## Compatibility

The packages accept `@permitojs/core` and `@permitojs/react` from 0.1 up to, but not including, 2.0, so they work with Permito 1.0. Support depends on your license tier, see section 8 of the license. The license text is version 1.0.

## Upgrade

```bash
pnpm add @weber-development/permito-catalog@^1.0.0
```

The other Pro packages you use move to 1.0.0 the same way. There are no breaking changes since 0.9.0. A Shopware adapter is planned for a later minor release.

Permito is technical consent infrastructure, not legal advice.
