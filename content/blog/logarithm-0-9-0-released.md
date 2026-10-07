---
title: "Logarithm Pro 0.9.0 released"
excerpt: "Verify the signature and certificate chain of an RFC 3161 timestamp in your own code, against the authority's root you trust, without OpenSSL."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, tamper evidence, timestamps, release]
---

Logarithm Pro 0.9.0 is out and available to all Pro customers. The free packages stay at 0.5.1. Nothing breaks: 0.8.0 code keeps working as it is.

## A timestamp is only worth what you can verify

Since 0.5.0, Logarithm can have a time-stamping authority certify a checkpoint of your audit log, so you can prove the chain head existed on a given date independently of your database. Until now, `verifyTimestamp()` only checked that the token covers the checkpoint. Checking that the authority really signed it meant a trip to `openssl ts -verify`.

`verifyTimestampChain()` closes that gap in code:

```ts
import { verifyTimestampChain } from "@weber-development/logarithm-integrity"

const proof = await verifyTimestampChain(stamped, { trustedRoots: [authorityRootPem] })
// { genTime: "2026-10-06T12:00:00Z", signer: "CN=Example TSA, O=Example", chain: [...] }
```

It checks that the token covers the checkpoint, that the signature over the signed attributes is valid, that the signer's certificate is meant for time-stamping, that the chain leads to a root you hold, and that every certificate was valid at the certified time. When something does not hold, it throws with the reason. RSA and ECDSA (P-256, P-384, P-521) with SHA-2 run on Web Crypto, so it works in Node, edge runtimes and the browser.

`verifyTimestampToken(token, digest, { trustedRoots })` does the same for a raw token, for example when an auditor hands you only the `.tsr` file.

You get the authority's root certificate from the authority and keep it yourself. That is what makes the check independent: a token that brings its own root proves nothing.

Revocation is not checked. If an authority reports a compromised key, remove its root from `trustedRoots`. The `openssl ts -verify` route stays valid for checks outside your code.

## Update

```bash
pnpm add @weber-development/logarithm-integrity@latest @weber-development/logarithm-export@latest @weber-development/logarithm-retention@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
