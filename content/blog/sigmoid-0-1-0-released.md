---
title: "Sigmoid 0.1.0 released"
excerpt: "Scroll motion on native CSS scroll timelines, spring and S-curve easings as CSS linear(), reduced motion by default. About 2 kB, with React components."
date: 2026-10-05
author: Seya Weber
type: release
packages: [sigmoid]
tags: [Sigmoid, Animation, Scroll-driven animations, CSS, React, release]
---

Sigmoid 0.1.0 is out. It is scroll motion without the JavaScript tax. `@sweberdev/sigmoid` and `@sweberdev/sigmoid-react` are on npm under the MIT licence.

## Let the browser do the work

Most scroll animations still run in JavaScript: a listener measures elements and changes styles on every frame. Browsers can now do this themselves with CSS scroll-driven animations. Sigmoid is a small layer on top of that feature. Reveals, parallax and scroll-linked effects run on native view and scroll timelines. Browsers that do not support them yet get a tiny fallback with the same range maths, so the result looks the same everywhere.

## What is in 0.1.0

- Reveal, parallax, scrub and a reading progress bar on native view and scroll timelines.
- A zero-JavaScript mode: add `sigmoid.css` and write `data-sigmoid="fade-up"`.
- Physically correct springs, the logistic S-curve and Bézier curves, as JavaScript functions and as CSS `linear()`. They also work with Motion, GSAP, CSS transitions and Tailwind.
- `prefers-reduced-motion` respected by default: content is shown without moving it.
- React components and hooks: `Reveal`, `Parallax`, `ScrollProgress` and `useScrub`.
- About 2 kB for a reveal and 3.4 kB for everything, checked in CI.

## Install

```bash
pnpm add @sweberdev/sigmoid @sweberdev/sigmoid-react
```

```tsx
import "@sweberdev/sigmoid/sigmoid.css"
import { ease } from "@sweberdev/sigmoid"
import { Reveal, ScrollProgress } from "@sweberdev/sigmoid-react"

export default function Page() {
  return (
    <>
      <ScrollProgress className="fixed inset-x-0 top-0 h-1 bg-black" />
      <h1 data-sigmoid="fade-up">No JavaScript needed</h1>
      <Reveal as="article" preset="scale-in" easing={ease.bouncy}>
        …
      </Reveal>
    </>
  )
}
```

The `data-sigmoid` attributes work in Server Components without any client code.

Scroll through the [live demo](https://packages.sweber.dev/sigmoid/demo) to see the presets and curves. The full reference is at [packages.sweber.dev/sigmoid/docs](https://packages.sweber.dev/sigmoid/docs).
