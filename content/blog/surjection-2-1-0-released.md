---
title: "Surjection Pro 2.1: pull request comments and scheduled monitoring"
excerpt: "Pro now comments on pull requests with only the new accessibility issues and watches live sites on a schedule, with Slack or mail alerts when results get worse. Both parts are beta."
date: 2026-10-13
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, GitHub Actions, "2.1", release]
---

Surjection Pro is at 2.1.0 (`@weber-development/surjection-report`, `-history` and `-checklist`). The free package stays at 2.0.0. Prices and the licence are unchanged. The new features live in `@weber-development/surjection-history` and are the two things that turn the checker from a tool you run into a process that runs by itself.

## Pull request comment

On every pull request, `surjection-history pr-comment` compares the preview with the base and writes **one** comment that lists only what the pull request makes worse: impact, page, issue and element, with fix hints folded away. When you push again, the same comment is updated instead of a new one being added. If nothing new appears, the comment says so. The exit code follows `--fail-on`, so the job can block the merge.

Because findings carry the stable `id` introduced with results format 2, a page that moved between preview and production host is not reported as new.

## Scheduled monitoring

A second workflow runs daily against the live site, records the result in a branch called `surjection-history` and runs the regression check. New issues go to a Slack-compatible webhook or by mail, and the job turns red.

## Set up

```sh
npx surjection-history init-ci --pull-request --monitor
```

writes both workflow files (existing files are never overwritten). You set the repository variables for the URLs and the secrets for the Pro package token and the webhook or mail settings; the generated files list them.

## What is beta, and why

- The comment logic is tested, including create-then-update against a real GitHub pull request.
- The monitoring steps were run end to end against a local Git remote, with history persisting across runs.
- **Not yet verified:** the generated workflows inside a real GitHub Actions run, installing the Pro packages from GitHub Packages in that run, and real Slack or mail delivery on a real schedule. Until that has been done in customer setups, both features are labelled beta in the docs.

Details are in the [Pro history docs](https://packages.sweber.dev/surjection/docs/pro/history). See [Surjection](https://packages.sweber.dev/surjection) for the full feature list.
