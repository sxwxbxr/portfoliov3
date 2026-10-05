/** Commands shown in the Pro section of the Witness demo. */
export const WITNESS_PRO_COMMANDS = `# CI: fail the build when AI content has no label or marking
npx witness-scan dist --json witness-scan.json

# Transparency report for the client, with scan results and notice evidence
npx witness-report build --scan witness-scan.json --events notice-events.jsonl \\
  --out ai-transparency-report.html

# Public "How we use AI" page
npx witness-report page --show-vendors --out public/ai.html`
