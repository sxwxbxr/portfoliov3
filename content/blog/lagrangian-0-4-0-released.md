---
title: "Lagrangian 0.4.0: polygons, and adapters for Vue and Svelte"
excerpt: "Bodies in the world can now be any convex polygon, from triangles to hexagons and arrows. Vue and Svelte get their own small adapters next to React."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Polygons, Vue, Svelte, release]
---

Lagrangian 0.4.0 is out under the MIT licence: `@sweberdev/lagrangian` and `@sweberdev/lagrangian-react`, plus the new `@sweberdev/lagrangian-vue` and `@sweberdev/lagrangian-svelte`.

## What is new

- **Polygons.** Give a body `vertices` and it becomes any convex shape: triangles, hexagons, arrows, shards. Polygons turn around their centre of mass, get mass and inertia from the outline, collide with circles, boxes and each other, and tip over, stack and slide with the same friction as the other bodies. `regularPolygon(sides, radius)` builds the common ones. A concave outline collides as its convex hull.
- **Vue.** `@sweberdev/lagrangian-vue` offers composables (`useSpring`, `useSpringProps`, `useDraggable`, `useScroller`, `useWorld`, `useBody`), with the same options as the core.
- **Svelte.** `@sweberdev/lagrangian-svelte` offers actions (`use:spring`, `use:drag`, `use:scroll`, `use:physics`, `use:body`) and a spring store.
- The package is now about 12 kB min+gzip for everything, still tree-shakeable, with the size checked in CI.

## A small example

```ts
import { regularPolygon, World } from "@sweberdev/lagrangian";

const world = new World({ bounds: box }).start();
world.add({
  x: 400, y: 40,
  vertices: regularPolygon(6, 36),
  restitution: 0.4,
  element: hex,
});
```

```svelte
<aside use:spring={{ props: { x: open ? 0 : -320 }, options: { bounce: 0.15 } }}>…</aside>
```

## Try it

The [world guide](https://packages.sweber.dev/lagrangian/docs/guides/world) covers polygons, and there are guides for [Vue](https://packages.sweber.dev/lagrangian/docs/guides/vue) and [Svelte](https://packages.sweber.dev/lagrangian/docs/guides/svelte). [Lagrangian Pro](https://packages.sweber.dev/lagrangian) works with this release.
