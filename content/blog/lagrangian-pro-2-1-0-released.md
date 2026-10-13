---
title: "Lagrangian Pro 2.1: ready-made recipes and a spring editor"
excerpt: "Lagrangian Pro 2.1 adds three finished patterns, a form in a bottom sheet that guards unsaved changes, a photo gallery that opens from its thumbnail and swipeable list rows, plus a spring editor in beta."
date: 2026-10-13
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Pro, UI, release, "2.1"]
---

Lagrangian Pro 2.1.0 is out for subscribers: `@weber-development/lagrangian-pro` and the React, Vue and Svelte packages are on GitHub Packages at 2.1.0. It is a minor release without breaking changes, prices and licences are unchanged, and every subscription and lifetime licence includes it. The free packages stay at 2.0.

## Three recipes as one function each

The Pro docs already showed how to put sheet, carousel and dialog together. 2.1 ships those patterns finished, with the details that take the time: focus, keyboard, gestures that do not fight and the cases where something goes wrong.

**A form in a bottom sheet.** `formSheet` wraps a sheet around a `<form>`. Focus moves to the first field and Tab stays inside the sheet. If someone swipes it down with unsaved changes, it asks first, and if the answer is no, the sheet springs back to where it was. While your `onSubmit` runs the sheet shows `data-state="submitting"`, a rejected promise keeps it open with `data-state="error"`, and the CSS variable `--keyboard-inset` carries the height of the on-screen keyboard.

```ts
const add = formSheet(panel, {
  detents: [0.6, 1],
  onSubmit: async (data) => save(data),
  confirmDiscard: () => confirm("Discard your changes?"),
});
add.open();
```

**A photo gallery.** `lightbox` turns a grid of thumbnails into a viewer. The large picture grows out of the thumbnail and shrinks back into it, slides swipe like a carousel, a drag up or down closes it, and arrow keys, Escape and focus return work as in a dialog. Sideways and vertical swipes are decided by the gesture referee from 2.0.

**Swipeable list rows.** `swipeRows` slides a row to the left to show its actions. A flick opens or closes it, the content rubber-bands at the ends, a vertical drag still scrolls the page, one row is open at a time, and the keyboard opens a row with Alt+ArrowLeft.

React and Vue get `useFormSheet`, `useLightbox` and `useSwipeRows`, Svelte gets the actions `formSheetAction`, `gallery` and `swipeRows`.

## A spring editor (beta)

`springEditor` fills an element with sliders for duration and bounce, or for stiffness, damping and mass, the curve the spring draws, a ball that plays it and the line of code to paste. The curve comes from the same closed-form spring the library animates with, so it is exact. Switching between the two descriptions keeps the motion the same. `springCurve` gives you the samples, the settle time and the overshoot if you want to draw your own preview.

```ts
const editor = springEditor(document.getElementById("lab"));
editor.code(); // "{ duration: 0.45, bounce: 0.12 }"
```

It is marked beta: the functions are stable, but the markup it builds and its class names (`spring-editor-*`) may still change in a minor release.

## What is tested

All of it runs in jsdom, and `lightbox`, `swipeRows`, `formSheet` and the editor also in real Chromium on every change. I have not tested it on Safari or Firefox, and not with a real phone keyboard, so `--keyboard-inset` is based on the visual viewport API and not yet verified on devices.

Learn more: [ready-made recipes](https://packages.sweber.dev/lagrangian/docs/pro/ready-made) and the [spring editor](https://packages.sweber.dev/lagrangian/docs/pro/spring-editor).
