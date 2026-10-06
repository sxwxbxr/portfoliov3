---
title: "Sigmoid 1.0: stable scroll motion for CSS, React, Vue and Svelte"
excerpt: "Sigmoid 1.0 is out. Native CSS scroll timelines with a tiny fallback, spring and S-curve easings, four packages and a stable API under semantic versioning."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, React, Vue, Svelte, release]
---

Sigmoid 1.0.0 is out: `@sweberdev/sigmoid`, `-react`, `-vue` and `-svelte`, all MIT. It is the release candidate [0.9.0](https://packages.sweber.dev/blog/sigmoid-0-9-0-released) without changes to the API.

## What Sigmoid is

Scroll motion without the JavaScript tax. Reveals, parallax, scroll-linked progress and counters run on native CSS scroll timelines where the browser has them, and on one passive scroll listener where it does not. Spring and S-curve easings are shipped as CSS `linear()`. Reduced motion is respected by default. A reveal is about 3 kB min+gzip, everything about 5 kB.

```html
<link rel="stylesheet" href="sigmoid.css" />
<h2 data-sigmoid="fade-up">Our work</h2>
```

## What is in 1.0

- Presets, `reveal`, `parallax`, `scrub` with ranges, `track`, `story`, `splitText`, counters and pinned sections, on the block and the inline axis, in page and scroll containers, left to right and right to left.
- Linked animations: one element drives another through named timelines.
- Adapters for React, Vue and Svelte, a Tailwind v4 theme and an Astro guide.
- A [curve editor](https://packages.sweber.dev/sigmoid/curves) and a live demo of every feature.
- A [benchmark](https://packages.sweber.dev/sigmoid/docs/reference/benchmark) against GSAP ScrollTrigger, Motion and AOS, and [migration guides](https://packages.sweber.dev/sigmoid/docs/guides/migrating).
- Tests: 62 unit tests and real-browser tests in Chromium, Firefox and WebKit, native and fallback compared.

## What 1.0 promises

The [stability policy](https://packages.sweber.dev/sigmoid/docs/reference/stability): patch releases fix bugs, minor releases add features without breaking anything, only a major release may break, and deprecations stay for at least one minor version and six months. Tests fail when an export disappears.

## Where it is honest

With hundreds of elements animating at once, Chromium's native path costs more main-thread time than GSAP in our headless benchmark. The benchmark page says so; for very long lists, reveal only what is near the viewport. Inside CSS `zoom`, the fallback measures live instead of from its cache.

## Install

```sh
npm install @sweberdev/sigmoid
```

Thanks to everyone who tried the release candidates. Feedback and issues are welcome at [Weber-Development/sigmoid](https://github.com/Weber-Development/sigmoid/issues).
