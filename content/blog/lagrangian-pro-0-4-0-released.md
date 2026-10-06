---
title: "Lagrangian Pro 0.4.0: drag and drop boards and zoom"
excerpt: "Rearrange a wrapping grid or the columns of a kanban board with springs, and zoom and pan images and maps with pinch, wheel and double tap."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Physics, Gestures, React, release]
---

Lagrangian Pro 0.4.0 is out with two parts that are hard to get right: a board that rearranges items in two dimensions, and zoom and pan for images and maps. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence.

## What is new

- **Board.** Drag to rearrange the items of a wrapping grid, or move cards between the columns of a board. The item follows the pointer at the point you grabbed it, the others spring aside while you hover, and on release it settles into its slot. The slot is found in reading order, so CSS grids, flex-wrap layouts, items of different heights and empty columns all work. `canDrop` decides which columns accept an item, and with `commit` your framework changes the state while the board puts the DOM back and plays the transition after it has rendered.
- **Keyboard and screen readers for the board.** Space picks an item up, the arrow keys move it through the grid or between columns, Space drops it, Escape puts it back, and every step is announced, with the name of the column. The texts can be translated.
- **Zoom.** Pinch with two fingers around the point between them, zoom with the wheel or a trackpad pinch around the pointer, double tap to zoom in and out, drag to pan. Panning glides with friction and rubber-bands at the edges, zooming past the limits stretches and springs back, and a content smaller than the view stays centred. `+`, `-`, `0` and the arrow keys work when the viewport has focus.
- **React hooks:** `useBoard` (with `list(key)` for several columns) and `useZoom`, tested with Strict Mode.

## A small example

```ts
import { board, zoom } from "@weber-development/lagrangian-pro";

board([todo, doing, done], {
  canDrop: (item, list) => list !== done || isReady(item),
  onMove: ({ item, from, to }) => api.move(item.dataset.id, to.container.id, to.index),
});

zoom(viewport, { max: 6 });
```

## Prices and installation

Prices are unchanged: 12 CHF per month or 120 CHF per year for one person, 39 CHF per month or 390 CHF per year for up to ten, or 1'290 CHF once as a lifetime licence. After cancelling, every version you already received keeps working; only updates and repository access end.

The new parts are documented in the [Pro documentation](https://packages.sweber.dev/lagrangian/docs/pro/board). See [the Lagrangian page](https://packages.sweber.dev/lagrangian) for everything included.
