---
title: "Lagrangian Pro 1.0: a stable API for interfaces that move like real objects"
excerpt: "Lagrangian Pro reaches 1.0 with a frozen API, semantic versioning, React hooks for every part and tests in jsdom and in real Chromium."
date: 2026-10-07
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Physics, release]
---

Lagrangian Pro 1.0 is out. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence. The API is the same as in 0.9, so updating is a version bump.

## What 1.0 means

From now on Lagrangian Pro follows semantic versioning. A minor version adds parts and options, a patch fixes bugs, and an option or method is only removed in a major version after it has been marked as deprecated. The [API reference](https://packages.sweber.dev/lagrangian/docs/reference/pro-api) lists everything that is covered.

## What is in it

- **Overlays:** bottom sheet with detents, side drawer, modal dialog, popover and a toast stack.
- **Gestures:** swipe stack with undo, carousel, pull to refresh, zoom and pan.
- **Reordering:** sortable lists, grids and kanban boards with keyboard and screen reader support, scrolling while you drag.
- **Motion:** layout transitions for any DOM change, sliding indicators, jelly deformation, ropes and chains, a page effect that lets a section fall apart, and synthesized impact sounds.
- **React:** a hook for every part, tested with React 18 and 19 and Strict Mode.
- **Quality:** unit tests in jsdom and end-to-end tests in real Chromium on every change, a written [accessibility overview](https://packages.sweber.dev/lagrangian/docs/pro/accessibility) and [recipes](https://packages.sweber.dev/lagrangian/docs/pro/recipes) for a form in a sheet, an image gallery and a kanban board.

Everything runs on the free [Lagrangian](https://packages.sweber.dev/lagrangian) physics, which stays MIT licensed.

## Upgrading

Update both packages and read [Migrating to 1.0](https://packages.sweber.dev/lagrangian/docs/pro/migration); it is short.
