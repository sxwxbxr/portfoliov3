---
title: "Witness 2.0 released: marking layers and Content Credentials for the final Code of Practice"
excerpt: "Witness and Witness Pro 2.0 follow the final Code of Practice on marking and labelling. Record and check the machine-readable layers of your AI content, show C2PA Content Credentials in the browser, and add a review workflow to the AI register."
date: 2026-10-13
author: Seya Weber
type: release
packages: [witness]
tags: ["Witness", "EU AI Act", "Article 50", "2.0", "Code of Practice", "release"]
---

Witness 2.0 is out. `@sweberdev/witness` and `@sweberdev/witness-react` are at 2.0.0, and so are the four Pro packages (`witness-locales`, `witness-scan`, `witness-report`, `witness-sign`).

The final Code of Practice on marking and labelling asks for two machine-readable layers on images, audio and video, and one on text (short text of about 150 words or less is exempt). Witness 2.0 makes those layers something you can record, check and show.

## What is in 2.0

- **Marking layers (free).** `createMarking({ layers })` records which techniques mark a piece of content: `visible`, `metadata`, `watermark` or `credentials`. `assessLayers` checks them against what the Code asks for, `inspectLayers` finds the layers a file carries (XMP metadata, C2PA credentials), and `witness layers <files>` does it from the command line. A watermark cannot be detected in a file, so you declare it with `--assume`.
- **Content Credentials in the browser (free).** `<witness-credentials>` and `useContentCredentials` read C2PA manifests and show who made the content and with what. The panel says plainly that the signature is read, not verified.
- **Layer check in CI (Pro).** `witness-scan` has a new rule, `ai-layers-insufficient`, that warns when AI images, audio or video carry fewer than two machine-readable layers. `assumeLayers` lists layers the scan cannot see, such as a provider's watermark.
- **Review workflow in the register (Pro).** Systems record their layers and a review: status, reviewer, approver and next review. `witness-report review <id> --by <name>` records one, `check` warns about systems that are not approved, overdue or under-marked, and the client report shows both.
- **New key date and legal status (Pro).** 2 February 2027 (interoperable watermark detection for signatories of the Code) and the legal status entry `2026-10.2`.

## Breaking changes

- **Node 22 or newer.** Node 20 is out of support. Browsers are not affected.
- **`Marking` has two new required fields,** `schema: 2` and `layers`. `createMarking` fills them in, so code that calls it does not change. You are affected only if you build `Marking` objects by hand in TypeScript. Functions that accept `Marking | MarkingInput` upgrade old objects with `normaliseMarking`.
- **`data-ai-schema` and `data-ai-layers`** are now written by `markingAttributes` and `labelHtml`. Update tests or selectors that match the attributes exactly. The existing `data-ai-*` attributes are unchanged.
- **Pro 2.0 needs `@sweberdev/witness` 2.x** for the layer functions. Pro 1.x keeps working with Witness 1.x and 2.x.

Files marked with 1.x are read by 2.0 and the other way round. The text watermark, the elements, the React components, the AI SDK middleware and all command line options stay as they are.

## Upgrading

```sh
npm install @sweberdev/witness@2 @sweberdev/witness-react@2
```

Pro customers update the four `@weber-development/witness-*` packages to 2.0.0. The [migration guide](/witness/docs/migrating-to-2) lists every change. Version 1.x gets fixes for 12 months, until October 2027.

## Not in 2.0

Signing MP3, timestamps for signatures, replacing existing manifests and a WordPress bridge move to 2.1. The 2.0 labels use Witness's own icon, not the official EU icon, which the Commission has not published as an asset yet.

## What Witness is not

Witness is a tool that makes disclosure easy to build and to evidence. It is not legal advice and does not decide whether your use of AI falls under Article 50. See the [layers guide](/witness/docs/guides/layers), the [live demo](/witness/demo) and the [Witness page](/witness) for the Pro edition.
