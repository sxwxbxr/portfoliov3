---
title: "Lagrangian 1.0: a stable API for animation with real physics"
excerpt: "Lagrangian reaches 1.0 under the MIT licence. The API is stable and follows semantic versioning, with springs, inertia, a 2D world with polygons, and adapters for React and Svelte."
date: 2026-10-07
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Spring, release]
---

Lagrangian 1.0 is out. `@sweberdev/lagrangian`, `@sweberdev/lagrangian-react` and `@sweberdev/lagrangian-svelte` are on npm at 1.0.0, free under the MIT licence. From here on the public API follows semantic versioning: breaking changes only come with a new major version.

## What 1.0 contains

- **Springs** solved in closed form, exact at any frame rate. A new target continues the motion with its current velocity instead of restarting it.
- **Gestures with inertia.** `draggable()` measures the release speed, glides with friction like iOS scrolling, rubber-bands past the edges and lands exactly on snap points. `scroller()` does the same for scroll areas.
- **A small 2D world.** Circles, rotating boxes and convex polygons with gravity, restitution, Coulomb friction and rolling, plus springs, hinges, rods, motors, sensors and a pointer joint. Bodies fall asleep when they rest.
- **Adapters.** React hooks and Svelte actions with the same options as the core. The package stays at about 12 kB min+gzip for everything, tree-shakeable down to 2 kB, and the size is checked in CI.
- **Reduced motion** is respected: automatic motion jumps to where it would rest.

## Vue

`@sweberdev/lagrangian-vue` is written and tested, but npm refuses the first publish of this new package with a rate-limit error. It will follow as soon as that clears, with the same version number.

## Updating

If you use 0.4, nothing changes: 1.0.0 is the 0.4 API declared stable. [Lagrangian Pro 1.x](https://packages.sweber.dev/lagrangian) works with it. Start with the [docs](https://packages.sweber.dev/lagrangian/docs) or try the [live demo](https://packages.sweber.dev/lagrangian/demo).
