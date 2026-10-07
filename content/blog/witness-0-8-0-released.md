---
title: "Witness 0.8.0 released: a visible label for audio and video, and a legal status changelog"
excerpt: "The free packages reach 0.5.0 with witness-player, a visible AI label for audio and video. Witness Pro 0.8.0 adds a legal status changelog to the client report and the register."
date: 2026-10-07
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, deepfake, audio, video, legal status, release]
---

Witness 0.8.0 is out: the free packages `@sweberdev/witness` and `@sweberdev/witness-react` are at 0.5.0, the Pro packages at 0.8.0.

## Free 0.5.0: a visible label with audio and video

XMP marking is for machines. For deepfake audio and video, Article 50(4) also asks for a disclosure people can see. The new `<witness-player>` element wraps an `<audio>` or `<video>` and keeps the label with it: an overlay in the corner of a video, a bar above the controls of an audio player. `kind="deepfake"` gives the "Artificially generated" wording in English, German, French and Italian. In React the same is `AiPlayer`.

```html
<witness-player kind="deepfake" generator="video-model" href="/ki">
  <video src="clip.mp4" controls></video>
</witness-player>
```

Witness does not decide whether something counts as a deepfake or whether an exception applies; it only makes the label easy to show.

## Pro 0.8.0: a legal status you can follow

Article 50 and the texts around it are still moving. Witness Pro now keeps a changelog of the legal wording and dates it works with, named by a version (today `2026-10`).

- The client report names the status it follows and lists what changed since your register was last reviewed, in four languages.
- `witness-report legal` shows those changes, and `--accept` records the current status in the register.
- `witness-report check` warns when a newer status exists, so a CI job tells you to read the changes.
- The scanner accepts `<witness-player>` as the visible label of the audio or video it wraps.

```sh
npx witness-report legal
npx witness-report legal --accept
```

The changelog records what Witness uses; it is not legal advice and does not tell you what your own duties are. See the [audio and video guide](/witness/docs/guides/audio-video), the [report docs](/witness/docs/pro/report) and the [Witness page](/witness) for the Pro edition.
