---
title: "Witness Pro 0.5.0 released"
excerpt: "Witness Pro 0.5.0 checks the file binding of C2PA manifests in MP4, MOV and M4A files, so a changed video is caught, and witness-report check warns when an Article 50 key date comes close."
date: 2026-10-06
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, C2PA, video, deadlines, release]
---

Witness Pro 0.5.0 is out. It is a Pro release: the free packages `@sweberdev/witness` and `@sweberdev/witness-react` stay at 0.4.0.

## What is in 0.5.0

- **Verified video.** The scanner already verified the signature and the assertions of C2PA manifests in MP4, MOV and M4A files. It now also checks the file binding (`c2pa.hash.bmff`, version 2 and 3): the top-level boxes of the file are hashed with their offsets and compared with the hash in the manifest. A video that was edited, re-muxed or truncated after signing is reported as `c2pa-invalid`. Fragmented files with a Merkle tree are still reported as not checked.
- **Deadline warnings.** `witness-report check` now looks at the key dates that apply to your systems. A date closer than 60 days is printed as a warning with the systems it concerns, so a CI job that runs it reminds you before the 2 December 2026 deadline for machine-readable marking. `--warn-within <days>` changes the window, and `--fail-within <days>` makes the check fail when the marking deadline is that close.

```sh
npx witness-report check --warn-within 90 --fail-within 30
```

With 0.5.0 the C2PA verification covers every format Witness knows: PNG, JPEG, WebP, MP3, WAV, MP4, MOV and M4A. Verification tells you a manifest is intact and which certificate signed it, not that what it says is true. See the [scanner docs](/witness/docs/pro/scan) and the [report docs](/witness/docs/pro/report), and the [Witness page](/witness) for the Pro edition.
