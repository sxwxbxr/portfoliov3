---
title: "Witness 0.2.0 released"
excerpt: "Witness now marks audio and video too: the IPTC digital source type in MP3, WAV, MP4, MOV and M4A files, from code or the CLI. Witness Pro 0.2.0 checks AI audio and video in your build."
date: 2026-10-05
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, audio, video, XMP, release]
---

Witness 0.2.0 is out. Article 50(2) of the EU AI Act asks for machine-readable marking of synthetic audio and video as well as images and text. Until now Witness only marked images. With 0.2.0, `@sweberdev/witness` writes the same XMP marking into sound and video files. `@sweberdev/witness` and `@sweberdev/witness-react` 0.2.0 are on npm under the MIT licence.

## What is in 0.2.0

- `markMedia` and `readMediaMarking`: write and read XMP with the IPTC digital source type, the AI system and the creation date in MP3, WAV, MP4, MOV and M4A files.
- The marking goes where the XMP specification puts it: an ID3v2 `PRIV` frame for MP3, a `_PMX` chunk for WAV, and a `uuid` box at the end of MP4 files. The sound and the picture are not re-encoded, and other ID3 tags such as title and cover are kept.
- `markFile` and `readMarking` detect images, audio and video and do the right thing, so one call covers everything a model can produce.
- `witness mark` and `witness inspect` accept audio and video files.
- Files that carry a C2PA manifest are left unchanged, as they are for images.

## Install

```sh
npm install @sweberdev/witness@0.2.0
```

```ts
import { markMedia } from "@sweberdev/witness"

const { bytes, status } = markMedia(audio, { generator: "tts-model", provider: "Beispiel AG" })
```

The same from the command line:

```sh
npx witness mark voice/*.mp3 clips/*.mp4 --out marked --generator "tts-model"
npx witness inspect marked/*
```

The [audio and video guide](/witness/docs/guides/audio-video) has the details, including how to mark the output of `generateSpeech` from the Vercel AI SDK. In the [live demo](/witness/demo#images) you can mark your own sound file or video in the browser and download it again.

Metadata is not a watermark: re-encoding and most platforms remove it. For deepfake audio and video, Article 50(4) also asks for a visible or audible disclosure. Put a label on the player and a short spoken notice at the start of the audio.

## Witness Pro 0.2.0

The Pro scanner now checks audio and video in your build. Files in folders you declare as AI-generated must carry a marking (`ai-media-unmarked`), and marked files played in an `<audio>` or `<video>` element need a label next to the player (`ai-media-unlabelled`). The transparency report counts AI audio and video. See the [Witness page](/witness) for the Pro edition.
