---
title: "Sigmoid 0.3.0: scroll stories, scroll containers and Tailwind CSS v4"
excerpt: "story() turns a pinned section into steps, the fallback now works inside scrolling panels, two new presets join the set, and the spring curves come to Tailwind as ease-bouncy and friends."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, CSS, React, Tailwind CSS, release]
---

Sigmoid 0.3.0 is out. `@sweberdev/sigmoid` and `@sweberdev/sigmoid-react` are on npm under the MIT licence. It follows [0.2.0](https://packages.sweber.dev/blog/sigmoid-0-2-0-released), which brought stagger and `track()`.

## Scroll stories with story()

A scroll story is a tall section whose content stays in place while the reader scrolls through a few steps. CSS already does the pinning with `position: sticky`. What was missing is the answer to "which step are we on?":

```ts
import { story } from "@sweberdev/sigmoid";

story("#how", {
  steps: 3,
  onStep: (i) => show(i), // 0, 1, 2
});
```

`story` splits the `contain` range of the section into equal steps. For a section taller than the window, that is exactly the time its sticky content is pinned. It also sets `data-sigmoid-step` and `--sigmoid-progress` on the section, so you can style the steps in CSS without a callback:

```css
#how[data-sigmoid-step="1"] .figure { rotate: 45deg; }
```

In React, `useStory(ref, { steps: 3 })` returns the active step and re-renders only when it changes. The page does not scroll on its own and no wheel events are taken over: the reader stays in control.

## Reveals inside scrolling panels

CSS `view()` timelines follow the nearest scroll container: a sidebar, a modal or a carousel. Until now the JavaScript fallback always measured against the page, so reveals inside such a panel were off in browsers without scroll timelines. The fallback now finds the same container as `view()` and measures against its visible area. One scroll listener still serves every element. In Chromium, native and fallback now give the same opacity inside a scrolling panel.

## Two new presets

`rotate-in` arrives with a slight turn and scale, and `flip-up` tilts towards the reader in 3D. Both work in JavaScript and as `data-sigmoid="flip-up"` in `sigmoid.css`, so there are ten entrances now.

## Tailwind CSS v4

The curves are now a Tailwind theme:

```css
@import "tailwindcss";
@import "@sweberdev/sigmoid/tailwind.css";
```

```html
<button class="transition-transform duration-500 ease-bouncy hover:scale-105">Buy</button>
```

You get `ease-standard`, `ease-sigmoid`, `ease-smooth`, `ease-bouncy` and `ease-wobbly`. Tailwind's own `ease-in`, `ease-out` and `ease-linear` keep their meaning.

## Size

`reveal` with `init` is about 2.4 kB min+gzip, everything about 3.9 kB. The size check in CI keeps both within budget.

## Try it

The [live demo](https://packages.sweber.dev/sigmoid/demo#story) has a new scroll story section, and the reveal gallery shows the two new presets. The [docs](https://packages.sweber.dev/sigmoid/docs) cover `story()`, scroll containers and the Tailwind setup.

```bash
pnpm add @sweberdev/sigmoid
```
