/** Text of the Inverse live demo (/inverse/demo). */
export const inverseDemoCopy = {
  seoTitle: "Inverse live demo: Widerrufsbutton and Kündigungsbutton in a Next.js shop",
  description:
    "Withdraw from an order and cancel a subscription in a made-up shop, see the receipt e-mail and the stored record, check your own HTML for the buttons and work out deadlines.",
  title: "Inverse",
  titleSub: "Live demo.",
  intro:
    "Everything on this page runs the real @sweberdev/inverse and @sweberdev/inverse-react packages in your browser: the buttons and forms in the made-up shop, the handler that would run on your server, the page check and the deadline helpers.",
  isolation:
    "Nothing you enter leaves your browser. The handler runs locally here, so the e-mail is shown instead of sent.",
  overview: "Inverse overview",
  docs: "Read the docs",
  jump: "On this page",
  jumpLinks: [
    { href: "#shop", label: "Shop" },
    { href: "#check", label: "Page check" },
    { href: "#deadlines", label: "Deadlines" },
  ],

  shop: {
    label: "Shop",
    title: "Withdraw and cancel, end to end",
    sub: "Use the footer.",
    lede: "Muster Outdoor is a made-up shop that also sells a gear subscription. Its footer has the two links the law asks for. Follow one, fill in the form, confirm on the second step, and watch what your server and the customer's inbox get.",
    language: "Language",
    backToShop: "Back to the shop",
    inbox: "Customer's inbox",
    inboxEmpty: "The acknowledgement e-mail appears here after you confirm.",
    server: "What your server stores",
    serverEmpty: "onDeclaration(record) is called with this record.",
    endsNote: "The demo works out the end date with contractEndDate(): one month's notice, term until 31 December.",
    reset: "Start over",
  },

  check: {
    label: "Page check",
    title: "Is the button there?",
    sub: "Paste HTML.",
    lede: "The same rules as npx inverse check. Pick an example or paste the HTML of your own footer. Information links such as \"Widerrufsbelehrung\" don't count; similar wording is flagged.",
    examples: "Examples",
    input: "HTML",
    result: "Result",
    presets: {
      good: "Statutory labels",
      similar: "Similar wording",
      info: "Only information links",
      login: "Behind a login",
    },
    verdict: { pass: "Found", warn: "Check", fail: "Missing" },
    withdrawal: "Withdrawal button",
    cancellation: "Cancellation button",
  },

  deadlines: {
    label: "Deadlines",
    title: "When does it end?",
    sub: "Two helpers.",
    lede: "withdrawalDeadline() counts the 14 days from the day after delivery or contract and moves the end off weekends. contractEndDate() works out the end of a cancelled subscription from notice period and term.",
    delivered: "Delivered or concluded on",
    informed: "Customer was properly informed about the right of withdrawal",
    lastDay: "Last day to withdraw",
    received: "Cancellation received on",
    notice: "Notice period (months)",
    termEnd: "Current term ends on (optional)",
    endsOn: "Contract ends on",
  },

  closing: {
    label: "Next",
    title: "Add it to your app",
    sub: "Four steps.",
    lede: "Install the two packages, add the route, add the two pages and link them from your footer. The getting started guide walks through it for Next.js.",
    cta: "Getting started",
  },
}
