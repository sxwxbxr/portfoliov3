---
title: "Sigmoid 0.7.0: a faster fallback, a benchmark and a stable API"
excerpt: "The JavaScript fallback is about four times cheaper, there is a public benchmark against GSAP ScrollTrigger, Motion and AOS that you can run yourself, migration guides, and tests that pin the public API for 1.x."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Performance, Animation, Scroll-driven animations, GSAP, Motion, release]
---

Sigmoid 0.7.0 is out: `@sweberdev/sigmoid`, `-react`, `-vue` and `-svelte`, all MIT. It follows [0.6.0](https://packages.sweber.dev/blog/sigmoid-0-6-0-released). This release is about trust: speed you can check, an API that stays put, and a way over from the libraries you use today.

## A faster fallback

In browsers without scroll timelines Sigmoid drives the animation from one scroll listener. It used to measure every element on every frame. Now it measures an element once and reuses the position until the layout changes: on resize, when an element changes size, or when the page gets taller or wider. It also skips writes when nothing moved. With 300 elements, a full scroll went from about 340 ms to about 70 ms of script time.

If something only moves elements, such as reordering a list, call the new `refresh()` and everything is measured again on the next frame. A new browser test adds content above an animated element and checks that all three browsers pick it up.

## A benchmark you can run

The [benchmark](https://packages.sweber.dev/sigmoid/docs/reference/benchmark) builds the same effect, cards that fade up while scrolling in, with Sigmoid, GSAP ScrollTrigger, Motion and AOS, and measures size and scroll cost in real Chromium. The script is in the repository: `pnpm bench`.

What it shows, without spin:

- **Size:** a reveal is about 3 kB, GSAP with ScrollTrigger about 45 kB, Motion about 23 kB.
- **JavaScript:** on a native timeline Sigmoid runs about 1 ms while scrolling, because the browser does the work.
- **Main-thread time:** with 30 elements all libraries are close. With 300 elements animating at the same time, Chromium updates every view timeline on the main thread, and in our headless test the native path costs more main-thread time than GSAP. The page says so. For very long lists, reveal only what is near the viewport.

## A stable API

Tests now check the export list of every package, so removing or renaming anything fails CI. The new [stability page](https://packages.sweber.dev/sigmoid/docs/reference/stability) states what is public (the exports, the `data-sigmoid*` attributes, the `--sigmoid-*` properties, the preset names), how versions are numbered, and how deprecations work: marked first, kept for at least a minor version and six months.

## Migration guides

The new [migration guide](https://packages.sweber.dev/sigmoid/docs/guides/migrating) maps GSAP ScrollTrigger, AOS and Motion to Sigmoid in tables, and says plainly what Sigmoid does not cover (timelines with many tweens, snapping, layout animations, gestures). Where both libraries make sense together, the curves from Sigmoid work inside them.

## Try it

```bash
pnpm add @sweberdev/sigmoid
```
