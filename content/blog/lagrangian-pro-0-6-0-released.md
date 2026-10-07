---
title: "Lagrangian Pro 0.6.0: board scrolling, browser tests and recipes"
excerpt: "A board that scrolls while you drag, a fix for automatic scrolling found by the new end-to-end tests in real Chromium, and new docs: popover, recipes and an accessibility overview."
date: 2026-10-07
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Testing, Accessibility, release]
---

Lagrangian Pro 0.6.0 is out. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence.

## What is new

- **Board scrolls while you drag.** Hold a card near the edge of the window or of a scrollable parent and the board scrolls by itself, like sortable lists did since 0.5.0. `autoScroll: { edge, speed }` tunes it and `false` turns it off.
- **Tests in a real browser.** Every pull request now runs end-to-end tests in Chromium: dragging and reordering with the mouse, scrolling while dragging in sortable lists and boards, popover placement and Escape, the focus trap of the dialog and reduced motion. The first run found a real bug: automatic scrolling could stall on its first frame. It is fixed in this release.
- **Docs.** A page for the [popover](https://packages.sweber.dev/lagrangian/docs/pro/popover), [recipes](https://packages.sweber.dev/lagrangian/docs/pro/recipes) for a form in a bottom sheet, an image gallery and a kanban board, and an [accessibility overview](https://packages.sweber.dev/lagrangian/docs/pro/accessibility) that lists keyboard support, roles and announcements for every part.

## Upgrading

Nothing to change. If your page scrolls while you drag boards, the new behaviour starts on its own; pass `autoScroll: false` to keep the old one.
