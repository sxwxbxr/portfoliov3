---
title: "Lagrangian 0.2.0: rotating boxes, bodies that sleep one by one, and a tree-shakeable build"
excerpt: "Cards and buttons can now fall, tip over and stack in the Lagrangian world. Resting bodies fall asleep individually, and every part of the library can be shaken out of your bundle: springs alone are 2 kB."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Collisions, React, release]
---

Lagrangian 0.2.0 is out. `@sweberdev/lagrangian` and `@sweberdev/lagrangian-react` are on npm under the MIT licence, and nothing you wrote for 0.1 needs to change.

## What is new

- **Rotating boxes.** Give a body a `width` and a `height` instead of a `radius` and it behaves like a card or a button: it falls, tips over an edge, lands flat, stacks and spins when you hit it off centre. Collisions between boxes use the separating axis test with up to two contact points, boxes and circles collide with each other, and each corner of a box is checked against the walls. Inertia is that of a solid plate, so the spin you see is the spin a real card would have.
- **Resting stays resting.** Slow contacts stick instead of creeping, so a stack of boxes settles instead of slowly sliding apart.
- **Sleeping per body.** Before, the whole world slept or none of it. Now each body falls asleep when it has moved only a few pixels for a second (`body.sleeping`), so a big pile stays calm while one ball keeps rolling. A sleeping body wakes when something hits it, when you grab, push or link it, or when the body below it is removed. `world.wake(body)` wakes one body by hand. When every body sleeps the frame loop stops and uses no CPU.
- **Tree-shakeable build.** The package is now built for ES2022, so bundlers can drop what you do not import. `spring` and `value` alone are about 2.1 kB (before: 3.5 kB), animate and draggable about 3.8 kB, the world about 4.5 kB and everything about 8 kB. The size budgets are checked in CI.

## A small example

```ts
import { World } from "@sweberdev/lagrangian"

const world = new World({ bounds: container }).start()

// A card that falls, tips and lands flat
world.add({ x: 220, y: 40, width: 120, height: 72, angle: 0.3, element: card })

// A ball that rolls off it
world.add({ x: 160, y: 0, radius: 24, element: ball })
world.bindPointer()
```

## Prices and Pro

Lagrangian stays free. [Lagrangian Pro](https://packages.sweber.dev/blog/lagrangian-pro-0-2-0-released) works with 0.2 as well (its peer range now accepts any 0.x from 0.1 up).

## Try it

The [live demo](https://packages.sweber.dev/lagrangian/demo) lets you throw cards and balls, and the [world guide](https://packages.sweber.dev/lagrangian/docs/guides/world) explains boxes and sleeping.

## What is next

Version 1.0 is the goal for the free package and Pro together: `scroller()` with inertia, joints and sensors, polygons, and adapters for Vue and Svelte. The roadmap is public in the repository.
