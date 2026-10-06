---
title: "Sigmoid 0.8.0: right-to-left, zoom and other edge cases"
excerpt: "The scroll fallback now runs the inline axis the right way round in right-to-left layouts, stays correct inside CSS zoom, and all of it is checked in Chromium, Firefox and WebKit."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, RTL, release]
---

Sigmoid 0.8.0 is out: `@sweberdev/sigmoid`, `-react`, `-vue` and `-svelte`, all MIT. It follows [0.7.0](https://packages.sweber.dev/blog/sigmoid-0-7-0-released). The API did not change; this release closes the gaps that real pages hit on the way to 1.0.

## Right-to-left layouts

On the inline axis, progress starts at the edge where text starts. In a `dir="rtl"` scroller that is the right edge, and the native CSS view timeline already behaves that way. The JavaScript fallback ran it backwards, so a horizontal reveal faded out while you scrolled towards it. That is fixed, and a browser test now scrolls an RTL container and compares both paths.

## CSS zoom

Elements inside an ancestor with `zoom` gave wrong progress in the fallback, because offsets and scroll positions use different units there. Such elements are now measured live on every frame instead of from the cache. Everything else keeps the cached path.

## What is covered, and what is not

The [browser support page](https://packages.sweber.dev/sigmoid/docs/reference/browser-support) lists the edge cases:

- `overflow: clip` does not create a scroll container, so progress follows the next scroller up, like native view timelines. It is part of the browser tests.
- `overflow: hidden`, `auto` and `scroll` do count as scroll containers.
- In an iframe, load Sigmoid inside the frame. A script in the parent does not drive elements of the child.

Size stays small: reveal and init are about 3.2 kB min+gzip. The browser tests run in Chromium, Firefox and WebKit on every change.

## Upgrade

```sh
npm install @sweberdev/sigmoid@0.8.0
```

No code changes needed. Next is 0.9, the release candidate: API frozen, docs complete, and a call for feedback before 1.0.
