---
title: "Witness 0.3.0 released"
excerpt: "Witness now reads C2PA Content Credentials in images, audio and video, and can watermark every paragraph of a generated text. Witness Pro 0.3.0 checks C2PA-declared AI content and lists the key dates in the transparency report."
date: 2026-10-06
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, C2PA, Content Credentials, watermark, release]
---

Witness 0.3.0 is out. Many image and video generators already embed C2PA Content Credentials, the signed metadata that the Code of Practice on marking points to. Until now Witness only knew that such a manifest was there. With 0.3.0 it reads what the manifest says. `@sweberdev/witness` and `@sweberdev/witness-react` 0.3.0 are on npm under the MIT licence.

## What is in 0.3.0

- `readC2pa` reads the C2PA manifest store of PNG, JPEG, WebP, MP3, WAV and MP4 files. It returns the application that wrote it, the title, the recorded actions and the IPTC digital source type they declare.
- `aiGenerated` tells you whether the active manifest declares a trained AI model as the source. `aiInHistory` also covers earlier manifests, for example the generated original of an image that was edited later.
- `readImageMarking`, `readMediaMarking`, `readMarking` and `witness inspect` count a C2PA AI declaration as AI marking. A file from a generator with Content Credentials no longer shows up as unmarked just because it has no XMP.
- Text watermarks can go on every paragraph: `watermarkText(text, mark, { paragraphs: true })`, and the same `paragraphs` option in the Vercel AI SDK middleware, for `generateText` and `streamText`. A paragraph quoted from a longer answer then still carries the mark.

Witness reads the manifest; it does not validate it. The signature, the certificate chain and the hash binding are not checked, and the result says so with `verified: false`. Treat it as what the file claims, and use c2patool or a C2PA SDK when you need validation.

## Install

```sh
npm install @sweberdev/witness@0.3.0
```

```ts
import { readC2pa, watermarkText } from "@sweberdev/witness"

readC2pa(bytes)?.aiGenerated // true for a generator that declares trainedAlgorithmicMedia

const marked = watermarkText(answer, { generator: "Claude" }, { paragraphs: true })
```

The [images guide](/witness/docs/guides/images) covers C2PA, and the [text guide](/witness/docs/guides/text) covers paragraph watermarks. In the [live demo](/witness/demo#images) you can load a sample image with Content Credentials and see what Witness reads from it. The [text watermark section](/witness/demo#text) now marks every paragraph.

## Witness Pro 0.3.0

The Pro scanner treats images, audio and video whose C2PA manifest declares AI as AI content. Shown without a label next to them, they fail the build, and the finding says that the declaration comes from the manifest. The transparency report has a new "Key dates" section. It shows when Article 50 applies and when the grace period for machine-readable marking ends on 2 December 2026 for generative systems already on the market before 2 August 2026. For each date it lists the systems from the register it concerns and the days left. See the [Witness page](/witness) for the Pro edition.
