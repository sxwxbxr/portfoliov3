---
title: "Logarithm 0.5.1: redaction now covers snake_case names"
excerpt: "A security fix: sensitive fields such as access_token, api_key and Authorization are now redacted in every spelling, not only camelCase. Update recommended."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, security, release]
---

Logarithm 0.5.1 is out on npm and fixes a redaction gap. We recommend that everyone updates.

## What was wrong

Logarithm never stores the values of sensitive fields such as passwords and tokens. It replaces them with `[redacted]` in changes and metadata, also inside nested objects. The default list of names was matched in a case-insensitive way, but only for the camelCase spellings. A payload from a Rails or Python backend, a webhook or an OAuth library that uses `access_token`, `api_key` or `client_secret` was therefore stored in the clear.

## What changed

Names now match regardless of case and of the separators `_` and `-`. `apiKey`, `api_key`, `API-KEY` and `Api_Key` are all the same name, and names you pass as `redact` are matched the same way. The default list is also longer: `authorization`, `clientSecret`, `secretKey`, `passphrase`, `sessionToken`, `cookie`, `currentPassword`, `newPassword`, `oldPassword` and `passwordConfirmation` are redacted now.

```ts
await audit.record({
  action: "integration.connected",
  actor: { id: "u_anna" },
  after: { provider: "stripe", access_token: "sk_live_…", headers: { Authorization: "Bearer …" } },
})
// stored: access_token "[redacted]", headers.Authorization "[redacted]"
```

## What you should check

Events that were recorded with an earlier version keep what was stored then. If you recorded payloads with snake_case secrets before, search your audit table for those field names and rotate the affected secrets. Logarithm Pro's retention can delete old events if you prefer to drop them.

The release is built and published by GitHub Actions with npm provenance, so the package on npm links to the commit and workflow behind it. The repository now has a `SECURITY.md` with the reporting channel.

```bash
pnpm add @sweberdev/logarithm@latest
```
