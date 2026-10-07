---
title: "Lagrangian Pro 0.9.0: the API is frozen"
excerpt: "The release candidate for 1.0: every function, option and method is now documented in a generated API reference, there is a migration guide, and Pro works with Lagrangian 1.0."
date: 2026-10-07
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, API, release]
---

Lagrangian Pro 0.9.0 is out. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence.

## What is new

- **The API is frozen.** Nothing was renamed or removed on the way to this version, and nothing will be before 1.0. The next release is 1.0.0 with the same API.
- **API reference.** A [reference page](https://packages.sweber.dev/lagrangian/docs/reference/pro-api) lists every function with all of its options and members, generated from the type declarations so it cannot drift from the code.
- **Migration guide.** [Migrating to 1.0](https://packages.sweber.dev/lagrangian/docs/pro/migration) lists the few things worth checking when you update and explains the versioning promise.
- **Lagrangian 1.0 is supported.** The peer range of `@sweberdev/lagrangian` is now `>=0.1.0 <2.0.0`, so updating the free package to 1.0 does not conflict with Pro.

## Upgrading

Update both packages. If a page of yours must not scroll while a board or sortable list is dragged, pass `autoScroll: false` (the default since 0.5 and 0.6).
