---
title: "Gradient 1.0: accessible color scales, now stable"
excerpt: "Gradient turns one brand color into scales where the step number tells you the contrast, in light and dark mode. 1.0 is the first stable release: the API and the generated colors are covered by semantic versioning."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Accessibility, OKLCH, Tailwind CSS, release]
---

Gradient 1.0 is out. It is free, MIT-licensed, has no dependencies, and from today it is stable. Install it with `npm install @sweberdev/gradient`, or try it without installing: `npx @sweberdev/gradient "#e30613" --format table`.

## What Gradient does

You give it one brand color. It gives you eleven steps from 50 to 950, for light and dark mode, plus a grey tinted with your hue. Most palette generators space the lightness evenly, so contrast depends on the hue: `blue-600` passes on white, `yellow-600` often does not. Gradient solves every step for a fixed contrast instead, in OKLCH. Step 500 always reaches 3:1, step 600 4.5:1 and step 800 7:1, for every color you start from. The step number tells you what the color can be used for.

Over the last days Gradient grew from that core:

- **Status colors** that match your brand, and a color vision check that warns when two colors look alike (0.2).
- **Check any two colors** with the WCAG 2 ratio, APCA and the closest color that passes, plus Sass and TypeScript export (0.3).
- **A shadcn/ui theme** and chart colors that stay apart for people with a color vision deficiency (0.4).
- **Audit of an existing stylesheet** that suggests one fixing color per step (0.5).
- **Gradients** blended in OKLCH, and a brand color picked from a logo (0.6).
- **One config file**, `gradient build --verify` for CI and a GitHub Action (0.7).
- **A tested stability promise** and guides for WCAG, recipes and migration (0.8), then runtime and size checks on Node.js, Bun and Deno (0.9).

## What stable means

From 1.0 the exported API, the command line, the config file and the generated files follow semantic versioning. Within 1.x the same input gives byte-for-byte the same files, and the contrast promises are never weakened. The only exception is a fix for a broken promise, which the changelog names. Tests snapshot every exported name and every output format, so a change that alters them fails the build. The [stability page](https://packages.sweber.dev/gradient/docs/reference/stability) lists what may change in a minor version.

1.0.0 itself changes nothing compared to the 0.9.0 release candidate, so if you are on 0.9 you can update without a diff.

## Where it fits

Gradient is the color foundation for the next UI library on packages.sweber.dev, and it is free so that it can be used anywhere. Use it to generate the colors of a Tailwind or shadcn/ui project once and verify them in CI, to check the colors you already have, or in the browser, for a theme editor.

The [live demo](https://packages.sweber.dev/gradient/demo) shows all of it with your own colors, and the [documentation](https://packages.sweber.dev/gradient/docs) has the guides.
