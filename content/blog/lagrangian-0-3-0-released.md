---
title: "Lagrangian 0.3.0: a scroll area with physics, joints and sensors"
excerpt: "scroller() brings inertia, rubber-banding and snap points to any scroll area. The world gets hinges, rods and motors for pendulums and chains, and sensors that report what enters a zone."
date: 2026-10-06
author: Seya Weber
type: release
packages: [lagrangian]
tags: [Lagrangian, Animation, Physics, Scrolling, Joints, React, release]
---

Lagrangian 0.3.0 is out. `@sweberdev/lagrangian` and `@sweberdev/lagrangian-react` are on npm under the MIT licence.

## What is new

- **scroller().** Make any viewport scroll with inertia: drag and let go and the content glides with friction like iOS, rubber-bands at the ends and, with `snap`, lands exactly on a snap point. The mouse wheel, the keyboard (arrows, Page Up/Down, Space, Home, End) and `scrollTo` move the same physical values, so a throw, a wheel tick and a key press hand over to each other without a jump. At an end the page keeps scrolling. `onScroll` and the exposed values drive other animations.
- **Joints.** `world.pin(body, at)` fixes a point of a body to a point of the page, `world.hinge(a, b, at)` joins two bodies and `world.rod(a, b)` keeps a fixed distance. Pendulums keep the period physics gives them (`2π√(L/g)`), chains of hinged boxes swing and settle, and a motor turns wheels and windmills with a torque limit.
- **Sensors.** A body with `sensor: true` overlaps instead of colliding and calls `onEnter` and `onLeave`. `world.touching(sensor)` lists what is inside. Good for drop zones, goals and triggers.
- **React:** `useScroller`.
- The package is now about 10 kB min+gzip for everything (it was 8.2 kB); each part is still tree-shakeable, and `spring` plus `value` alone stay at 2.1 kB.

## A small example

```ts
import { scroller, World } from "@sweberdev/lagrangian";

const list = scroller(viewport, { snap: { y: [0, 320, 640] } });
list.scrollTo({ y: 320 });

const world = new World({ bounds: box }).start();
const bob = world.add({ x: 400, y: 100, radius: 18, element: ball });
world.rod(bob, { x: 300, y: 10 }); // a pendulum on a nail

const goal = world.add({
  x: 300, y: 440, width: 200, height: 60, fixed: true, sensor: true,
  onEnter: (body) => score(body),
});
```

## Try it

The [docs](https://packages.sweber.dev/lagrangian/docs/guides/scroller) describe every option, and the [world guide](https://packages.sweber.dev/lagrangian/docs/guides/world) now covers joints and sensors. [Lagrangian Pro](https://packages.sweber.dev/lagrangian) builds on the same physics and works with this release.
