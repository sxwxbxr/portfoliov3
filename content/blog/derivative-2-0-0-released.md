---
title: "Derivative 2.0.0: from changelog to release communication"
excerpt: "Derivative 2.0 turns the changelog into release communication: images and links, highlights as toast, banner or modal, audiences, translations inside the feed and trackers as sources. Derivative Pro 2.0 adds drafts with approval and AI-written first drafts."
date: 2026-10-12
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Release communication, release]
---

Derivative 2.0.0 is on npm, together with Derivative Pro 2.0.0. The idea of 2.0: a changelog is not only a list, it is how you tell people what changed. So the feed and the widget now carry what a release announcement needs.

## What is new in the free packages

- **Feed format 2.** Releases can have images or video (`media`), call-to-action `links`, an `importance` and an `audience`, and translations of their texts. Format 2 is a superset: 1.x feeds are still read, and `derivative build --feed-format 1` writes the old format for readers that have not been updated yet.
- **Highlights.** The `announce` attribute is now `highlight` and has three forms: a toast, a banner and a modal. The modal traps focus, closes with Escape and returns focus to where it came from. Major releases are shown first, and each reader sees a highlight once.
- **Audiences.** Mark entries or whole releases for an audience (`audience:pro` as a tracker label, `audience` in the feed) and set `audience` on the widget to show only what matches.
- **Hints.** The widget can mark elements of your own UI that belong to a new feature with a "new" hint, as long as the release is unread.
- **Translations in the feed.** A release carries its titles and texts in more languages, and the widget picks the reader's language.
- **Trackers as sources (beta).** Linear cycles, Jira versions and Notion pages can be turned into releases. These readers are tested against the documented API shapes only, not against live accounts, so they are marked beta.

## Breaking changes

- The `announce` attribute, the React and Vue prop `announce` and the `derivative-announce` event are replaced by `highlight` and `derivative-highlight`.
- `Release.image` is replaced by `media`; the parser converts old feeds, but code that reads `image` has to change.
- `Feed.version` is `2` for everything the CLI writes unless you pass `--feed-format 1`.
- Node.js 22 or newer is required.

## Upgrading

The [migration guide](https://packages.sweber.dev/derivative/docs/guides/migrating-to-2) has a checklist and a table of every renamed name. The short version: update the packages, rename `announce` to `highlight`, and roll out in this order, so nobody sees a feed they cannot read: first the widget, then the feed. Version 1.x gets security and bug fixes for 12 months from today.

## Derivative Pro 2.0

Prices and licences do not change. What is new:

- **Drafts with approval.** Release notes live as JSON files in your repository with a status (`draft`, `review`, `approved`) and an optional publish date. `drafts check` belongs in CI, `drafts publish` adds approved drafts that are due to the feed. The pull request is the approval.
- **AI-written first drafts.** `draft` writes a draft from your commits or a list of changes, with your own provider key. The result is always a draft, never published by itself, and a generated draft needs a person's name before it is approved. Commit messages go to the provider you choose, so check that this is allowed for your project. It is a language model: read every line.
- **Translations inside the feed** with `translate --embed`, and audiences from the feed itself.
- **E-mail digests** show a release's image and links and use the reader's language.

All of it is tested, with the exception of what needs your accounts: the AI providers and the tracker sources are tested against fixtures of their documented responses.

## Try it

The [documentation](https://packages.sweber.dev/derivative/docs) has the guides, and the [live demo](https://packages.sweber.dev/derivative/demo) runs the 2.0.0 widget.
