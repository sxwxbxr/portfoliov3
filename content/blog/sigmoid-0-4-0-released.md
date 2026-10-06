---
title: "Sigmoid 0.4.0: Vue, a curve editor and browser tests"
excerpt: "Sigmoid now has a Vue package with v-reveal and composables, an online curve editor that copies springs as CSS linear(), and a test that proves in real Chromium that native timelines and the fallback look the same."
date: 2026-10-06
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Vue, Animation, Scroll-driven animations, CSS, Easing, release]
---

Sigmoid 0.4.0 is out. `@sweberdev/sigmoid`, `@sweberdev/sigmoid-react` and the new `@sweberdev/sigmoid-vue` are on npm under the MIT licence. It follows [0.3.0](https://packages.sweber.dev/blog/sigmoid-0-3-0-released) with scroll stories and Tailwind support.

## Vue

`@sweberdev/sigmoid-vue` brings the same scroll motion to Vue 3.3 and newer:

```ts
import { createApp } from "vue";
import { SigmoidPlugin } from "@sweberdev/sigmoid-vue";

createApp(App).use(SigmoidPlugin).mount("#app");
```

```vue
<h2 v-reveal="'fade-up'">Our work</h2>
<li v-for="(item, i) in items" :key="item.id" v-reveal="{ preset: 'scale-in', shift: i * 8 }">
  {{ item.name }}
</li>
<img v-parallax="40" src="hero.jpg" alt="" />
```

The directive restarts only when its value changes, not on every render, and cancels the animation when the element unmounts. For values CSS cannot animate there are composables that return refs:

```ts
const progress = useScrollProgress(stat); // Ref<number>, 0 to 1
const { step } = useStory(how, { steps: 3 }); // active step of a pinned section
```

`useReveal`, `useParallax`, `useScrub` and `useReducedMotion` are there too. Everything starts in `onMounted`, so server-side rendering is safe. The [docs](https://packages.sweber.dev/sigmoid/docs) have a Vue guide.

## A curve editor

Springs and S-curves cannot be written as a `cubic-bezier()`. Sigmoid solves them and exports a short CSS `linear()` value. The new [curve editor](https://packages.sweber.dev/sigmoid/curves) lets you tune a spring, an S-curve or a Bézier curve, drag the Bézier handles in the plot, and play the result as a plain CSS transition.

Copy the curve as a CSS transition, a CSS variable, a Tailwind v4 theme entry, a JavaScript call, or for Motion and GSAP. Every setting is stored in the address, so a curve is one link you can send to a colleague.

## Proof that native and fallback agree

Sigmoid promises that browsers with scroll timelines and browsers without them look the same. Until now that was covered by unit tests with fake animations. CI now also opens real Chromium and compares the native CSS view timeline with the forced JavaScript fallback at several scroll positions, on the page and inside a scrolling panel. The opacity must match within 2 percent. The check runs on every pull request.

## Try it

The [curve editor](https://packages.sweber.dev/sigmoid/curves) and the [live demo](https://packages.sweber.dev/sigmoid/demo) are the quickest ways to see it.

```bash
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-vue
```
