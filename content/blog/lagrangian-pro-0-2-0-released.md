---
title: "Lagrangian Pro 0.2.0: pull to refresh, carousel, drawer and dialog"
excerpt: "Four more finished interface parts on the same physics: a pull to refresh that holds while it loads, a carousel that snaps like a real thing, a side drawer and a dialog that handle focus for you."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Lagrangian Pro, Animation, Physics, Gestures, React, release]
---

Lagrangian Pro 0.2.0 is out. It adds four of the parts that take the longest to get right, because the gesture is the easy half and the focus, keyboard and screen reader behaviour is the other half. `@weber-development/lagrangian-pro` and `@weber-development/lagrangian-pro-react` are on GitHub Packages for every Lagrangian Pro licence. The free `@sweberdev/lagrangian` is unchanged.

## What is new

- **Pull to refresh.** The content follows the finger with growing resistance. A release past the threshold holds the content there while your `onRefresh` promise runs, then it springs back with the momentum it has. It only starts when the container is scrolled to the top, sets `data-state` and `aria-busy` for your spinner, and has a `refresh()` method for a keyboard button.
- **Carousel.** A throw carries as far as its speed says, a clear flick always moves at least one slide, and the ends rubber-band. Arrow keys, Home and End work, slides get `aria-current`, and the viewport is announced as a carousel.
- **Drawer.** The side counterpart of the bottom sheet, from the left or the right. You can drag it, the throw decides whether it lands open or closed, a tap on the backdrop or Escape closes it, a closed drawer is `inert`, opening moves the focus in and closing gives it back.
- **Dialog.** Scales and fades in with a spring, traps Tab inside, locks the page scroll, closes with Escape or a click on the backdrop and returns the focus to the button that opened it.
- **React hooks** for all four: `usePullToRefresh`, `useCarousel`, `useDrawer` and `useDialog`, tested with React 18 and 19 and Strict Mode.

## A small example

```ts
import { carousel, dialog, drawer, pullToRefresh } from "@weber-development/lagrangian-pro";

pullToRefresh(scroller, { onRefresh: () => reload() });
carousel(viewport, { align: "center", label: "Photos" });

const menu = drawer(nav, { side: "left", backdrop: shade });
menuButton.onclick = () => menu.toggle();

const confirm = dialog(box, { backdrop: shade });
deleteButton.onclick = () => confirm.show();
```

In React:

```tsx
const menu = useDrawer({ side: "right" });
return <nav ref={menu.ref}>…</nav>;
```

## Prices and installation

Prices are unchanged: 12 CHF per month or 120 CHF per year for one person, 39 CHF per month or 390 CHF per year for up to ten, or 1'290 CHF once as a lifetime licence. After cancelling, every version you already received keeps working; only updates and repository access end.

The new blocks are documented in the [Pro documentation](https://packages.sweber.dev/lagrangian/docs/pro/blocks). See [the Lagrangian page](https://packages.sweber.dev/lagrangian) for everything included.
