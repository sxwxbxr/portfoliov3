---
title: "Gradient 0.6.0: gradients without the muddy middle, and colors from an image"
excerpt: "Gradient blends two or more colors in OKLCH so blue to yellow does not turn grey, checks your text on the worst stop, and picks a brand color from a logo or photo."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Gradients, OKLCH, release]
---

Gradient 0.6.0 is out, and it finally earns its name. Two additions: gradients between your colors, and a brand color taken from an image. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## Gradients that stay colorful

A CSS gradient blends in sRGB. Between opposite colors such as blue and yellow that goes through a muddy grey. `createBlend` blends lightness, colorfulness and hue in even steps instead:

```sh
npx @sweberdev/gradient blend "#e30613" "#0a84ff" --steps 5
```

```css
background: linear-gradient(90deg, #e30613, #d91f84, #b943cc, #8463f9, #0a84ff);
/* or, in current browsers: */
background: linear-gradient(90deg in oklch, #e30613, #0a84ff);
```

You get both strings: the one with all stops works everywhere, the short one lets modern browsers do the blending. Three or more colors run through each color in turn, and `hue: "longer"` takes the long way round the color wheel for rainbow-like results.

## Text on a gradient

Text has to be readable on the worst stop, not the middle one. `contrastOnBlend` checks every stop:

```ts
import { contrastOnBlend, createBlend } from "@sweberdev/gradient"

const blend = createBlend(["#e30613", "#0a84ff"])
contrastOnBlend(blend, "#ffffff") // { min: 4.2, max: 5.6, pass: false, required: 4.5 }
```

## A brand color from a logo

`extractColors` takes the pixels of an image and returns its dominant colors with their share. `pickBrand` chooses the one that makes a good brand color and skips white, black and grey, so a logo on a white background gives the logo color:

```ts
const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
const brand = pickBrand(extractColors(data, { count: 5 }))
if (brand) createPalette({ brand })
```

It works on a plain RGBA array, so Gradient stays free of dependencies. Because of that there is no command for it: the command line cannot decode images.

## Try it

The [live demo](https://packages.sweber.dev/gradient/demo) has two new sections. One compares the CSS default with the OKLCH blend and checks your text. The other reads an image in your browser (nothing is uploaded) and uses the picked color as the brand color. The guides for [gradients](https://packages.sweber.dev/gradient/docs/guides/gradients) and [colors from an image](https://packages.sweber.dev/gradient/docs/guides/image-colors) have the details.
