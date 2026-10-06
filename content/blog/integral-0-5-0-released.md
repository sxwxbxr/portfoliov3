---
title: "Integral Pro 0.5.0 released"
excerpt: "Rotate your signing key without locking customers out, get a webhook for every license event and send license emails with ready-made texts."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Key rotation, Webhooks, release]
---

Integral Pro 0.5.0 is out for subscribers. The free packages `@sweberdev/integral` and `@sweberdev/integral-react` stay at 0.3.0; `verifyLicense` already accepts a list of public keys there.

## Why

A license server is only as good as its operations. Sooner or later a private key leaks, a team member leaves or you want a cleaner setup. Until now, replacing the key meant every issued license stopped verifying. And whoever wanted to know about a refund or a new customer had to write the glue code themselves.

## What is new

- **Key rotation.** Set the new private key and list the old public key in `previousPublicKeys`. Licenses of the old key stay valid for refresh, activation, floating seats and usage. `publicKeys()` (and `GET /public-key`) returns all keys for your apps, `resignAll()` signs every license again with the new key without emailing customers.
- **Webhooks.** Every event of the audit trail (issued, renewed, revoked, activated, seat taken, …) can go to your URLs, optionally filtered by type. Deliveries are signed with `x-integral-signature` (HMAC-SHA256) or sent as a short Slack or Teams message. A target that is down never breaks a license change.
- **Emails.** The `mail` option sends the license to the customer on issue, renewal, cancellation, end and revocation, in English or German, as text and HTML. You only bring the `send` function of your mail service, or call `licenseMail()` and send it yourself.

```ts
createLicenseServer({
  privateKey: process.env.INTEGRAL_PRIVATE_KEY!,
  previousPublicKeys: [process.env.INTEGRAL_OLD_PUBLIC_KEY!],
  webhooks: [{ url: process.env.SLACK_URL!, format: "slack", events: ["issued", "revoked"] }],
  mail: { appName: "My App", locale: "de", send: (m) => mailer.send(m) },
  // …
})
```

## Update

Nothing to migrate: the new options are optional and existing routes and tables are unchanged. The [server docs](https://packages.sweber.dev/integral/docs) describe each option. Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
