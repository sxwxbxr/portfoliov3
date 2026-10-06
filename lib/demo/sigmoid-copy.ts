// Copy of the Sigmoid live demo (/sigmoid/demo). Kept next to the demo so
// parallel package launches do not all edit lib/copy.ts.
export const sigmoidDemo = {
  seoTitle: "Sigmoid live demo: scroll-driven animations, springs and the S-curve",
  description:
    "Tune a spring and watch it turn into CSS linear(), scroll through ten reveal presets on native CSS scroll timelines, and compare them with the JavaScript fallback.",
  title: "Sigmoid",
  titleSub: "Live demo. Scroll, tune, compare.",
  overview: "Sigmoid overview",
  intro:
    "Everything on this page that moves while you scroll is driven by @sweberdev/sigmoid. In browsers with CSS scroll-driven animations the browser does the work, without a script per frame. The thin bar at the top of the window is a data-sigmoid attribute, nothing else.",
  jump: "Jump to",
  jumpLinks: [
    { href: "#curves", label: "Curves" },
    { href: "#reveal", label: "Reveal" },
    { href: "#parallax", label: "Parallax and scrub" },
    { href: "#numbers", label: "Numbers" },
    { href: "#story", label: "Scroll story" },
    { href: "#zero-js", label: "Zero JavaScript" },
  ],
  docs: "Read the docs",
  path: {
    label: "Your browser",
    native: "runs scroll timelines natively. No JavaScript per frame.",
    fallback: "has no scroll timelines yet. Sigmoid uses its JavaScript fallback, with the same result.",
    reduced: "Reduced motion is on: reveals and parallax are skipped and the content is shown as it is.",
  },
  curves: {
    label: "Curves",
    title: "Easing you can use in CSS.",
    sub: "Springs, the S-curve and Bézier curves as one object.",
    lede:
      "Pick a curve and move the sliders. Sigmoid solves the spring, samples it and keeps only the points that matter, so the curve fits into a short CSS linear() value. Press play to run it as a plain CSS transition.",
    kinds: { spring: "Spring", logistic: "S-curve", bezier: "Bézier" },
    kindLabel: "Curve",
    bounce: "Bounce",
    duration: "Duration",
    steepness: "Steepness",
    bezierPreset: "Preset",
    play: "Play",
    plotLabel: (name: string) => `Plot of the ${name} curve from 0 to 1`,
    stops: (n: number) => `${n} stops`,
    rest: (ms: number) => `at rest after ${ms} ms`,
    editorLink: "Open the curve editor",
    cssHeading: "CSS",
    jsHeading: "JavaScript",
  },
  reveal: {
    label: "Reveal",
    title: "Ten presets, one function.",
    sub: "Scroll down slowly and watch them arrive.",
    lede:
      "Each card is revealed with reveal() over the range entry 0% to cover 40%: the animation starts when the card enters the window and ends when it has covered 40% of its way through. Change the curve or force the JavaScript fallback to compare: both paths compute the same progress.",
    easing: "Curve",
    stagger: "Stagger (new in 0.2)",
    fallback: "Force JavaScript fallback",
    runningNative: "Running on a native view timeline",
    runningFallback: "Running on the JavaScript fallback",
    codeHeading: "The code for one card",
  },
  parallax: {
    label: "Parallax and scrub",
    title: "Depth without layout work.",
    sub: "Three layers, three distances, one transform each.",
    lede:
      "The squares move against the scroll by 20, 60 and 120 pixels while they cross the window. The ring is linked to the scroll position of the whole page with scrub(): it turns once from top to bottom.",
    codeHeading: "parallax() and scrub()",
  },
  track: {
    label: "Numbers",
    title: "Progress as a number.",
    sub: "New in 0.2: track() for what CSS cannot animate.",
    lede:
      "These counters are not animations. track() reports how far each card has travelled through the window, and a few lines of code turn that into a number. The same works for video frames, canvas drawings or a chart.",
    stats: [
      { value: 2400, unit: "bytes", label: "for reveal and init, min+gzip" },
      { value: 40, unit: "tests", label: "for the range maths, curves and React" },
      { value: 10, unit: "presets", label: "from fade-in to flip-up" },
    ],
    codeHeading: "track()",
  },
  story: {
    label: "Scroll story",
    title: "Pinned, in steps.",
    sub: "New in 0.3: story() for sections that stay while you scroll.",
    lede:
      "The figure below is pinned with position: sticky, plain CSS. story() splits the scroll through the section into three steps and reports the active one. It also sets data-sigmoid-step and --sigmoid-progress on the section, so CSS alone can react.",
    steps: [
      { title: "Pin with CSS", text: "position: sticky keeps the content in place. No scroll hijacking." },
      { title: "Count the steps", text: "story() maps the contain range of the section to step 0, 1 and 2." },
      { title: "React to them", text: "A callback, a React hook or a data attribute: pick what fits." },
    ],
    stepLabel: (i: number, n: number) => `Step ${i} of ${n}`,
    codeHeading: "story()",
  },
  zeroJs: {
    label: "Zero JavaScript",
    title: "Only an attribute.",
    sub: "Works in Server Components and plain HTML.",
    lede:
      "These lines are animated by sigmoid.css alone. Custom properties tune the range, the curve and the distance. In browsers without scroll timelines, one call to init() starts the fallback; elsewhere it does nothing.",
    lines: [
      "fade-up with the default curve",
      "slide-left with the bouncy spring",
      "blur-in over a longer range",
      "clip-up with the S-curve",
    ],
    codeHeading: "The markup of these lines",
  },
  closing: {
    label: "Get started",
    title: "MIT licensed.",
    sub: "Free for every project.",
    lede: "Install the package, add the stylesheet, and mark your first element. The docs cover the API, the curves, React and reduced motion.",
  },
}

