/** Inputs for the playground. Each one is a format `derivative build` reads. */

export const CHANGESETS_SAMPLE = `# @muster/ledger

## 1.4.0

### Minor Changes

- 3f2a1b2: Attach receipts to journal entries by drag and drop.
- [#88](https://git.example/muster/ledger/pull/88) [\`9c8d7e6\`](https://git.example/muster/ledger/commit/9c8d7e6) Thanks [@mira](https://git.example/mira)! - VAT report for the **quarter**, ready for the ESTV portal

### Patch Changes

- 1a2b3c4: Fix sorting of accounts with leading zeros.
- Updated dependencies [3f2a1b2]
  - @muster/ui@1.4.0

## 1.3.0

### Major Changes

- abcdef1: Drop support for Internet Explorer.
`

export const KEEP_A_CHANGELOG_SAMPLE = `# Changelog

## [Unreleased]

### Added

- Bank import for PostFinance.

## [2.0.0] - 2026-09-30

### Added

- Team invitations with roles.

### Fixed

- The login form keeps your e-mail address after an error.

### Security

- Sessions now expire after 12 hours of inactivity.

## [1.9.1] - 2026-09-01

### Fixed

- Correct VAT rate for Liechtenstein.
`

export const COMMITS_SAMPLE = `e5a1c02 feat(search): find invoices by amount
b7d2f19 (tag: v2.1.0) chore(release): 2.1.0
c3e8a44 feat(export)!: new column order in the CSV export
a91f0d2 fix: keep filters when switching months
d02c7b1 ci: cache dependencies
f4b6e80 docs: update README
9e3a5c7 perf: open large journals twice as fast
0b1d2e3 (tag: v2.0.0) feat: multi-currency accounts
`

/** Reads `git log --oneline --decorate` output, newest first. */
export function parseOneline(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^([0-9a-f]{4,40})\s+(?:\(([^)]*)\)\s+)?(.*)$/i.exec(line)
      const refs = m?.[2] ?? ""
      return {
        hash: m?.[1] ?? "",
        date: "",
        subject: m?.[3] ?? line,
        tags: refs
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r.startsWith("tag: "))
          .map((r) => r.slice(5)),
      }
    })
}
