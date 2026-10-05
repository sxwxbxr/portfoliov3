// Copy of the Gradient live demo (/gradient/demo). Kept next to the demo
// instead of lib/copy.ts so package pages stay independent of each other.
export const gradientDemo = {
  seoTitle: "Gradient live demo: accessible OKLCH color scales from your brand color",
  description:
    "Pick a brand color and get eleven accessible steps for light and dark mode, a matching neutral, live contrast checks and the export for Tailwind CSS, CSS variables and design tokens.",
  title: "Gradient",
  titleSub: "Live demo.",
  intro:
    "Pick a brand color. Gradient computes the scales in your browser with the same code as the npm package, checks every promised contrast pair and writes the stylesheet you can copy into your project.",
  isolation: "Everything runs in this page. Nothing you enter is sent anywhere.",
  overview: "Gradient overview",
  docs: "Read the docs",
  controls: {
    label: "Colors",
    brand: "Brand color",
    accent: "Accent color",
    useAccent: "Add an accent color",
    pin: "Keep the exact brand color on its closest step",
    presets: "Examples",
    invalid: "Use a color like #e30613, rgb(227 6 19) or oklch(60% 0.2 25).",
    picker: (name: string) => `Pick the ${name} color`,
  },
  scales: {
    label: "Scales",
    title: "Eleven steps, two modes",
    sub: "The number under each swatch is its contrast to the page.",
    lede:
      "Light mode is measured against white, dark mode against black. Step 500 reaches at least 3:1, step 600 at least 4.5:1 and step 800 at least 7:1, whatever color you pick.",
    light: "Light",
    dark: "Dark",
    closest: (step: number) => `Closest to your color: step ${step}`,
    pinned: "pinned",
    swatch: (name: string, mode: string, step: number, hex: string, ratio: string) =>
      `${name} ${mode} ${step}: ${hex}, contrast ${ratio} to 1`,
  },
  preview: {
    label: "Preview",
    title: "The same classes in both modes",
    sub: "No dark: variant needed.",
    lede:
      "Both panels use identical markup and the same variables. Only the values change with the mode.",
    heading: "Spring collection",
    body: "Body text in neutral 700 on a tinted surface, links in brand 600. Every pair here passes WCAG AA.",
    link: "Read more",
    button: "Order now",
    secondary: "Details",
    badge: "New",
    input: "Email",
    inputPlaceholder: "you@example.ch",
    alertTitle: "Accent",
    alert: "Notices use the accent scale, with the same steps as the brand.",
  },
  checks: {
    label: "Checks",
    title: "Contrast checks",
    sub: "Every pair the steps promise.",
    passed: (passed: number, total: number) => `${passed} of ${total} contrast checks pass.`,
    failedIntro: "These pairs fail because the exact brand color is pinned:",
    failed: (scale: string, mode: string, fg: string, bg: string, ratio: number, need: number) =>
      `${scale} ${mode}: ${fg} on ${bg} is ${ratio}:1, needs ${need}:1`,
  },
  export: {
    label: "Export",
    title: "Copy it into your project",
    sub: "Or generate it with one command.",
    tabs: "Export format",
    cli: "Same result with the CLI",
    tailwind: "Tailwind v4",
    css: "CSS variables",
    tailwind3: "Tailwind v3",
    tokens: "Design tokens",
    copy: "Copy",
    copied: "Copied",
  },
  closing: {
    label: "Next",
    title: "Use it in your project",
    sub: "MIT, no dependencies.",
    lede: "Generate the stylesheet once with the CLI, or create the palette in code, for example in a theme editor.",
  },
}