/** Copy of the curve editor page (/sigmoid/curves). */
export const sigmoidCurves = {
  seoTitle: "Sigmoid curve editor: spring, S-curve and Bézier easing as CSS linear()",
  description:
    "Tune a spring, an S-curve or a Bézier easing, drag the handles, and copy it as CSS, Tailwind, JavaScript or for Motion and GSAP. Share the curve by link.",
  title: "Curve editor",
  titleSub: "Tune an easing. Copy it as CSS.",
  overview: "Sigmoid overview",
  intro:
    "Springs and S-curves cannot be written as a cubic-bezier(). Sigmoid solves them and turns them into a short CSS linear() value that runs natively in the browser. Pick a curve, tune it, and take the code with you. Every setting is in the address, so a curve is one link.",
  editor: {
    label: "Editor",
    title: "Move it until it feels right.",
    sub: "Spring, S-curve or Bézier.",
    lede: "Press play to run the curve as a plain CSS transition. For a Bézier curve, drag the two handles in the plot.",
  },
  kinds: { spring: "Spring", logistic: "S-curve", bezier: "Bézier" },
  kindLabel: "Curve",
  bounce: "Bounce",
  duration: "Duration",
  steepness: "Steepness",
  dragHint: "Drag the handles in the plot or use the sliders.",
  play: "Play",
  share: "Copy link",
  reset: "Reset",
  copy: "Copy",
  copied: "Copied",
  outputLabel: "Output format",
  plotLabel: (name: string) => `Plot of the ${name} curve from 0 to 1`,
  tabs: { css: "CSS", variable: "CSS variable", tailwind: "Tailwind v4", js: "JavaScript", libs: "Motion and GSAP" },
  closing: {
    label: "Get started",
    title: "The same curves in your code.",
    sub: "MIT licensed, free for every project.",
    lede: "Install the package and use the curve as a function, as CSS, with Motion or GSAP, or with the Tailwind theme.",
  },
  demo: "Open the live demo",
}
