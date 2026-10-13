---
title: "Witness 1.0.0 released: stable AI disclosure for the EU AI Act"
excerpt: "Witness and Witness Pro reach 1.0.0. The API of the 0.9 release candidate is unchanged and now covered by semantic versioning, from the web components to C2PA signing."
date: 2026-10-13
author: Seya Weber
type: release
packages: [witness]
tags: ["Witness", "EU AI Act", "Article 50", "1.0", "stable", "release"]
---

Witness 1.0.0 is out. The free packages `@sweberdev/witness` and `@sweberdev/witness-react` and the four Pro packages (`witness-locales`, `witness-scan`, `witness-report`, `witness-sign`) are all at 1.0.0.

## What 1.0.0 means

There are no API changes since the 0.9.0 release candidate. What changes is the promise: from now on a minor or patch release does not break code that uses the documented parts. That covers every export, the `<witness-notice>`, `<witness-label>` and `<witness-player>` elements with their attributes, events and CSS parts, the markup of `labelHtml`, the data written into files (XMP, IPTC source types, text watermark), the command line options of `witness`, `witness-scan`, `witness-report` and `witness-sign`, and the shape of the config, report and register files. The [stability page](/witness/docs/reference/stability) spells out what is covered, what is not (wording, scanner findings, legal status, visual design) and how deprecation works.

## What is in the box

- **Free:** the chatbot notice (Article 50(1)), visible labels for text, images, audio and video, machine-readable marking in images, audio and video, a text watermark, reading C2PA Content Credentials, and React components.
- **Pro:** 20 more EU languages, a CI scanner that finds undisclosed AI use, an AI register with a client report and change log, a legal status changelog, and C2PA signing with your own certificate.

## Install

```sh
npm install @sweberdev/witness@1.0.0 @sweberdev/witness-react@1.0.0
```

Pro customers update the four `@weber-development/witness-*` packages to 1.0.0. Nothing in your code has to change when you come from 0.9. Pro now accepts Witness 0.9 up to 2.x as its free dependency.

## What Witness is not

Witness is a tool that makes disclosure easy to build and to evidence. It is not legal advice and does not decide whether your use of AI falls under Article 50. See the [docs](/witness/docs), the [live demo](/witness/demo) and the [Witness page](/witness) for the Pro edition.
