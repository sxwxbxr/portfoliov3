---
title: "Lagrangian 0.1.0 released"
excerpt: "Animation with real physics: springs that keep their momentum when you interrupt them, throws that land on snap points, and a small 2D world with gravity, collisions and rolling. About 7 kB."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Spring, Gestures, React, release]
---

Lagrangian 0.1.0 is out. It animates interfaces with real physics instead of fixed durations. `@sweberdev/lagrangian` and `@sweberdev/lagrangian-react` are on npm under the MIT licence.

## Why physics

Most web animation is a curve over a fixed duration. That works until the user interrupts: click twice and the element stops dead and starts again, throw something and it ignores how fast you threw it. Real objects have mass and velocity, and whatever happens next starts from where they are and how fast they move. Lagrangian works the same way.

## What is in 0.1.0

- **Exact springs.** Each spring is the closed-form solution of the damped oscillator, so it knows its position and velocity at every moment and gives the same result at 30 and 144 Hz. Configure it by feel (`duration`, `bounce`) or by physics (`stiffness`, `damping`, `mass`).
- **Interrupt anything.** Every animated property keeps its velocity. A new target, a drag or a throw continues the motion instead of restarting it.
- **Throws that land where they should.** `draggable()` measures the release velocity with a least-squares fit over the last 100 ms, glides with friction like iOS scrolling, rubber-bands past the bounds and adjusts the glide so it ends exactly on the nearest snap point.
- **A small 2D world.** Round bodies with gravity, air drag, restitution and Coulomb friction, so they bounce, slide and roll. Springs between bodies, a pointer joint for grabbing and throwing, a fixed 240 Hz step, and no CPU use once everything rests.
- **Your own equations of motion.** `rk4()` and `system()` step any system you write down, like the double pendulum in the demo.
- **Reduced motion respected.** Automatic motion jumps to where it would come to rest; dragging still follows the pointer.
- **React hooks:** `useSpringProps`, `useSpring`, `useDraggable`, `useWorld` and `useBody`.
- About 7 kB min+gzip for everything, checked in CI.

## Install

```bash
pnpm add @sweberdev/lagrangian
```

```ts
import { animate, draggable, World } from "@sweberdev/lagrangian"

// Click again mid-flight: the card turns around with its current momentum.
animate(".card", { x: 240, rotate: 4 }, { duration: 0.6, bounce: 0.3 })

// Throw a sheet onto snap points.
draggable(sheet, { axis: "y", snap: { y: [0, 240, 480] } })

// Drop things that bounce and roll.
const world = new World({ bounds: box }).start()
world.add({ x: 120, y: 0, radius: 24, restitution: 0.8, element: ball })
world.bindPointer()
```

For React add `@sweberdev/lagrangian-react`.

## Try it

The [live demo](https://packages.sweber.dev/lagrangian/demo) puts a CSS transition and a Lagrangian spring side by side (click fast), lets you throw cards and balls, and runs two double pendulums that start a thousandth of a radian apart. The docs are at [packages.sweber.dev/lagrangian/docs](https://packages.sweber.dev/lagrangian/docs).

Lagrangian is the real-time counterpart to [Sigmoid](https://packages.sweber.dev/sigmoid), which ties motion to the scroll position with native CSS.
