// Copy of the Cosine live demo (/cosine/demo). Kept out of lib/copy.ts so package threads do not collide.
export const cosineDemoCopy = {
  seoTitle: "Cosine live demo: semantic docs search in your browser",
  description:
    "Search the Cosine and Surjection documentation by meaning, entirely in your browser. Compare keyword search with Cosine's hybrid ranking and see what the Pro search insights report shows.",
  title: "Cosine",
  titleSub: "Live demo, free and Pro.",
  intro:
    "Everything below runs in your browser: the index of the Cosine and Surjection docs, keyword search, and, once you load it, the embedding model that searches by meaning. There is no search server.",
  isolation:
    "Your queries are not sent anywhere. Loading the model downloads about 23 MB from Hugging Face once; your browser caches it.",
  overview: "Cosine overview",
  docs: "Read the docs",
  pricing: "Cosine Pro",
  jump: "On this page",
  jumpLinks: [
    { href: "#search", label: "Search" },
    { href: "#compare", label: "Keyword vs. meaning" },
    { href: "#insights", label: "Insights" },
  ],

  search: {
    label: "Search",
    title: "The search field (free, MIT)",
    sub: "Try it, then load the model.",
    lede: "This is <cosine-search>, the web component from @sweberdev/cosine, on an index of 28 documentation pages. Keyword results appear on the first keystroke, and typos are forgiven: try “instalation” or “acessibility”. Load the model and the same field also finds sections that use other words than your query. Press / to focus it.",
    fieldLabel: "Search the Cosine and Surjection docs",
  },

  model: {
    load: "Load the model (about 23 MB)",
    loading: (done: number, total: number) =>
      total ? `Preparing the semantic index: ${done} of ${total} sections…` : "Downloading the model…",
    ready: "Semantic search is on. Results now combine keywords and meaning.",
    failed: "The model could not be loaded. Keyword search still works.",
    idle: "Keyword search only. Load the model to search by meaning.",
    note: "In a real site the section vectors are computed once at build time with `cosine build`. This demo computes them in your browser after the download, which takes a few seconds.",
  },

  compare: {
    label: "Compare",
    title: "Keyword vs. meaning",
    sub: "Same index, same query.",
    lede: "Pick a question or type your own. The left column is classic keyword search (BM25), as in most static-site search tools. The right column is Cosine's hybrid ranking: keywords and embeddings fused, so a question finds the section that answers it.",
    examplesLabel: "Example questions",
    examples: [
      "does my search data go to a third party",
      "ignore issues that already exist on a site",
      "search docs written in German",
      "make the search box match my brand colours",
      "which questions do visitors not find answers to",
    ],
    inputLabel: "Your question",
    keyword: "Keyword search",
    hybrid: "Cosine (hybrid)",
    needsModel: "Load the model above to see this column.",
    none: "Nothing found.",
    byLexical: "keywords",
    bySemantic: "meaning",
  },

  insights: {
    label: "Insights",
    title: "Search insights (Pro)",
    sub: "What your docs are missing.",
    lede: "@weber-development/cosine-insights records which searches find nothing and which results nobody opens, without cookies, ids or IP addresses, and turns them into a report. The example below was made from a month of made-up searches on a docs site.",
    command: "npx cosine-insights report --log data/searches.ndjson --out insights.html",
    frameTitle: "Example search insights report",
  },

  closing: {
    label: "Next",
    title: "Add it to your docs",
    sub: "Two commands and one tag.",
    lede: "Build the index with npx cosine build docs --out public/cosine, add <cosine-search index=\"/cosine/cosine-index.json\"> to your layout, done. Cosine Pro builds the index in every Vite build and adds search insights.",
    cta: "Getting started",
  },
}
