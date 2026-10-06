---
title: "Derivative 0.4.0: a search field and real subscriber e-mails"
excerpt: "The widget gets an optional search field. Derivative Pro now keeps a subscriber list with double opt-in and sends release digests through Resend or Postmark."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Newsletter, release]
---

Derivative 0.4.0 is on npm. The free widget becomes easier to use for long changelogs, and Derivative Pro can now do what most "what's new" tools charge a monthly fee for: send your release notes by e-mail to people who asked for them.

## Search in the panel

Add the `search` attribute and a field appears above the list:

```html
<derivative-widget src="/changelog.json" search></derivative-widget>
```

It filters as the reader types, across version, title, summary, entries, details and scope. While a query is active the `limit` is ignored, so older releases are found too. The placeholder and the empty state exist in English, German, French and Italian. In React it is `<WhatsNew search />`. The widget is still about 6 kB gzipped.

## Derivative Pro: subscribers and sending

`derivative-announce` could already render an e-mail digest. Now it also runs the list and does the sending:

- **Double opt-in:** the sign-up handler (`createSubscribeHandler`) sends a confirmation mail with a signed link. Nothing is sent to an address until its owner has confirmed. The confirmation page uses a button, so mail scanners that open links cannot confirm or unsubscribe anyone by accident.
- **No address leaks:** the handler answers the same for known and unknown addresses, never mails a confirmed address again and does not re-send a pending confirmation within ten minutes.
- **Unsubscribe done right:** every mail carries a personal link plus the `List-Unsubscribe` and one-click headers (RFC 8058), which Gmail and Apple Mail show as a button.
- **Your provider, your keys:** sending goes through Resend or Postmark with your own API key. Header injection is refused, and errors from the provider are passed on readably.
- **Storage:** a JSON file for small sites or SQL (Postgres, SQLite, D1) for serverless hosts.
- **CLI:** `derivative-announce send` mails the new releases to all confirmed subscribers (with `--dry-run` to check first), and `subscribers list|export|remove` manages the list. The CSV export includes the consent timestamps, and `remove` deletes an entry completely.

The docs add a short section on the legal side (consent evidence without storing IP addresses, what the unsubscribe has to do), written for GDPR and the Swiss and German rules on advertising by e-mail. It is guidance for developers, not legal advice.

Existing licences get the update automatically. Pro starts at 12 CHF per month.

## Try it

The [docs](https://packages.sweber.dev/derivative/docs) cover the search field and the subscriber list. The [live demo](https://packages.sweber.dev/derivative/demo) has a switch for the search field, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
