---
title: "Derivative 1.0.0: a changelog widget you can build on"
excerpt: "Derivative is at 1.0. From here on the API, the CLI, the feed format and the widget follow semantic versioning, with deprecations announced a release ahead. Nothing changes compared with 0.9."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Stability, release]
---

Derivative 1.0.0 is on npm. It contains no new code compared with 0.9.0, and that is the point: 1.0 is the release in which the promise starts.

## What the promise is

From now on a minor or patch release does not break what the [Stability page](https://packages.sweber.dev/derivative/docs) lists as covered: the exports of the core, React and Vue packages, the CLI and its exit codes, the keys of `derivative.config.json`, the `changelog.json` format, and the widget's attributes, events, custom properties and parts. If something has to go, it is announced as deprecated in one minor release, keeps working for at least one more, and is removed no earlier than 2.0. Node 20 and newer and the current versions of the four big browsers are supported.

A test fails when an export is added, removed or renamed without a deliberate update, a real-Chromium test checks contrast, right-to-left pages, phone widths and theming, and the packed release is installed into clean Vite, Next.js, SvelteKit and Astro projects before it ships. That is the part of the promise that is checked by machines.

## What Derivative is, in one paragraph

You keep a changelog the way you already do: Changesets, a `CHANGELOG.md`, conventional commits, GitHub or GitLab Releases. `derivative build` turns it into a `changelog.json`, an Atom feed, a JSON Feed and a standalone page. The `<derivative-widget>` shows it as a "What's new" button with an unread badge, search, an announcement toast and four languages, in about 6 kB gzipped. No SaaS, no tracking, no account.

## Updating

If you are on 0.9, update the packages and you are done. If you are on an older 0.x version, the [Upgrading guide](https://packages.sweber.dev/derivative/docs) lists the few changes that could be visible, such as heading levels in inline lists and the darker type badges in light mode.

## Derivative Pro

Derivative Pro (read statistics and a dashboard route, audience segments and translations, subscriber lists and announcements) has the same API freeze and test and stays on 0.9 for now. Existing licences carry over and prices do not change. Pro starts at 12 CHF per month.

## Try it

The [documentation](https://packages.sweber.dev/derivative/docs) has a getting-started guide and the four example projects, and the [live demo](https://packages.sweber.dev/derivative/demo) runs the 1.0.0 widget.
