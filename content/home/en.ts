import type { HomeContent } from "./types"

/**
 * Home copy (en), converted from the copywriter draft. Removed `TODO(Seya)` placeholders
 * stay as comments above their string. Questions whose answer was only a placeholder are
 * listed at the bottom instead of being rendered.
 */

export const home: HomeContent = {
  metaTitle: "Software and Automation for SMEs",
  metaDescription: "Weber Development builds custom software and automations for SMEs in Eastern Switzerland. Seya Weber, software development and project leadership, Bichwil SG.",
  intro: "Weber Development builds custom software and automations for SMEs in Eastern Switzerland. Behind it is Seya Weber, software development and project leadership from Bichwil SG. If Excel has become your database, a workflow costs manual effort every day, or a digitalisation project needs someone to lead it, this is the right place for a first call.",
  complement: "If Excel has become your database, a workflow costs manual effort every day, or a digitalisation project needs someone to lead it, this is the right place for a first call.",
  // TODO(Seya): confirm
  serviceArea: "On site in Wil, Uzwil, Gossau, St. Gallen and all of Eastern Switzerland, remote across Switzerland.",
  faq: [
    {
      q: "What does custom software cost for an SME?",
      // TODO(Seya): price range, e.g. an internal tool with login and one core function from CHF …, larger portals from CHF …, excl. VAT
      // TODO(Seya): hourly rate
      a: "It depends on the scope, which is why every project starts with a prototype and a written quote. Billing is either a fixed price with milestones or time and materials with a monthly report.",
    },
    {
      q: "Do you also work remotely?",
      // TODO(Seya): confirm whether travel within Eastern Switzerland is included
      a: "Yes. First call, interim reviews and training run over video if you prefer. On site in Eastern Switzerland, elsewhere in Switzerland by arrangement.",
    },
    {
      q: "What happens if you, as a single person, are unavailable?",
      // TODO(Seya): name a deputy or partner network, if one exists
      a: "Weber Development is a one-person business, and the safeguard is ordinary technology: widely used languages and frameworks, code and documentation in your possession, hosting on your own accounts. Any other developer can carry on.",
    },
  ],
  cta: {
    lead: "Write to me in three sentences about what is on your plate.",
    text: "I reply within 24 hours. info@sweber.dev or +41 79 899 11 12.",
  },
}

// OMITTED FAQ TODO(Seya): How quickly is a first prototype ready? -> confirm, e.g. 2 to 4 weeks
// OMITTED FAQ TODO(Seya): Who owns the software in the end? -> confirm contractual arrangement, e.g. "Source code, documentation and hosting accounts pass fully to you with the final payment."
