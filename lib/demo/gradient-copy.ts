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
    status: "Add matching status colors (success, warning, danger, info)",
    share: "Copy link to this palette",
    shareHint: "The colors are in the address, so you can send the palette or open it again later.",
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
    status: {
      success: { title: "Saved.", text: "Your changes are live." },
      warning: { title: "Check this.", text: "The address looks incomplete." },
      danger: { title: "Failed.", text: "The card was declined." },
      info: { title: "Note.", text: "Shipping takes two days." },
    },
  },
  vision: {
    label: "Color vision",
    hint: "Shows the scales and the preview as people with a color vision deficiency see them.",
    names: {
      normal: "Normal vision",
      protanopia: "Protanopia (no red cones)",
      deuteranopia: "Deuteranopia (no green cones)",
      tritanopia: "Tritanopia (no blue cones)",
    },
    summary: (count: number) =>
      count === 0
        ? "Every pair of colors stays distinguishable at step 600, also with a color vision deficiency."
        : `${count} ${count === 1 ? "pair looks" : "pairs look"} alike at step 600. Add an icon or a label, never rely on color alone:`,
    alike: (a: string, b: string, visions: string) => `${a} and ${b}: ${visions}`,
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
  audit: {
    label: "Audit",
    title: "Check the colors you already have",
    sub: "Paste a stylesheet.",
    lede:
      "Gradient reads custom properties that end in a step number, like --color-brand-600 or --blue-500, from :root, a dark class or a dark media query, and checks the pairs the step numbers promise. For every failing step it suggests one color that fixes all of its pairs.",
    input: "Your CSS",
    clear: "Clear",
    empty: "No color steps found. Use variables like --color-brand-600 or --blue-500.",
    allPass: "Every pair passes.",
    someFail: (n: number) => `${n} ${n === 1 ? "pair fails" : "pairs fail"}.`,
    fail: (fg: string, bg: string, ratio: number, need: number) => `${fg} on ${bg} is ${ratio}:1, needs ${need}:1.`,
    try: "Try",
    skipped: (n: number) => `${n} variable${n === 1 ? "" : "s"} skipped because ${n === 1 ? "it is" : "they are"} not plain colors.`,
    cli: "Same check with the CLI",
    sample: `:root {
  --color-brand-50: #fff1f2;
  --color-brand-500: #f43f5e;
  --color-brand-600: #e11d48;
  --color-brand-on-600: #ffffff;
  --color-sun-50: #fffbeb;
  --color-sun-500: #facc15;
  --color-sun-600: #ca8a04;
  --color-sun-700: #a16207;
}
.dark {
  --color-brand-50: #1a0b0e;
  --color-brand-500: #f43f5e;
  --color-brand-600: #fb7185;
}`,
  },
  series: {
    label: "Charts",
    title: "Chart colors that stay apart",
    sub: "Also with a color vision deficiency.",
    lede:
      "Chart libraries often ship series colors that blur into one for people with red-green deficiency. Gradient picks colors from your brand hue that keep their distance under protanopia, deuteranopia and tritanopia and reach 3:1 on the page. Switch the color vision above to see for yourself.",
    count: "Number of series",
    chartLabel: (mode: string) => `Example bar chart in ${mode} mode`,
    distance: (d: number) => `Smallest distance between two colors: ${d} (0.08 and up is clearly different).`,
    good: "All pairs are clearly distinguishable.",
    label2: "Label the series directly or use different markers, color alone is not enough here.",
    cli: "Same colors with the CLI",
  },
  blend: {
    label: "Gradients",
    title: "Gradients without the muddy middle",
    sub: "Blended in OKLCH instead of sRGB.",
    lede:
      "A CSS gradient blends in sRGB, which turns the middle of blue to yellow grey. Gradient blends lightness, colorfulness and hue in even steps. Pick two colors and compare, then see whether your text stays readable on every stop.",
    from: "First color",
    to: "Second color",
    srgb: "CSS default (sRGB)",
    oklch: "Gradient (OKLCH)",
    text: "Text color",
    textSample: "Text on the gradient",
    contrast: (min: number, max: number) => `Contrast of the text across the gradient: ${min}:1 to ${max}:1.`,
    pass: "Passes 4.5:1 on every stop.",
    fail: "Fails 4.5:1 on at least one stop. Use a darker or lighter text color, or darker ends.",
    cli: "Same gradient with the CLI",
  },
  image: {
    label: "Image",
    title: "Brand color from a logo",
    sub: "Your image stays in the browser.",
    lede:
      "Drop a logo or photo, or try the example. Gradient finds its dominant colors and picks the one that makes a good brand color, skipping white, black and grey. The pixels are read in your browser and not uploaded.",
    drop: "Choose an image",
    example: "Try the example",
    colors: "Dominant colors",
    pick: "Brand color",
    use: "Use as brand color above",
    none: "No colorful color found. Choose a brand color by hand.",
    error: "This image could not be read.",
  },
  config: {
    label: "Config",
    title: "One file, every output",
    sub: "Build locally, verify in CI.",
    lede:
      "Keep your colors in gradient.config.json and generate all files with one command. The file below follows the colors, options and your picks from above; the list shows what gradient build would write. In CI, gradient build --verify fails when a file is out of date.",
    json: "gradient.config.json",
    files: "gradient build writes",
    lines: (n: number) => `${n} lines`,
    action: "GitHub Action for pull requests",
    cli: "Same with the CLI",
  },
  pair: {
    label: "Pair",
    title: "Check any two colors",
    sub: "Also colors that are not in the palette.",
    lede:
      "A logo color, a text on a photo overlay, a color from the design file: enter text and background and get the WCAG 2 result. If the pair fails, Gradient suggests the closest color that passes, with the same hue and only the lightness changed.",
    text: "Text color",
    background: "Background color",
    sampleLarge: "Large text, 24 pixels",
    sample: "Body text at 14 pixels. This is the size that needs 4.5:1 for AA.",
    body: "Body text",
    large: "Large text",
    ui: "Icons and borders (3:1)",
    pass: "pass",
    fail: "fail",
    apcaNote: "(WCAG 3 draft, for information)",
    suggestion: (hex: string, ratio: number) => `Closest color that reaches 4.5:1: ${hex} (${ratio}:1).`,
    noFix: "No color of this hue reaches 4.5:1 on this background. Pick a lighter or darker background.",
    use: "Use this color",
    cli: "Same check with the CLI",
  },
  export: {
    label: "Export",
    title: "Copy it into your project",
    sub: "Or generate it with one command.",
    tabs: "Export format",
    cli: "Same result with the CLI",
    tailwind: "Tailwind v4",
    css: "CSS variables",
    lightDark: "CSS light-dark()",
    shadcn: "shadcn/ui",
    tailwind3: "Tailwind v3",
    tokens: "Design tokens",
    scss: "Sass",
    ts: "TypeScript",
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
