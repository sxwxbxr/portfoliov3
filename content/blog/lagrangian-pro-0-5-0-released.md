---
title: "Lagrangian Pro 0.5.0: popovers and scrolling while you drag"
excerpt: "A popover that grows out of its trigger with a spring and flips when there is no room, and sortable lists that scroll by themselves when you hold an item near the edge."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Popover, Drag, React, release]
---

Lagrangian Pro 0.5.0 is out. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence.

## What is new

- **Popover.** `popover(trigger, panel)` anchors a panel to its trigger. It grows out of the side that faces the trigger with a spring, moves to the other side when there is no room, stays inside the window, follows the trigger while the page scrolls and closes with Escape or a click outside. The focus moves in, goes back to the trigger when it closes, and `aria-expanded` is kept up to date. Side, alignment, offset and margin are options.
- **Scrolling while you drag.** Hold an item in a `sortable` list near the edge of the window, or of a scrollable parent, and the list scrolls on its own, faster the closer you get to the edge. The dragged item stays under the pointer and the slot is recomputed while the page moves. It is on by default and can be tuned with `autoScroll: { edge, speed }` or turned off with `false`.
- **React:** `usePopover`, with `trigger` and `ref` for the button and the panel.

## A small example

```ts
import { popover, sortable } from "@weber-development/lagrangian-pro";

const menu = popover(button, panel, { side: "bottom", align: "start" });
button.onclick = () => menu.toggle();

sortable(list, { autoScroll: { edge: 56, speed: 900 } });
```

## Try it

The [docs](https://packages.sweber.dev/lagrangian/docs) describe every option. Existing code keeps working; the only change in behaviour is that long sortable lists in scrolling pages now scroll while you drag.
