---
title: "Sigmoid 0.9.0: the 1.0 release candidate"
excerpt: "The API is frozen. Sigmoid 0.9.0 is the release candidate for 1.0: the same features as 0.8, a complete reference, and a call for feedback before the final version."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, release]
---

Sigmoid 0.9.0 is out: `@sweberdev/sigmoid`, `-react`, `-vue` and `-svelte`, all MIT. It follows [0.8.0](https://packages.sweber.dev/blog/sigmoid-0-8-0-released) and is the release candidate for 1.0.

## What the freeze means

Everything in the [API reference](https://packages.sweber.dev/sigmoid/docs/reference/api) stays as it is: the exports of the four packages, the `data-sigmoid*` attributes, the `--sigmoid-*` properties and the preset names. Tests fail when an export disappears. 1.0.0 will bring no API changes, only fixes found in this phase. The [stability policy](https://packages.sweber.dev/sigmoid/docs/reference/stability) already applies: patch releases fix bugs, minor releases add, only a major release may break, and deprecations live for at least one minor version and six months.

## What changed

The reference now lists `refresh()`, the last export that was missing. There is no new feature on purpose.

## What is checked

- 62 unit tests across core, React, Vue and Svelte.
- Real-browser tests in Chromium, Firefox and WebKit: page, container, inline axis, right-to-left, zoom, scrub ranges, linked animations and counters, native and fallback side by side.
- Size budgets: reveal and init about 3.2 kB min+gzip.
- A [benchmark](https://packages.sweber.dev/sigmoid/docs/reference/benchmark) against GSAP ScrollTrigger, Motion and AOS you can run yourself.

## Help wanted

If something does not work in your project, tell us before 1.0: open an issue at [Weber-Development/sigmoid](https://github.com/Weber-Development/sigmoid/issues). Fixes that need no API change go into 1.0.0.

```sh
npm install @sweberdev/sigmoid@0.9.0
```
