---
title: "Derivative 0.1.0 released"
excerpt: "A self-hosted changelog and \"What's new\" widget, built from the Changesets, CHANGELOG.md or commits you already have. No SaaS, no tracking, about 6 kB."
date: 2026-10-05
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Changesets, Web Components, React, release]
---

Derivative 0.1.0 is out. It turns the changelog you already keep into a "What's new" button for your app. `@sweberdev/derivative` and `@sweberdev/derivative-react` are on npm under the MIT licence.

## Why

Hosted tools such as Beamer or Headway want a second place to write release notes, a script from their domain and a line in your privacy policy. Most teams already have the notes: Changesets output, a CHANGELOG.md or conventional commits. Derivative reads them at build time and writes a static `changelog.json` that ships with your app. The widget reads that file, keeps the reader's last seen release in local storage and sends nothing anywhere.

## What is in 0.1.0

- Parsers for Changesets (default and GitHub formats), Keep a Changelog, conventional-changelog and conventional commits with version tags.
- `derivative build`, which writes `changelog.json`, an Atom feed and a standalone changelog page.
- `<derivative-widget>`, a web component of about 6 kB gzip with no dependencies: popover or inline, an unread badge, dark mode and CSS custom properties.
- Accessibility built in: a labelled dialog, focus handling, Escape to close, and reduced motion respected.
- Labels and dates in English, German, French and Italian.
- Highlights that add a title, a summary and an image to the releases that matter, while the generated entries stay as they are.
- React bindings: `<WhatsNew>`, `useChangelog` and an unstyled `<ChangelogList>`.

## Install

```bash
pnpm add @sweberdev/derivative
```

Build the feed before your app and put the widget in your header:

```html
<!-- package.json: "build": "derivative build && vite build" -->
<header>
  <a href="/">Acme</a>
  <derivative-widget src="/changelog.json" lang="de"></derivative-widget>
</header>
<script type="module">
  import "@sweberdev/derivative/widget"
</script>
```

Try it in the [live demo](https://packages.sweber.dev/derivative/demo). The full reference is at [packages.sweber.dev/derivative/docs](https://packages.sweber.dev/derivative/docs).

## Derivative Pro

Derivative Pro is available from today. It adds three packages: read statistics without cookies or visitor IDs, audience segments that show entries only to certain plans or roles with scheduled releases, and announcements by e-mail digest and to Slack, Teams, Discord, Mattermost and Google Chat. Licences start at 9 CHF a month for one person; see the [package page](https://packages.sweber.dev/derivative) for all plans.
