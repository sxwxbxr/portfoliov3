---
title: "Witness 0.9.0 released: the release candidate with a frozen API"
excerpt: "Witness and Witness Pro are at 0.9.0, the release candidate for 1.0.0. The API is frozen, documented and tested in a real browser, and Pro installs with Witness 0.9 and 1.x."
date: 2026-10-07
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, release candidate, stability, release]
---

Witness 0.9.0 is out: the free packages `@sweberdev/witness` and `@sweberdev/witness-react` and the four Pro packages now share the version 0.9.0. It is the release candidate for 1.0.0. There are no new features in it, on purpose: the work was to make what exists dependable.

## What is in 0.9.0

- **A frozen API.** Every export, custom element, attribute, event and CLI option on the reference pages is covered by semantic versioning. The [stability page](/witness/docs/reference/stability) lists what a version promises, what it does not (wording, scanner findings, legal status, visual design) and how deprecation works.
- **A complete reference.** The [API reference](/witness/docs/reference/api) covers the free packages and the [Pro API reference](/witness/docs/reference/pro-api) the four Pro packages.
- **Browser tests.** `<witness-notice>`, `<witness-label>` and `<witness-player>` are now tested in a real Chromium in CI. The first run found a layout bug in `<witness-player>` with video, fixed in 0.5.1: the label sat at the page edge instead of in the corner of the video.
- **Coverage thresholds** for the free core package in CI.
- **A Vite example** that shows the notice, a label and the player with the published package.
- **Pro installs with Witness 0.9 and 1.x.** Witness Pro's scanner and signer no longer pin the old 0.4 line of the free package.

## Update

```sh
npm install @sweberdev/witness@0.9.0 @sweberdev/witness-react@0.9.0
```

Pro customers update the four `@weber-development/witness-*` packages to 0.9.0 the same way. Nothing in your code has to change.

## What is left for 1.0.0

A legal review of the Article 50 summary and the Pro translations, and a trademark check of the name. Witness stays a tool that makes disclosure easy; it is not legal advice. See the [Witness page](/witness) for the Pro edition.
