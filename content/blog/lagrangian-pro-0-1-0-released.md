---
title: "Lagrangian Pro 0.1.0: bottom sheet, swipe stack, sortable lists, jelly, ropes and sounds"
excerpt: "Lagrangian Pro turns the physics into finished interface parts: a bottom sheet that lands where the throw would carry it, cards that tilt around your finger, lists that make room as you drag, and objects that squash, swing and clack."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Physics, Gestures, React, release]
---

Lagrangian Pro 0.1.0 is out. It builds on the [free Lagrangian](https://packages.sweber.dev/blog/lagrangian-0-1-0-released) and adds the interface parts you would otherwise write yourself. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence. The free `@sweberdev/lagrangian` is unchanged and stays MIT.

## What is in 0.1.0

- **Bottom sheet.** Detents as fractions or pixels, a throw that lands on the detent it would carry the sheet to (so a short flick moves it as far as a long drag), rubber-banding at the top, and closing with a flick, Escape or a tap on the backdrop. Content inside keeps scrolling; with a handle, only the handle moves the sheet.
- **Swipe stack.** Cards tilt around the point where you grabbed them, fly off at the speed you threw them and the cards behind move up. Undo brings the last card back. `--swipe-progress` and `data-swipe` let CSS draw "like" and "nope" stamps.
- **Sortable lists.** Drag to reorder; neighbours make room with springs and the list settles without a jump, also with items of different heights. The keyboard works too: Space picks an item up, the arrow keys move it, Space drops it, Escape puts it back, and every step is announced to screen readers.
- **Layout transitions.** `flip()` and `measure()` spring elements from their old place to their new one after any DOM change, and a second change in mid-flight continues with the velocity it had.
- **Jelly.** Squash and stretch from the real velocity of a dragged element or a World body. The area stays constant and the shape wobbles back when it stops or hits something.
- **Ropes.** Verlet ropes, chains and garlands you can grab and swing, with elements hanging from them.
- **Impact sounds.** Synthesized with Web Audio, so there are no files: loudness follows the impact speed, pitch follows the size and five materials set the timbre. Plug it into `onCollide` of a World.
- **React hooks** for every piece: `useSheet`, `useSwipeStack`, `useSortable`, `useLayoutTransition`, `useJelly`, `useRope` and `useImpactSound`. `useSortable` leaves the DOM to React, so keys, state and focus stay intact. Tested with React 18 and 19 and Strict Mode.
- **Reduced motion** is respected everywhere.

## A small example

```ts
import { sheet, swipeStack } from "@weber-development/lagrangian-pro";

const filters = sheet(element, { detents: [0.4, 1], backdrop: shade });
openButton.onclick = () => filters.open();

const stack = swipeStack(cards, {
  onSwipe: (card, direction) => save(card.dataset.id, direction),
});
```

In React:

```tsx
const list = useSortable<HTMLUListElement>({
  onReorder: (from, to) => setItems((x) => arrayMove(x, from, to)),
});
```

## Prices and installation

Lagrangian Pro costs 12 CHF per month or 120 CHF per year for one person, 39 CHF per month or 390 CHF per year for up to ten, or 1'290 CHF once as a lifetime licence. After cancelling, every version you already received keeps working; only updates and repository access end. Your own customers never need a licence for websites you build with it.

Installation goes through GitHub Packages and is explained in the [Pro documentation](https://packages.sweber.dev/lagrangian/docs/pro/overview). See [the Lagrangian page](https://packages.sweber.dev/lagrangian) for the full list and the [demo](https://packages.sweber.dev/lagrangian/demo#pro) for the code.
