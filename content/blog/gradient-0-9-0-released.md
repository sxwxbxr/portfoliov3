---
title: "Gradient 0.9.0: release candidate, tested on four runtimes"
excerpt: "The API is frozen for 1.0. CI now runs the built package on Node.js 20 and 22, Bun and Deno, the whole library is about 10 kB gzipped, and extractColors returns flat colors exactly."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Bun, Deno, release]
---

Gradient 0.9.0 is the release candidate for 1.0. It adds no features. It checks that what is already there holds up. Update with `npm install @sweberdev/gradient@latest`.

## Four runtimes

A color library that is used in build scripts, in the browser and on edge runtimes has to load everywhere. CI now builds the package and runs a smoke test on Node.js 20, Node.js 22, Bun and Deno. The test loads the ESM and the CommonJS build, compares the generated CSS with the reference snapshot, checks that both builds export the same names and runs the command line. The library itself uses no Node.js APIs, and a test fails if anything but the command line imports a `node:` module.

## Small

The whole library is about 10 kB gzipped, and a test keeps it under 15 kB. It is tree-shakeable: importing only `contrast` adds about 1.5 kB to your bundle.

## A bug the checks found

`extractColors()` returned `#f80808` for an image that is pure red. It used the center of its 4-bit histogram bin instead of the real color of the pixels. Flat areas now come out exact: `#ff0000` is `#ff0000`, and a logo red like `#e30613` stays `#e30613`.

## Checks that stay

- Coverage is above 95 % of statements and 97 % of lines, with a floor in CI.
- A test fails if an exported function is missing from the documentation. It found five (`stepsOf`, `STATUS_NAMES`, `STATUS_HUES`, `DEFICIENCIES`, `CONFIG_FORMATS`), now documented in the [API reference](https://packages.sweber.dev/gradient/docs/reference/api).
- The [stability page](https://packages.sweber.dev/gradient/docs/reference/stability) lists what stays the same within a major version.

The [live demo](https://packages.sweber.dev/gradient/demo) was checked with an automated accessibility audit in light and dark mode. It has no violations of its own, and a section that overflowed on a phone screen is fixed.

## Next

If nothing turns up, 0.9.0 becomes 1.0.0.
