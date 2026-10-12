---
title: "Lagrangian 2.0: navigation with physics and runs you can repeat"
excerpt: "Lagrangian 2.0 is out, free and Pro. The world is deterministic, with seed, snapshots and replay. Pro adds stack navigation with swipe back and shared elements, a referee for nested gestures, and Vue and Svelte packages."
date: 2026-10-12
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Navigation, release, "2.0"]
---

Lagrangian 2.0.0 is out. `@sweberdev/lagrangian`, `-react`, `-vue` and `-svelte` are on npm at 2.0.0, MIT licensed. Lagrangian Pro 2.0.0 is available for subscribers, with two new packages: `@weber-development/lagrangian-pro-vue` and `@weber-development/lagrangian-pro-svelte`. Prices and licences are unchanged, and every existing subscription and lifetime licence includes 2.0.

## Free: runs you can repeat

The world already simulated in fixed steps. In 2.0 everything that depended on the frame rate follows: sleeping and sensor events are decided in every step, so the same bodies, inputs and seed give the same numbers at 60 Hz, at 144 Hz and on another machine.

```ts
const world = new World({ seed: 7, bounds });
world.add({ x: 120 + world.random() * 200, y: 40, radius: 20 });

world.advance(2);                 // simulate two seconds now, without the page
const saved = world.snapshot();   // plain JSON
world.advance(3);
const after = world.hash();       // "9c1f0a4e"

world.restore(saved);
world.advance(3);
world.hash() === after;           // true
```

That makes physics testable: assert on a hash, store a scene as a snapshot, or replay a run on a server. `world.advance()`, `world.time`, `world.random()`, `world.snapshot()`, `world.restore()` and `world.hash()` are new.

## Pro: navigation with physics

**Stack navigation.** `stackNav` turns the children of an element into a navigation stack. A new page slides in while the one below drifts back, and the top page can be swiped away from the left edge: it follows the finger and lands where the throw would carry it. Elements with the same `data-shared` value on two pages fly from one place to the other, with their size, on the way in and on the way back. Only the top page can be reached, focus moves to the new page and returns to the opener, a live region announces the title, and Alt+ArrowLeft goes back.

```ts
const nav = stackNav(document.querySelector("#app"));
await nav.push(detailPage);
await nav.pop();
```

**A referee for gestures.** A carousel inside a drawer, a sheet around a carousel and the swipe back at the edge all want the same finger. In 2.0 they decide: nothing moves until the finger has moved a few pixels, the direction picks the candidates, and the first part that can move that way wins. A carousel on its last slide declines, so the drawer around it takes the swipe. The same function, `contend`, is available for your own parts.

**Vue and Svelte.** Composables (`useSheet`, `useDrawer`, `useStackNav` and the rest) for Vue 3 and actions for Svelte 3, 4 and 5, next to the React hooks, which gain `useStackNav`.

Everything is tested in jsdom and in real Chromium on every change, including the shared-element flight, the swipe back and a carousel inside a drawer.

## Breaking changes

- **Dragging starts after the finger has moved a few pixels**, not on touch-down (Pro). A tap no longer stops a running animation of a sheet, drawer or carousel until the finger moves.
- **Sleeping and sensor events are decided per step**, not per frame (free). In some scenes a body falls asleep or triggers a sensor a frame or two earlier or later. `legacyStepping: true` keeps the old timing for 2.0 and is removed in 2.1.
- **Node 22 or newer** to build and test.

## Upgrading

Update the packages and read [Migrating to 2.0](https://packages.sweber.dev/lagrangian/docs/migrating-to-2); it is short. Lagrangian Pro 1.0.1 and newer already allow Lagrangian 2 in their peer range, so you can update the free packages first. Version 1.x gets security and bug fixes for 12 months from today.

Learn more: [stack navigation](https://packages.sweber.dev/lagrangian/docs/pro/stack-nav), [gestures](https://packages.sweber.dev/lagrangian/docs/pro/gestures) and [reproducible runs](https://packages.sweber.dev/lagrangian/docs/guides/world).
