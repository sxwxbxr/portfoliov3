---
title: "Sigmoid 0.5.0: horizontal scrolling, split text and counters"
excerpt: "Sigmoid now follows horizontal scrolling, splits headlines into words that arrive one by one, runs a scrub over part of the page and counts numbers up with one attribute, plus a recipes page in the docs."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, CSS, Vue, React, release]
---

Sigmoid 0.5.0 is out: `@sweberdev/sigmoid`, `@sweberdev/sigmoid-react` and `@sweberdev/sigmoid-vue`, all MIT. It follows [0.4.0](https://packages.sweber.dev/blog/sigmoid-0-4-0-released) and is one step towards 1.0.

## Horizontal scrolling

Carousels and galleries scroll sideways. `axis: "inline"` makes `reveal`, `track` and `story` follow that direction, natively with a CSS `view(inline)` timeline and in the fallback, which measures against the nearest horizontal scroll container:

```ts
reveal(".slide", { axis: "inline", keyframes: "scale-in", stagger: 10 });
```

In CSS: `data-sigmoid-axis="inline"`.

## Split text

```ts
import { reveal, splitText } from "@sweberdev/sigmoid";

const { elements, parent } = splitText("h1"); // or { by: "chars" }
reveal(elements, { subject: parent, keyframes: "fade-up", stagger: 6 });
```

`splitText` wraps every word or character. The new `subject` option makes one element, the headline, drive all of them. Without it each word would animate at its own scroll position. Screen readers keep reading the original text, the pieces are hidden from them, and `revert()` puts the markup back.

## Scrub over part of the page

```ts
scrub(".sky", [{ backgroundColor: "#bde0fe" }, { backgroundColor: "#03045e" }], {
  range: [25, 75],
});
```

The animation runs between 25% and 75% of the scroll distance, the same in the native timeline and in the fallback.

## Counters without JavaScript

```html
<span data-sigmoid="count" style="--sigmoid-count: 1200" role="img" aria-label="1200"></span>
```

The number counts up while it scrolls into view, using a registered custom property and a CSS counter. Without scroll timelines it shows the end value; `init()` animates it in the fallback. For other formats use `track()`.

## Same result in every browser, checked

The Chromium check in CI now also compares the native timeline with the fallback for the inline axis and for scrub ranges, and verifies the counter. Reveal with `init` is now about 2.8 kB min+gzip, everything about 4.5 kB.

## Recipes

The docs have a new [recipes page](https://packages.sweber.dev/sigmoid/docs): counters, reading progress, a shrinking header, words one by one, a horizontal gallery, scroll stories and image sequences.

## Try it

The [live demo](https://packages.sweber.dev/sigmoid/demo#text) has a headline that arrives word by word, a horizontal row of cards and a number that counts up.

```bash
pnpm add @sweberdev/sigmoid
```
