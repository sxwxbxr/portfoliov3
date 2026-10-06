---
title: "Lagrangian Pro 0.3.0: toasts, tab indicator and a page that falls apart"
excerpt: "A toast stack you can throw away, a sliding tab indicator that keeps its momentum, and a page effect that lets a section fall, pile up, explode and spring back into place."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Physics, Gestures, React, release]
---

Lagrangian Pro 0.3.0 is out with three new parts: a toast stack, a sliding indicator for tabs and a page effect that uses the rotating boxes of Lagrangian 0.2. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence.

## What is new

- **Toasts.** `toasts(host)` keeps a stack at one edge. A new toast springs in while the others move to make room, and when one leaves the rest spring into the gap. A swipe sideways throws a toast away at the speed of the throw; a slow swipe brings it back. Timers stop while the pointer or the keyboard focus is on the stack and continue with the time that was left, older toasts are dismissed above `max`, and toasts are announced as `status` or `alert`.
- **Indicator.** `indicator(track, bar)` slides a bar under the selected tab and stretches it to the width of the item. Choose another tab while it is moving and it keeps its velocity instead of restarting. Items get `aria-selected`.
- **Fall.** `fall(section)` lets the children of a section come loose, lowest first. They fall under gravity, tip over, pile up on the floor of the viewport and can be blown away with `explode(origin)`. `restore()` springs every piece, including its rotation, back to its place. Invisible placeholders keep the layout from jumping.
- **React hooks:** `useToasts`, `useIndicator` and `useFall`, tested with React 18 and 19 and Strict Mode.

`fall` needs `@sweberdev/lagrangian` 0.2 or later; the other parts work with 0.1.

## A small example

```ts
import { fall, indicator, toasts } from "@weber-development/lagrangian-pro";

const stack = toasts(corner, { edge: "bottom", max: 4 });
saveButton.onclick = () => stack.show("Saved");

indicator(tabs, bar, { itemSelector: "button", onSelect: (i) => showPanel(i) });

const effect = fall(section);
effect.start();
effect.explode({ x: 400, y: 600 });
await effect.restore();
```

## Prices and installation

Prices are unchanged: 12 CHF per month or 120 CHF per year for one person, 39 CHF per month or 390 CHF per year for up to ten, or 1'290 CHF once as a lifetime licence. After cancelling, every version you already received keeps working; only updates and repository access end.

The new parts are documented in the [Pro documentation](https://packages.sweber.dev/lagrangian/docs/pro/stack). See [the Lagrangian page](https://packages.sweber.dev/lagrangian) for everything included.
