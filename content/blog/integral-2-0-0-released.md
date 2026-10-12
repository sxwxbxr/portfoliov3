---
title: "Integral 2.0.0 released"
excerpt: "Integral 2.0 adds the int2 license format with Ed25519 and ECDSA P-256, signing with keys in a KMS or HSM, Stripe, Paddle and Lemon Squeezy next to Polar, and device management for your customers."
date: 2026-10-12
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, "2.0", KMS, release]
---

Integral 2.0.0 is out. `@sweberdev/integral` and `@sweberdev/integral-react` 2.0.0 are on npm, and Integral Pro 2.0.0 is available to subscribers. Licenses you issued before keep working.

## What is new

The free packages get a new license format, `int2`. Its header names the algorithm and, optionally, the key id, so a license can be signed with Ed25519 or with ECDSA P-256. P-256 matters because it is what AWS KMS, Google Cloud KMS, Azure Key Vault and HashiCorp Vault can sign with. `int1` licenses stay readable in every 2.x release, revocation lists are now `intr2` (`intr1` is still read), and `verifyLicense` accepts a key ring that mixes both algorithms.

- `signLicense`, `signRevocationList` and `bindLicense` take a **signer** instead of a private key string, so the key never has to be in your process
- `upgradeLicense()` and `npx integral migrate` sign `int1` licenses again as `int2`, keeping id, plan, dates and device
- `npx integral keygen --alg es256` creates a P-256 key pair

Integral Pro adds what a hosted licensing service charges for:

- **Keys in a KMS or HSM.** `vaultTransitSigner` for HashiCorp Vault and `kmsSigner` as a wrapper for AWS KMS, Google Cloud KMS and Azure Key Vault. The private key stays in the service.
- **More payment sources.** `stripeSource`, `paddleSource` and `lemonSqueezySource` next to Polar, each verifying its provider's webhook signature and feeding the same license logic: issue, renew, cancel, end, refund, emails, event webhooks and the audit trail.
- **Devices managed by the customer.** `POST /devices` and a `<DeviceList>` view let customers see where their license is active and free a place themselves.
- **Offline tolerance for floating seats.** `useLease({ offlineGraceSeconds })` keeps the app working for a while when the license server cannot be reached.

## What is verified

The Stripe, Paddle and Lemon Squeezy sources and the AWS, Google and Azure KMS recipes are **beta**. They follow the vendors' documentation and are tested with locally signed sample events and mocked APIs, not with real accounts. The Vault adapter is tested against a mocked API. Try them in test mode and check the first licenses in the admin view before you rely on them. Polar and local signing with Ed25519 or P-256 keys are unchanged in behavior and covered by the test suite.

## Breaking changes

- `signLicense` and `signRevocationList` issue `int2` and `intr2` by default. Apps that still run Integral 1.x cannot read them: update those apps first or pass `format: "int1"`.
- `LICENSE_PREFIX` is `"int2"`, `REVOCATION_PREFIX` is `"intr2"`, `LicensePayload.v` is `1 | 2`.
- Node 22 or newer (`engines`).
- Pro needs the free packages 2.x. `LicenseServer` has a new method `devices()`, which only matters if you mock or wrap the interface. `webhookSecret` still works; the handler throws at start if neither `webhookSecret` nor `sources` is set. No database changes are needed.

## Upgrading

1. Update `@sweberdev/integral` and `@sweberdev/integral-react` to 2.0.0. Existing `int1` licenses still verify.
2. Pro: update `@weber-development/integral-server` and `-portal` to 2.0.0 together. Pro 1.0.1 already accepts the 2.x free packages, so you can do it in two steps.
3. Optionally convert stored licenses: `npx integral migrate --file licenses.txt --private-key-file integral-private.key`.

The [migration guide](https://packages.sweber.dev/integral/docs/migrating-to-2) lists every change. Integral 1.x gets fixes for 12 months from today. Prices and licences are unchanged; Integral Pro still starts at CHF 12 per month. The [live demo](https://packages.sweber.dev/integral/demo) now lets you choose Ed25519 or ECDSA P-256.
