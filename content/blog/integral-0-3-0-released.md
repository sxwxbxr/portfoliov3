---
title: "Integral 0.3.0 released"
excerpt: "Activate licenses on a customer's devices, with a device limit per license and an offline activation file for computers without internet."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Device activation, Offline, release]
---

Integral 0.3.0 is out. `@sweberdev/integral` and `@sweberdev/integral-react` 0.3.0 are on npm. Integral Pro 0.3.0 follows for subscribers.

## Why

0.2.0 could bind a license to a device, but only if you knew the device when you issued the license. Most customers buy first and install later, often on more than one computer, and some of those computers never see the internet. 0.3.0 closes that gap.

## What is new

- **`bindLicense(license, machine, privateKey)`** checks a license and signs a copy bound to one device. The copy keeps the id, plan and dates, so revocation lists and renewals still match. A license that is already bound to another device is refused.
- **Offline activation.** `createActivationRequest()` packs a license and a device id into one string (`intq1.…`) that the customer can save as a file and send to you. You turn it into a bound license and send it back. The CLI does the same with `integral request` and `integral activate`.
- **`publicKeyFromPrivateKey()`** derives the public key on a server that only stores the private key.

```ts
import { bindLicense, createActivationRequest, machineId } from "@sweberdev/integral"

const machine = await machineId(hostId)
const request = createActivationRequest({ license, machine, label: "Workshop PC" }) // on the customer's side
const result = await bindLicense(license, machine, privateKey, { product: "my-app" }) // on yours
```

Existing licenses and apps keep working. Nothing changes unless you call the new functions.

## Integral Pro 0.3.0

The license server counts the devices of every license. `activate()` binds a license, a Polar key or an offline request to a device, within seats times three devices by default. `deactivate()` frees a place and `activations()` lists the devices. Renewals keep the device binding. The routes `/activate` and `/deactivate` are new, and `sqlSchema` adds a table for the activations. In the React portal, `bindToMachine` activates each license for the customer's device and frees its place when the license is removed, with a clear message when the device limit is reached.

## Try it

The [live demo](https://packages.sweber.dev/integral/demo) has a new section where you can activate a license on three laptops with a limit of two, free a place and create an offline request. The new [device activation guide](https://packages.sweber.dev/integral/docs) explains the flow. Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
