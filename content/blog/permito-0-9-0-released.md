---
title: "Permito 0.9.0: release candidate for 1.0, with a WordPress guide and a versioning policy"
excerpt: "Permito 0.9.0 is the release candidate. The API listed as stable is frozen, including the script tag, the bridges and the Vue and Svelte adapters. New: a WordPress guide, a versioning and support policy, and a screen reader checklist."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, release, "1.0", WordPress, accessibility]
---

Permito 0.9.0 is out on npm. It is the release candidate for 1.0: the code is the same as 0.8, and what changed is what we promise about it.

## What is frozen

Until 0.8, four areas were still marked "may change": the script tag config and `createConsentUI`, the bridges for Microsoft UET, Clarity and Matomo, the service templates, and the Vue and Svelte adapters. They are now part of the stable API. Tests pin every runtime export, so the surface cannot change by accident. Only two things stay outside the promise: the wording of built-in translations (the Spanish, Dutch, Polish and Portuguese texts have not been read by native speakers yet) and the CSS class names.

## Versioning and support

A new page spells out the rules from 1.0 on: patch releases fix bugs and wording, minor releases add features and never remove stable API, and a major release can remove what was deprecated for at least one minor release before. The latest minor of the current major gets fixes, and the last minor of the previous major keeps getting security fixes for six months. Vulnerabilities are reported privately through GitHub Security Advisories.

## WordPress

The new WordPress guide shows a small plugin that prints the config, enqueues `permito.global.js` in the head and hooks the settings link. It also says plainly what Permito cannot do: scripts that other plugins print before the visitor decided can only be gated if you can change their tag or switch them off in that plugin. The snippets use standard WordPress functions; try them on a staging site first.

## Screen reader checklist

The accessibility page has a ten-minute manual check for VoiceOver and NVDA that you run on your own site, with your own texts and colors. Automated scans catch only part of the problems.

## A fix in our own tests

The pull request for this release failed once in our accessibility test: axe read colors while the preference center was still fading in and reported a contrast problem that was not there. The test now waits for animations to finish. The contrast rules themselves are unchanged.

## Upgrade

```bash
pnpm add @permitojs/core@^0.9.0 @permitojs/react@^0.9.0
```

Permito Pro 0.8 already accepts Permito 1.x as peer. Permito is technical consent infrastructure, not legal advice.
