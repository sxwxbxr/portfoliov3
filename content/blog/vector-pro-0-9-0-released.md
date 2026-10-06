---
title: "Vector Pro 0.9.0: works with Vector 0.7, the release candidate for 1.0.0"
excerpt: "All Vector Pro packages now accept Vector 0.6 and 0.7 as a peer dependency and are tested against 0.7.0, the release candidate for 1.0.0."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Vector Pro, Webhooks, release]
---

Vector Pro 0.9.0 is out. All six Vector Pro packages are at 0.9.0 on GitHub Packages.

The only change is compatibility. The Pro packages used to accept the free `@sweberdev/vector` up to 0.5, so installing them next to 0.6.0 produced a peer dependency warning with some package managers. They now accept 0.6 and 0.7, and the whole suite (portal, catalog, ops, inbound, transform and otel) is tested against 0.7.0.

That version is the [release candidate for 1.0.0](https://packages.sweber.dev/blog/vector-0-7-0-released): its API is frozen and its stability rules are written down. Pro 1.0.0 follows the free 1.0.0, so a Pro 1.0.0 will always work with the free 1.0.0.

Update the Pro packages together; they share one version number. There are no breaking changes.
