---
title: "Sigmoid 0.2.0: stagger and track()"
excerpt: "Lists and grids now arrive one after another with a single option, also in pure CSS, and track() hands you scroll progress as a number for counters, video or canvas."
date: 2026-10-05
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, CSS, React, release]
---

Sigmoid 0.2.0 is out. `@sweberdev/sigmoid` and `@sweberdev/sigmoid-react` are on npm under the MIT licence.

## Stagger

A grid that appears all at once looks flat. With `stagger`, every further element starts a little later:

```ts
import { reveal } from "@sweberdev/sigmoid";

reveal(".team li", { keyframes: "fade-up", stagger: 8 });
```

Each element's range starts 8% later than the one before. Native scroll timelines and the JavaScript fallback use the same shifted range, so both look the same.

It also works without JavaScript. Give list items an index and `sigmoid.css` shifts the range with `calc()`:

```html
<li data-sigmoid="fade-up" style="--sigmoid-index: 0">…</li>
<li data-sigmoid="fade-up" style="--sigmoid-index: 1">…</li>
<li data-sigmoid="fade-up" style="--sigmoid-index: 2">…</li>
```

In React, `shift` does the same for one element: `<Reveal shift={i * 8}>`.

## track()

Some things CSS cannot animate: a counter, the frame of a video, a drawing on a canvas. `track` reports how far an element has travelled through the window, as a number from 0 to 1, with the same range syntax as the animations:

```ts
import { track } from "@sweberdev/sigmoid";

track(".stat", (p, el) => {
  el.textContent = Math.round(p * 1200).toLocaleString();
}, { range: "entry 0% cover 50%" });
```

It shares the single passive scroll listener of the fallback and only calls you when the value changes. In React, `useScrollProgress(ref)` returns the value.

## Size

`reveal` with `init` is now about 2.2 kB min+gzip, everything about 3.6 kB. The size check in CI keeps both within budget.

## Try it

The [live demo](https://packages.sweber.dev/sigmoid/demo) has a stagger switch on the reveal cards and counters driven by `track()`. The [docs](https://packages.sweber.dev/sigmoid/docs) cover both features.

```bash
pnpm add @sweberdev/sigmoid
```
