---
title: "Witness Pro 0.6.0 released"
excerpt: "Witness Pro 0.6.0 adds witness-sign: sign AI-generated images, audio and video with C2PA Content Credentials using your own certificate, as a function and a command line tool."
date: 2026-10-06
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, C2PA, Content Credentials, release]
---

Witness Pro 0.6.0 is out. It is a Pro release: the free packages `@sweberdev/witness` and `@sweberdev/witness-react` stay at 0.4.0.

## What is in 0.6.0

- **A new package, `@weber-development/witness-sign`.** It writes a signed C2PA manifest into a file you generated. The manifest states that the content was made by a generative model (IPTC digital source type `trainedAlgorithmicMedia`) and names the model, binds itself to the exact bytes of the file with a hash, and carries your certificate chain. Anyone with a C2PA reader can check where the file came from and that nobody changed it afterwards.
- **Your certificate, your key.** Witness does not issue certificates and runs no signing service. You pass a PEM certificate chain and key; signing happens on your machine. ECDSA (P-256, P-384, P-521), Ed25519 and RSA-PSS keys work, and Witness checks before signing that the key matches the certificate and the chain is valid and in order.
- **Six file types.** PNG, JPEG, WebP, WAV and MP4/MOV/M4A. Large manifests are split over several JPEG segments, and the MP4 manifest is appended so the offsets in the file stay valid. Files that already carry a manifest are refused rather than overwritten.
- **Checked against the reference reader.** Signed files verify with `verifyC2pa` from the scanner and with the c2pa-rs reference reader, and a changed byte is caught as a broken hash.

```sh
npx witness-sign generated/*.png --cert signer-chain.pem --key signer.key \
  --model "Image Model X" --model-version 3
```

```ts
import { signC2pa } from "@weber-development/witness-sign";

const { file } = signC2pa(bytes, {
  certificate: chainPem,
  privateKey: keyPem,
  model: { name: "Image Model X", version: "3" },
});
```

## A word on trust

A signature is valid when the manifest and the file match. Whether a reader shows the signer as trusted is a separate question: Adobe's Content Credentials viewer and others only trust certificates from the C2PA trust list. With a certificate you made yourself, the file verifies but the signer is reported as not recognised. For content you publish, get a signing certificate from a CA on that list. A signature also does not fulfil Article 50 on its own; it is one way to mark content that the Code of Practice points to.

Not in this release: MP3, replacing or extending an existing manifest, and a signed timestamp. See the [signing docs](/witness/docs/pro/sign), the [scanner docs](/witness/docs/pro/scan) for verification, and the [Witness page](/witness) for the Pro edition.
