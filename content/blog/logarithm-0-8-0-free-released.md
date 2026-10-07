---
title: "Logarithm 0.8.0 released"
excerpt: "The API is frozen ahead of 1.0. Eight undocumented helpers left the public exports, and the docs now say exactly what the compatibility promise covers."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, TypeScript, release]
---

Logarithm 0.8.0 is out on npm as `@sweberdev/logarithm` and `@sweberdev/logarithm-react`, with provenance. The Pro packages stay at 0.9.1. This is the API freeze before 1.0.

## What changed

The helpers that 0.6.0 marked as deprecated are no longer exported: `DEFAULT_LIMIT`, `MAX_LIMIT`, `encodeCursor`, `decodeCursor`, `toStoreQuery`, `toStoreFilter` and `sortGroups` from the core package, and `relativeTime` from the React package. They were internals that slipped into the exports. Nothing that the documentation describes has changed, so if your code only uses documented functions, you do not need to change anything. If an import breaks, you were using one of the eight; open an issue and tell us what you need it for.

## What the 1.0 promise will cover

The API reference has a new Stability section. From 1.0, Logarithm follows semantic versioning for:

- everything in the API reference, the `AuditStore` interface and the types it uses,
- the parameters and responses of the HTTP endpoint and the props of the React components,
- the table layout, through the schema version introduced in 0.6.0: a change is a new version with a migration, never a silent edit,
- the CSS custom properties (`--lg-*`) and the `data-theme` attribute.

It does not cover the `lg-*` class names inside the viewer, the wording of error messages or of the built-in labels. Deprecations are announced one minor version ahead.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Logarithm is on the [package page](https://packages.sweber.dev/logarithm).
