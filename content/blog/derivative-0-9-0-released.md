---
title: "Derivative 0.9.0: the release candidate for 1.0"
excerpt: "The public API is frozen, the reference is complete, and a written stability promise says what you can rely on. A new release-candidate test installs the packed packages into clean projects and builds the examples from them."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Stability, release]
---

Derivative 0.9.0 is on npm, and it is the release candidate for 1.0. There are no new features in it on purpose: this is the version in which the API stops moving, so that 1.0 can be a promise and not just a number.

## The API is frozen

Every export of the core package, the Node entry point, the widget and the React and Vue bindings is now listed in the [API reference](https://packages.sweber.dev/derivative/docs), including helpers that were missing there, such as the GitLab ones. A test reads the entry points with the TypeScript compiler and fails when an export is added, removed or renamed without a deliberate update, so an accidental change cannot slip into a release. The three Pro packages have the same test.

The few gaps we found while listing everything are closed. React and Vue get the `headingLevel` prop that the widget has had since 0.6, the React package re-exports the `Feed`, `Release`, `EntryType` and `Messages` types like Vue does, and Node 20 is declared in `engines`.

## What you can rely on

A new [Stability](https://packages.sweber.dev/derivative/docs) page says in plain words what is covered from 1.0: exports, the CLI and its exit codes, the config keys, the feed format, the widget's attributes, events, custom properties and parts, and for Pro the documented exports, options and the stored event format. It also says what is not covered, such as the inner structure of the shadow DOM and the exact wording of default labels, and how deprecations work: announced in a minor release, kept for at least one more, removed no earlier than the next major.

An [Upgrading](https://packages.sweber.dev/derivative/docs) guide lists every change since 0.x that could be visible in an existing installation, with what to check. It is short, because nearly everything was added without changing existing behaviour.

## Tested as it will be shipped

The examples were already built in CI against the published packages. The new `pnpm rc` goes one step earlier: it packs the three packages exactly as a release does, installs the tarballs into clean projects, imports every documented export from both ESM and CommonJS, runs the CLI on a sample changelog and builds the Vite, Next.js, SvelteKit and Astro examples from them. If the package has a mistake that only shows up after packing, this is where it appears.

## What comes next

1.0 is next, and it will contain no new features: the stability promise, the documentation and a post. Derivative Pro keeps its price, and existing licences carry over.

The [documentation](https://packages.sweber.dev/derivative/docs) has the new pages, the [live demo](https://packages.sweber.dev/derivative/demo) runs the 0.9.0 widget, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
