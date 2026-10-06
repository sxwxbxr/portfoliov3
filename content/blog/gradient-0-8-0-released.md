---
title: "Gradient 0.8.0: a stability promise, tested, and four new guides"
excerpt: "Every exported name and every generated file is now snapshot-tested, so colors stay identical within a major version. Plus any color format in every function, and guides for WCAG, recipes and migration."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Accessibility, WCAG 2.2, release]
---

Gradient 0.8.0 is out. It is the release where the API gets a review before it is frozen for 1.0, and where the promise that generated colors do not change by accident gets a test. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## Colors stay the same

If you commit the files Gradient generates, an update must not rewrite your stylesheet. The tests now keep a snapshot of every exported name and of every output format (CSS in four variants, Tailwind v4 and v3, Sass, TypeScript, shadcn/ui, design tokens, JSON, the table, chart series, gradients and the config build) for three reference palettes: a red, a yellow that is hard for contrast and a pinned indigo. A change that alters the API or a generated file fails the build until someone updates the snapshot on purpose and says so in the changeset.

From 1.0 this is the policy, written down in the [stability page](https://packages.sweber.dev/gradient/docs/reference/stability): within a major version the same input gives byte-for-byte the same files, the contrast promises are never weakened, and the only exception is a fix for a broken promise, which the changelog names.

## Every function takes every color

The API review found one inconsistency. `contrast()`, `luminance()`, `simulate()` and `deltaE()` accepted only hex, while everything else took `rgb()`, `hsl()` and `oklch()` too. Now they all do, and out-of-gamut colors are mapped first so the measurement matches what people see:

```ts
import { contrast } from "@sweberdev/gradient"

contrast("oklch(62% 0.2 250)", "#ffffff") // 3.64
```

`PROMISES`, the list of contrast promises behind the step numbers, is exported as well. The review found nothing that needed a deprecation.

## Four new guides

- [WCAG and the European Accessibility Act](https://packages.sweber.dev/gradient/docs/guides/wcag): which criteria the promises cover (1.4.3, 1.4.6, 1.4.11) and what no color tool can check.
- [Recipes](https://packages.sweber.dev/gradient/docs/guides/recipes): generate before every build, Next.js with shadcn/ui, Vite, a theme editor in the browser.
- [Migrating to Gradient](https://packages.sweber.dev/gradient/docs/guides/migration): from the Tailwind default colors, where `yellow-600` reaches 2.94:1 on white and `sky-600` 4.10:1, and from hand-written variables.
- [Stability](https://packages.sweber.dev/gradient/docs/reference/stability): what stays the same and what may change in a minor version.

## What is next

0.9.0 is the release candidate: runtime and bundle-size checks on Node.js 20, 22, Bun and Deno, a coverage floor and an accessibility pass over the demo. After that, 1.0.0.
