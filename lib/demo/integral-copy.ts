// Copy of the Integral live demo (/integral/demo). Kept next to the demo
// instead of lib/copy.ts so package pages stay independent of each other.
export const integralDemo = {
  seoTitle: "Integral live demo: sign and verify software licenses in your browser",
  description:
    "Create a key pair, issue a signed license, tamper with it, move the clock and watch plans, features and limits change. Plus the subscription lifecycle of Integral Pro.",
  title: "Integral",
  titleSub: "Live demo.",
  intro:
    "Integral signs licenses with Ed25519 and checks them offline in your app. This page runs the same code as the npm package: it creates a key pair, issues licenses, verifies them and applies your plans.",
  isolation: "Everything runs in this page. Keys and licenses never leave your browser.",
  unsupported:
    "Your browser does not support Ed25519 in the Web Crypto API yet. Use a current version of Chrome, Edge, Firefox or Safari.",
  overview: "Integral overview",
  docs: "Read the docs",
  keys: {
    label: "Keys",
    title: "One key pair per product",
    sub: "The private key signs, the public key only checks.",
    lede:
      "In a real project the private key stays on your server or in CI secrets. The public key ships with your app: it cannot create licenses, so it does not need to be secret.",
    publicKey: "Public key (ships with the app)",
    privateKey: "Private key (stays on the server)",
    regenerate: "New key pair",
    cli: "Same with the CLI",
  },
  issue: {
    label: "Issue",
    title: "Issue a license",
    sub: "What a payment webhook or the CLI does.",
    lede: "Pick a plan and optional extras. The license is a signed string you can email, store in a file or paste into a text field.",
    plan: "Plan",
    email: "Customer email",
    beta: "Extra feature for this customer: beta",
    trial: "Trial license",
    bind: "Bind to laptop A",
    projects: "Project limit for this customer (empty: plan default)",
    updatesUntil: "Updates until",
    expires: "Hard expiry (optional)",
    sign: "Sign license",
    result: "License key",
    copy: "Copy",
    copied: "Copied",
  },
  verify: {
    label: "Verify",
    title: "Check it offline",
    sub: "Change anything and the signature breaks.",
    lede:
      "Edit the license, tamper with the plan or sign it with a stranger's key. Move the date to see expiry and update periods at work, revoke the license with a signed revocation list or check a device-bound license on another laptop.",
    input: "License key to check",
    tamper: "Change plan to team without signing",
    foreign: "Sign with a stranger's key",
    reset: "Back to the issued license",
    revoke: "Revoke this license",
    unrevoke: "Lift the revocation",
    device: "Checked on",
    devices: { own: "Laptop A", other: "Laptop B" },
    today: "Pretend today is",
    release: "Release date of the running app version",
    valid: "Valid license",
    invalid: (reason: string) => `Invalid: ${reason}`,
    reasons: {
      malformed: "not an Integral license",
      unsupported_version: "unsupported format version",
      bad_signature: "the signature does not match, so it was changed or signed with another key",
      wrong_product: "the license belongs to another product",
      not_yet_valid: "not valid yet",
      expired: "the license has expired",
      revoked: "the license is on the signed revocation list",
      wrong_machine: "the license is bound to another device",
    } as Record<string, string>,
    covered: "This app version is covered by the update period.",
    notCovered:
      "This app version was released after the update period. Earlier versions keep working; this one asks for a renewal.",
    payload: "Signed content",
    status: (s: { state: string; trial: boolean; daysLeft: number | null; updatesDaysLeft: number | null; updatesEnded: boolean }) =>
      [
        s.trial ? "Trial" : "Full license",
        s.daysLeft === null
          ? "no expiry"
          : s.state === "expiring"
            ? `expires in ${s.daysLeft} ${s.daysLeft === 1 ? "day" : "days"}`
            : `${s.daysLeft} days left`,
        s.updatesEnded
          ? "updates ended"
          : s.updatesDaysLeft === null
            ? "updates without end"
            : `updates for ${s.updatesDaysLeft} more ${s.updatesDaysLeft === 1 ? "day" : "days"}`,
      ].join(" · "),
    revocationList: (n: number) => `Signed revocation list (${n} ${n === 1 ? "license" : "licenses"})`,
  },
  app: {
    label: "Entitlements",
    title: "What the app unlocks",
    sub: "Plans, features and limits from one definition.",
    lede:
      "Without a valid license the app falls back to the free plan. With one, it applies the plan plus the extras signed into the license.",
    plan: (plan: string) => `Current plan: ${plan}`,
    features: {
      editor: "Editor",
      export: "Export to PDF",
      sync: "Cloud sync",
      sso: "Single sign-on",
      beta: "Beta features",
    } as Record<string, string>,
    included: "included",
    locked: (plan: string) => `in ${plan}`,
    lockedNoPlan: "not in any plan",
    projects: "Projects",
    usage: (used: number, limit: number | null) =>
      limit === null ? `${used} of unlimited` : `${used} of ${limit}`,
    add: "New project",
    remove: "Remove project",
    limitReached: "Limit of your plan reached.",
    definition: "plans.ts",
  },
  pro: {
    label: "Pro",
    title: "Integral Pro: licenses from Polar, automatically",
    sub: "Simulated subscription, real signatures.",
    lede:
      "The license server of Integral Pro listens to Polar webhooks and keeps one license per subscription. Play through a subscription below. Each step re-signs the license the way the server does: renewals extend the update period, a cancellation keeps the installed version working, a refund revokes the license.",
    events: {
      purchase: "Subscription starts",
      renew: "Monthly renewal",
      cancel: "Customer cancels",
      end: "Paid period ends",
      refund: "Refund",
      lifetime: "Lifetime purchase",
      reset: "Start over",
    },
    clock: (date: string) => `Simulated date: ${date}`,
    status: "Status",
    updatesUntil: "Updates until",
    expires: "Works until",
    forever: "no end",
    none: "No license yet. Start a subscription or buy Lifetime.",
    log: "Webhook log",
    statuses: {
      active: "active",
      canceled: "canceled, runs until the end of the period",
      ended: "ended, installed versions keep working",
      revoked: "revoked",
    } as Record<string, string>,
    checkToday: (ok: boolean) => (ok ? "License valid today" : "License no longer valid"),
    proLink: "Integral Pro documentation",
  },
  activation: {
    label: "Devices",
    title: "Activate a license on devices",
    sub: "A device limit per license, also offline.",
    lede:
      "The customer buys once and activates the license on their own devices. Each activation signs a copy of the license that only works on that device. Integral Pro counts the devices per license (here: two) and frees a place when a device is removed. Computers without internet send an activation request as a file instead.",
    limitInfo: (n: number) => `This license may be active on ${n} devices.`,
    activate: "Activate",
    deactivate: "Remove",
    offline: "Offline request",
    on: "Active on this device",
    off: "Not activated",
    hint: "Pick a device to activate the license on it.",
    activated: (name: string) => `${name}: the license is now bound to this device.`,
    freed: "The device was removed and its place is free again.",
    limit: (n: number) => `Device limit reached (${n}). Remove another device first.`,
    request: "Activation request (send it to the vendor as a file)",
  },
}
