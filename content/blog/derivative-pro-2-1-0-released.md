---
title: "Derivative Pro 2.1.0: tracker import and comments on releases"
excerpt: "Derivative Pro 2.1 reads releases from Linear, Jira and Notion as drafts, and lets readers react with an emoji and comment on a release, stored in your own database. The tracker import is a beta."
date: 2026-10-13
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Linear, Jira, Notion, release]
---

Derivative Pro 2.1.0 is available to Pro customers. Prices and the licence do not change, and there are no breaking changes since 2.0.

## Import from Linear, Jira and Notion (beta)

`derivative-segments import` reads released work from your tracker and writes it as drafts in the approval workflow that came with 2.0, so a person still reads and approves every line before it reaches the feed.

- **Linear:** completed cycles of a team, one release per cycle.
- **Jira:** released versions of a project, with the issues that have the version as fix version.
- **Notion:** the pages of a database, grouped into releases by a `Version` property.

Compared with the readers in the free package, the import reads every page (the free ones stop at 100 issues per cycle, 20 Jira versions and 300 Notion pages), repeats requests on rate limits, server errors and network failures, and gives up on a hanging request after 20 seconds. Labels or issue types decide the entry type, `--map` takes your own names, an `audience:pro` label sets an audience, and `internal` hides an issue. Running it again refreshes drafts that are still drafts and never touches one that is in review or approved.

It stays a beta, and I want to be plain about why: it is tested against mock servers that return the documented API responses, including pagination, rate limits and error cases, but not against real Linear, Jira or Notion accounts. Use a read-only token and look at the drafts before you approve them.

## Reactions and comments on releases

`derivative-insights` can now put emoji reactions and comments under every release in the widget. They sit in a disclosure that loads only when a reader opens it.

- Comments are plain text, stored in your own database (memory and SQL stores are included), and held back until you approve them. You can switch to publishing at once and reject afterwards.
- A moderation handler lists, approves, rejects and deletes comments; you put it behind your own login or a token.
- A hidden field catches simple bots, and hooks let you add your own rate limit and spam filter. The library stores no IP address, so it cannot limit requests by itself.
- Reactions carry no identifier. A browser remembers its own choice, so a changed mind moves the count instead of adding one.

Comments are personal data that readers type in, so you are the controller: mention them in your privacy notice and delete a comment when its author asks. The form tells readers not to enter data they do not want published. I checked the whole flow in a real browser against the 2.0 widget, from opening the disclosure to a moderated comment.

## Upgrading

Update the three Pro packages to 2.1.0. Nothing changes until you use the new functions; the [Pro documentation](https://packages.sweber.dev/derivative/docs/pro/overview) describes both.
