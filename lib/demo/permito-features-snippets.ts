/** Code shown in the GTM check, monitoring and catalog changes sections. Plain strings. */

export const GTM_COMMAND = `npx permito gtm-check export.json --config consent.config.ts`

export const MONITOR_COMMAND = `npx permito scan --sites permito.sites.json --report-dir reports`

export const CATALOG_CHANGES_COMMAND = `npx permito-catalog changes --since 0.2.0 --config consent.config.ts`

export const MONITOR_ACTION_SNIPPET = `name: Permito monitor

on:
  schedule:
    - cron: "0 5 * * 1" # Mondays, 05:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  issues: write

# ...install packages and Chromium, then:
- name: Scan all sites
  run: |
    set +e
    npx permito scan --sites permito.sites.json --report-dir permito-reports
    code=$?
    if [ "$code" -gt 1 ]; then exit "$code"; fi

- name: Open, update or close issues
  run: node node_modules/@weber-development/permito-scanner/templates/permito-monitor.mjs permito-reports
  env:
    GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`
