/** Text of the Derivative live demo (/derivative/demo). */
export const derivativeDemoCopy = {
  seoTitle: "Derivative live demo: self-hosted changelog and What's new widget",
  description:
    "Open the What's new widget in a demo app, switch language and theme, and paste your own CHANGELOG.md or git log to see the feed Derivative builds from it.",
  title: "Derivative",
  titleSub: "Live demo.",
  intro:
    "Everything on this page runs the real @sweberdev/derivative build in your browser: the widget in the made-up app below, and the parsers in the playground further down.",
  isolation:
    "Nothing you paste is sent anywhere. The widget remembers what you have seen in this browser's local storage only.",
  overview: "Derivative overview",
  docs: "Read the docs",
  jump: "On this page",
  jumpLinks: [
    { href: "#widget", label: "Widget" },
    { href: "#build", label: "Build" },
    { href: "#playground", label: "Playground" },
  ],

  widget: {
    label: "Widget",
    title: "What's new, in your app",
    sub: "Click the button.",
    lede: "Muster Ledger is a made-up bookkeeping app. The button in its header is <derivative-widget>, fed by the changelog.json built below. The badge counts releases you have not seen yet; opening the panel marks them as read.",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    accent: "Accent colour",
    types: "Entries",
    typesAll: "All types",
    typesUser: "New and fixed only",
    announce: "Announcement toast",
    announceNote: "Shows the newest titled release once, next to the button.",
    search: "Search field",
    searchNote: "Filters the releases as you type, across version, title and entries.",
    hint: "Your app goes here. The widget is one element and about 6 kB gzipped, with no requests other than the feed itself.",
    reset: "Show as new again",
    resetNote: "Forgets what you have seen, like a first visit.",
    loading: "Loading the widget",
    error: "The widget could not load in this browser.",
  },

  build: {
    label: "Build",
    title: "From changelog to feed",
    sub: "One command.",
    lede: "derivative build reads the CHANGELOG.md that Changesets already writes, adds the highlights from the config and writes a static changelog.json next to your app. Hashes, thank-you notes and dependency updates are left out.",
    command: "Build step",
    embed: "Embed",
  },

  playground: {
    label: "Playground",
    title: "Try your own changelog",
    sub: "Paste and watch.",
    lede: "Pick a format or paste your own. The same parsers as the CLI turn it into a feed, shown as JSON and in the inline mode of the widget.",
    source: "Format",
    sources: {
      changesets: "Changesets CHANGELOG.md",
      keepachangelog: "Keep a Changelog",
      commits: "Conventional commits (git log --oneline --decorate)",
    },
    input: "Input",
    unreleased: "Include unreleased changes",
    preview: "Widget, inline mode",
    output: "changelog.json",
    empty: "No releases found. Releases need a version heading, or for commits a version tag.",
    loading: "Loading the parsers",
    error: "The parsers could not load in this browser.",
  },

  closing: {
    label: "Next step",
    title: "Add it to your app",
    sub: "Free and MIT-licensed.",
    lede: "Install @sweberdev/derivative, add derivative build to your build script and drop the element into your header. React apps can use @sweberdev/derivative-react.",
    cta: "Getting started",
  },
}
