---
title: "Permito 0.8.0: API freeze candidate with a pinned public API and a migration guide"
excerpt: "Permito 0.8.0 is the API freeze candidate for 1.0. Tests now pin every runtime export of every entry point, and a new migration guide lists what changed since 0.1."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, API, release, 1.0]
---

Permito 0.8.0 is out on npm. It is the API freeze candidate: unless you report a problem, the public API you see now is the API of 1.0.

## The API is pinned by tests

For `@permitojs/core`, the UI entry point, the Vue and Svelte adapters and `@permitojs/react`, tests now list every runtime export. Adding, removing or renaming an export fails CI, so the public surface can no longer change by accident. `@permitojs/react` now also re-exports `createSessionStorage`, so you no longer need to import it from core.

## Migration guide and API status

A new migration guide lists every change since 0.1 that touched your code, with before and after. The API status page now says which parts are frozen and what is deprecated (nothing at the moment).

## Upgrade

```bash
pnpm add @permitojs/core@^0.8.0 @permitojs/react@^0.8.0
```

Permito Pro keeps working with this release. If you find something that should change before 1.0, open an issue now.

Permito is technical consent infrastructure, not legal advice.
