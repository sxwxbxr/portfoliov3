---
title: "Sigmoid 0.6.0: Svelte, linked animations and tests in three browsers"
excerpt: "A Svelte package, animations that one element drives for another, pinned sections with one attribute, an Astro guide, and scroll tests that now run in Chromium, Firefox and WebKit on every change."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Svelte, Astro, Animation, Scroll-driven animations, CSS, release]
---

Sigmoid 0.6.0 is out: `@sweberdev/sigmoid`, `-react`, `-vue` and the new `@sweberdev/sigmoid-svelte`, all MIT. It follows [0.5.0](https://packages.sweber.dev/blog/sigmoid-0-5-0-released) on the way to 1.0.

## Svelte

`@sweberdev/sigmoid-svelte` is a set of plain actions for Svelte 4 and 5, SvelteKit included. There is nothing to compile:

```svelte
<script lang="ts">
  import { reveal, parallax, track } from "@sweberdev/sigmoid-svelte";
  let progress = 0;
</script>

<h2 use:reveal={"fade-up"}>Our work</h2>
<li use:reveal={{ preset: "scale-in", shift: i * 8 }}>{item.name}</li>
<img use:parallax={40} src="hero.jpg" alt="" />
<p use:track={{ onProgress: (p) => (progress = p) }}>{Math.round(progress * 100)} %</p>
```

`use:story` reports the active step of a scroll story. Actions restart only when their parameters change by value.

## Astro

Astro needs no adapter. The docs now have a short guide: `data-sigmoid` markup in `.astro` files, one `init()` call, and how to start it again after a view transition.

## Linked animations

One element can drive the animation of others, such as a tall stage that fades in captions somewhere else:

```ts
reveal(".caption", { subject: stage, keyframes: "fade-up", range: "cover 5% cover 30%" });
```

In markup:

```html
<div id="stage" data-sigmoid-timeline="stage">…</div>
<p data-sigmoid-follow="stage" data-sigmoid-preset="fade-up">Caption</p>
```

`init()` starts these in every browser. It creates the view timeline in JavaScript, so the browser still drives it natively and your CSS needs no `timeline-scope`.

## Pinned sections

```html
<section data-sigmoid-pin style="--sigmoid-pin-length: 300vh">
  <div>…</div>
</section>
```

The section becomes tall and its first child stays in view with `position: sticky`. Combine it with `story()` for scroll stories.

## Tested in three browsers

Until now the scroll scenarios ran in Chromium. CI now runs them in Chromium, Firefox and WebKit on every change: on the page, in a scroll container, on the inline axis, with scrub ranges, linked animations and counters. Each scenario has expected values. Chromium and WebKit run the native path and the forced fallback, Firefox the fallback. All of them must give the same result.

## Try it

The [live demo](https://packages.sweber.dev/sigmoid/demo#linked) has a stage that drives two captions elsewhere on the page.

```bash
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-svelte
```
