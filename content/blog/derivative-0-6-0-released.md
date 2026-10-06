---
title: "Derivative 0.6.0: GitLab, monorepo filters and e-mail through SES or SMTP"
excerpt: "GitLab Releases become a source, monorepo feeds can be filtered per package, and axe now guards the widget's accessibility. Derivative Pro sends subscriber mail through Amazon SES or any SMTP server."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, GitLab, Accessibility, release]
---

Derivative 0.6.0 is on npm. It reaches teams on GitLab, gives monorepos a clean way to show one package at a time, and makes accessibility something the test suite checks instead of something we promise.

## GitLab Releases

```sh
npx derivative build --source gitlab --project acme/team/app
```

Release notes are read like GitHub's: the tag gives the version, the release name becomes the title when it says more than the tag, and `### Features` or `### Fixed` sections and conventional prefixes set the entry types. Self-managed instances work with `--gitlab-url`, and private projects with a `GITLAB_TOKEN`. Upcoming releases are skipped unless you ask for them.

## Monorepos: one feed, the right package

When one feed covers several packages, limit it at build time with `--package "@acme/web"` and `--exclude-package "@acme/internal-*"`, or let each widget choose from the shared feed:

```html
<derivative-widget src="/changelog.json" package="@acme/web"></derivative-widget>
```

The widget then shows, counts and marks as read only that package, so the badge in the web app's header does not light up for an API release. A name matches exactly, or as a prefix when it ends in `*`.

## Accessibility under test

We added axe to the test suite and run it over the closed button, the open panel with search, the inline list and the announcement toast. It found a real problem on its first run: inline lists jumped from the page's `h1` to `h3` headings. Inline lists now start at `h2`, and a new `heading-level` attribute lets you fit them into any page outline. The checks that need a real browser, such as colour contrast, come next.

## Derivative Pro: SES and SMTP

The subscriber digest from 0.4.0 could be sent through Resend or Postmark. It can now also go through Amazon SES and through any SMTP server (your own, Microsoft 365, Gmail with an app password, a hosting provider):

```sh
DERIVATIVE_SMTP_URL="smtps://news%40acme.ch:secret@smtp.acme.ch:465" npx derivative-announce send --provider smtp ...
```

SES requests are signed inside the package, so there is no AWS SDK to install, and the AWS user needs only `ses:SendEmail`. The SMTP client requires TLS (from the start or via STARTTLS) and never sends the password in the clear. Messages carry the same personal unsubscribe link and one-click headers as before.

Existing licences get the update automatically. Pro starts at 12 CHF per month.

## Try it

The [docs](https://packages.sweber.dev/derivative/docs) cover GitLab, the package filter and the new providers. The [live demo](https://packages.sweber.dev/derivative/demo) runs the 0.6.0 widget, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
