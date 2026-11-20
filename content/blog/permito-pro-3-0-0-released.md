---
title: "Permito Pro 3.0.0 released"
excerpt: "Permito Pro 3.0 adds the hub: one server and Docker image for agencies that holds the banner, the consent log and the scans of all client sites, gives each site one script tag and produces the customer report as a PDF under your logo. Nothing from 2.x breaks, and we explain why it is still a major version."
date: 2026-11-20
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, release, "3.0", hub, agencies, Docker, "consent log"]
---

Permito Pro 3.0.0 is out for licence holders: the six libraries at 3.0.0 on GitHub Packages, the new `permito-hub`, and the Docker image `ghcr.io/weber-development/permito-hub:3`. Prices and licences do not change.

## One place for all your client sites

Until now Permito Pro was libraries: you wired the banner, the log and the scanner into each project yourself. If you look after a dozen client sites, that is a dozen configurations, a dozen logs and a weekly scan job per site. The hub is that wiring as one server you run:

- **One script tag per site.** A client site is a JSON document the hub validates strictly. It gets `<script src="https://consent.agency.example/c/acme-shop.js">` and shows the Permito banner with its own services, languages and look. The hub address is read from the script URL, so it works behind any proxy.
- **A consent log per site.** Each decision is sent from the visitor's browser to the hub, checked against the origins of the site, validated and stored with a hashed visitor ID. A record cannot move between sites; salts and keys derive from your hub secret.
- **Seals and export.** Closed months are sealed into a chain; the hub verifies the chain and every seal against the log, and a changed record is named. A period can be exported as NDJSON or CSV with a signed manifest.
- **Scans on a schedule.** The hub scans each site with Chromium, compares the result with the last scan and sends a webhook (Slack, Teams or JSON) or a mail when something new appears, those active before consent first. A scan that starts failing alerts too.
- **The customer report.** PDF, HTML or Markdown, German or English, under your agency name, colour and logo: findings, decisions in the period and the state of the seals. It states what was checked and makes no legal statement.
- **Roles.** Viewers read, editors change sites and run scans, admins also manage users and branding.

Everything is an environment variable; a wrong setting stops the container at start and names the setting. The [demo page](/permito/demo#pro-new-3) shows a recorded run, including the case where the database is edited and the verify endpoint names the changed record.

## Stable interfaces, honest version number

We call this 3.0 and not 2.2 because there is now something you operate: a database with your clients' consent evidence, a sign-in and outgoing mail. And because the settings, the HTTP API, the site document and the format of the script at `/c/<site>.js` are stable from 3.0: a breaking change in them needs a new major version. We found no export, option, config key, exit code or file format of 2.x that we had to remove or change. A consent log and its seals from 2.x work as before. The migration guide in the customer repository says so.

## What we have not verified

- Alert mails through real SMTP servers, and the webhooks against the live Slack and Teams services. The tests use a recording mail server and a local receiver.
- The hub behind a real reverse proxy with `PERMITO_HUB_TRUST_PROXY=1`, load beyond an agency's normal traffic, and several hub processes on one data folder (not supported).
- Scan and webhook addresses are checked by the address in the URL; a host name that resolves to a private address later is not caught.
- The service catalog is not refreshed automatically. Its entries carry a retrieval date and the hub shows how old they are.
- The German and English texts of the report have not been read by a native speaker.
- Pulling the image as a customer from the container registry is untested.
- There is no import of an existing log into the hub, and one hub serves one agency.

## Upgrading

Update the Permito Pro packages to 3.0.0 together and run your tests; nothing else changes. To use the hub, pull the image, set the variables and mount `/data`. Back up the volume together with the secret: without the secret, old seals cannot be verified. Permito Pro 2.x stays supported and gets corrections until 12 October 2027, without new features. The free packages stay on 2.x.
