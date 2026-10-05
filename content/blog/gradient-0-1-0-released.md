---
title: "Gradient 0.1.0 released"
excerpt: "Accessible OKLCH color scales from one brand color. The step number tells you the contrast, in light and dark mode. Export for Tailwind, CSS variables and design tokens."
date: 2026-10-05
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, OKLCH, Accessibility, Tailwind CSS, release]
---

Gradient 0.1.0 is out. It turns one brand color into an accessible color scale for light and dark mode. `@sweberdev/gradient` is on npm under the MIT licence, with no dependencies.

## Why another palette generator

Most generators space lightness evenly, so the contrast of a step depends on the hue: blue-600 passes on white, yellow-600 often does not. Gradient solves every step for a fixed contrast instead. Step 500 always reaches 3:1, step 600 reaches 4.5:1 and step 800 reaches 7:1 against the page. In dark mode the same step numbers keep the same promises against black, so one set of classes works in both modes.

## What is in 0.1.0

- Eleven steps from 50 to 950 from one color, plus a grey tinted with your brand hue.
- A readable text color for every step, for buttons and badges.
- OKLCH throughout. Colors outside sRGB are brought in by lowering chroma only, so the contrast stays where it was solved.
- Export as a Tailwind CSS v4 theme, a Tailwind v3 config, CSS custom properties, W3C design tokens or JSON.
- Contrast checks for CI, also when you pin your exact brand color.
- A CLI and a library that runs in Node.js and the browser.

## Try it

One command writes a Tailwind theme for your brand color:

```bash
npx @sweberdev/gradient "#e30613" --format tailwind --out app/gradient.css
```

Or build the palette in code and check it in CI:

```ts
import { checkPalette, createPalette, toTailwind } from "@sweberdev/gradient"
import { writeFileSync } from "node:fs"

const palette = createPalette({ brand: "#e30613", accent: "#0a84ff" })

writeFileSync("app/gradient.css", toTailwind(palette))
console.log(checkPalette(palette).every((c) => c.pass)) // true
```

Pick a color in the [live demo](https://packages.sweber.dev/gradient/demo) to see the scale and its contrast values. The full reference is at [packages.sweber.dev/gradient/docs](https://packages.sweber.dev/gradient/docs).

## What comes next

Gradient is complete and free, with no paid edition. It is also the color foundation of Lattice, a UI library that is in the works.
