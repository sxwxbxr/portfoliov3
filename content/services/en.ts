import type { ServiceContent, ServiceLabels, ServicesOverviewContent } from "./types"

/**
 * English service copy, converted from the copywriter drafts.
 * Placeholders from the drafts are never rendered: each `TODO(Seya)` comment sits above the
 * string it was removed from. Fill the text in and delete the comment.
 * FAQ entries whose answer was only a placeholder are omitted and listed at the bottom.
 */

export const labels: ServiceLabels = {
  forWhom: "Who this is for",
  deliverables: "What is included",
  process: "How it works",
  pricing: "What it costs",
  references: "References",
  faq: "Frequently asked questions",
  updated: "Last updated",
  furtherReading: "Further reading",
  inGerman: "(in German)",
  overviewCrumb: "Services",
}

export const overview: ServicesOverviewContent = {
  slug: "services",
  updatedAt: "2026-10-12",
  metaTitle: "Services for SMEs",
  metaDescription: "Custom software, process automation with AI and digital project leadership for SMEs in Eastern Switzerland. Based in Bichwil SG. Reply within 24 hours.",
  h1: "Software, automation and project leadership for SMEs",
  lead: "Weber Development builds custom software and automations for SMEs in Eastern Switzerland and takes on project leadership when a digitalisation project needs someone accountable for it. Behind it is Seya Weber, software development and project management from Bichwil SG. The result is a tool that fits your workflow, rather than a workflow bent to fit the tool.",
  servicesHeading: "Three services",
  services: [
    {
      key: "custom-software",
      title: "Custom software and web applications",
      text: "Portals, dashboards and internal tools for when Excel or standard software no longer do the job. Built directly by the person who will later answer your questions, in TypeScript and React or C# and .NET.",
      linkLabel: "Custom software",
    },
    {
      key: "process-automation-ai",
      title: "Process automation and AI integration",
      text: "Automate recurring workflows and use language models where they replace manual work: answering enquiries, reading documents, moving data. With cost control and human approval for anything binding.",
      linkLabel: "Process automation and AI",
    },
    {
      key: "digital-project-leadership",
      title: "Digital project leadership on a mandate basis",
      text: "Gather requirements, tender and compare vendors, support the rollout. For owners and managers who have a project ahead of them but nobody to lead it.",
      linkLabel: "Digital project leadership",
    },
  ],
  startHeading: "How a project starts",
  start: [
    {
      step: "First call",
      // TODO(Seya): confirm
      text: "You describe the problem, I ask questions. About 30 to 45 minutes, by phone, video or on site in Eastern Switzerland. Free of charge.",
    },
    {
      step: "Quote",
      // TODO(Seya): e.g. one week
      text: "You receive a written quote with scope, stages, pricing model and a proposal for the first step. Prices excl. VAT.",
    },
    {
      step: "Kick-off",
      text: "A joint start with the people who will work with the result. From here on there are fixed dates for interim versions.",
    },
  ],
  // TODO(Seya): confirm
  serviceArea: "Service area: Wil, Uzwil, Gossau, St. Gallen and all of Eastern Switzerland on site, remote across Switzerland.",
  cta: {
    lead: "Write to me in three sentences about what is on your plate.",
    text: "I reply within 24 hours. info@sweber.dev or +41 79 899 11 12.",
  },
}

export const services: Record<ServiceContent["key"], ServiceContent> = {
  "custom-software": {
    key: "custom-software",
    slug: "custom-software",
    updatedAt: "2026-10-12",
    metaTitle: "Custom Software for SMEs",
    metaDescription: "Web applications, portals, dashboards and internal tools for SMEs in Eastern Switzerland. Built in Bichwil SG, with a clear quote and one person to talk to.",
    h1: "Custom software and web applications for SMEs",
    lead: "Weber Development builds web applications, portals, dashboards and internal tools for SMEs in Eastern Switzerland, for when off-the-shelf software or Excel no longer does the job. Everything is developed in Bichwil SG by Seya Weber, with no agency in between. You get a tool that follows your workflow, and one person to talk to who wrote the code.",
    forWhomIntro: "Businesses whose workflow currently runs on Excel, email and word of mouth. Typical situations:",
    forWhom: [
      "An Excel file has become the central database. Several people work in it, and nobody knows which version is right.",
      "Customers, members or property owners phone for information they could look up in a portal.",
      "Figures from two or three systems are copied by hand into a monthly overview.",
      "An older tool still runs, but nobody can change it, or the vendor is dropping it.",
      "Standard software covers most of the job; the rest costs time every day in workarounds.",
    ],
    // TODO(Seya): confirm target size, e.g. 5 to 100 employees
    forWhomNote: "Industries: manufacturing and trades, service businesses, property and condominium management, clubs and associations.",
    deliverables: [
      "Requirements gathering with the people who will use the tool daily, not only management",
      "Workflow sketch and a clickable prototype before any production code is written",
      "Development of the web application: TypeScript, React and Next.js for the interface, C# and .NET where an existing Windows environment calls for it, Postgres or SQL Server as the database",
      "Login, roles and permissions (who sees and edits what)",
      "Data import from Excel or the legacy system, checked for completeness",
      // TODO(Seya): name typical systems, e.g. accounting, ERP, Microsoft 365
      "Integration with existing systems via APIs",
      // TODO(Seya): name the standard hosting and data location
      "Hosting set-up and backups",
      "Documentation and onboarding for users",
      "Optional: maintenance and further development after launch",
    ],
    process: [
      {
        step: "First call",
        // TODO(Seya): confirm
        text: "You describe the workflow that causes trouble; I ask where time and errors are lost. About 30 to 45 minutes, free of charge.",
      },
      {
        step: "Requirements and quote",
        // TODO(Seya): confirm
        text: "One or two conversations with the users, then a written quote with scope, stages and price. Typically 1 to 2 weeks.",
      },
      {
        step: "Prototype",
        // TODO(Seya): confirm
        text: "A clickable version using your real terminology and sample data. Typically 2 to 4 weeks.",
      },
      {
        step: "Development in stages",
        // TODO(Seya): confirm cadence
        text: "Every two weeks a version you can try out; feedback flows straight into the next stage.",
      },
      {
        step: "Launch",
        text: "Data migration, training, go-live, support during the first weeks.",
      },
      {
        step: "Operation",
        text: "Maintenance agreement or handover to your IT, as you prefer.",
      },
    ],
    pricing: {
      intro: "Two models, depending on how clear the scope is:",
      items: [
        {
          title: "Fixed price",
          text: "with a defined scope and milestones. Fits once the prototype has settled what will be built; you know the price before the start.",
        },
        {
          title: "Time and materials",
          text: "with a monthly report. Fits when the scope is deliberately left open or grows over time.",
        },
      ],
      // TODO(Seya): price range, e.g. from CHF … for an internal tool, hourly rate CHF …, prices excl. VAT
      // TODO(Seya): order of magnitude per month
      note: "Running costs for hosting and maintenance are listed separately.",
    },
    references: [
      {
        slug: "stweg-roessliwiese",
        name: "STWEG Roessliwiese",
        text: "Self-initiated project for the Rössliwiese condominium owners' association in Bichwil: a public website plus a secure owner portal with document storage, news, events and role-based administration, login via email allowlist, deployed in the EU region.",
      },
      {
        slug: "webguide",
        name: "WebGuide",
        text: "Self-initiated bilingual knowledge platform with a searchable wiki and a built-in ticket system (attachments, email routing, spam protection) that turns repeated one-to-one PC help into self-service.",
      },
    ],
    faq: [
      {
        q: "Is custom software worth it for a small company at all?",
        a: "If a workflow costs time every day or regularly produces errors, usually yes. The maths is simple: hours per week lost to Excel, retyping and follow-ups, times hourly cost, against the quote. We work that out together in the first call. If the numbers speak against a custom build, I say so and recommend a standard product.",
      },
      {
        q: "What happens if you are unavailable or close the business?",
        // TODO(Seya): name a deputy or partner network for emergencies, if one exists
        a: "A fair question for a one-person business. The protection is ordinary technology: widely used languages and frameworks (TypeScript, React, .NET, SQL), code and documentation in your possession, hosting on your own accounts.",
      },
      {
        q: "Can we start with a small part?",
        a: "Yes, that is the usual route. The prototype covers the one workflow that disrupts daily work most; once it proves itself, the next step follows. The first investment stays manageable.",
      },
      {
        q: "How much time do we need to put in ourselves?",
        // TODO(Seya): confirm typical client-side effort, e.g. 2 to 4 hours per week in the initial phase
        a: "Most of it at the start: conversations with the users and feedback on the prototype. After that, a short meeting every two weeks and testing the interim versions.",
      },
    ],
    cta: {
      lead: "Describe the workflow that eats the most time.",
      text: "I reply within 24 hours with a first assessment of whether a custom build makes sense. info@sweber.dev or +41 79 899 11 12.",
    },
  },
  "process-automation-ai": {
    key: "process-automation-ai",
    slug: "process-automation-ai",
    updatedAt: "2026-10-12",
    metaTitle: "Process Automation & AI for SMEs",
    metaDescription: "Automate workflows, integrate chatbots and language models into existing software. For SMEs in Eastern Switzerland, with cost control and a measurable result.",
    h1: "Process automation and AI integration for SMEs",
    lead: "Weber Development automates recurring workflows in SMEs and integrates language models (LLMs) where they replace manual work: answering enquiries, reading documents, moving data between systems. The yardstick is not whether something contains AI, but whether less gets retyped, chased and copied afterwards. Developed in Bichwil SG by Seya Weber, with experience from a chatbot platform in production and multi-stage AI pipelines.",
    forWhomIntro: "Businesses where the same work is repeated by hand every day. Typical situations:",
    forWhom: [
      "Similar enquiries arrive daily by email or WhatsApp, and 80 percent of the answers are the same.",
      "Quotes, reports or orders arrive as PDFs and are retyped into the ERP or accounting system.",
      "Two systems have no interface, so data is entered twice.",
      "An AI chatbot was tried out and now produces high API bills or wrong answers.",
      "An existing automation in Zapier, Make or Power Automate has hit its limits, and nobody knows exactly what it does.",
    ],
    // TODO(Seya): confirm target size
    forWhomNote: "Industries: manufacturing and service, retail and wholesale, practices and clinics, administration.",
    deliverables: [
      "Process analysis: which steps, how often, by whom, with which exceptions",
      "Assessment per step: fixed rule or language model, and what pays off relative to the effort",
      "Workflow automation: APIs, background jobs, scripts, connections to email, ERP, CRM or accounting",
      "Chatbots for customer enquiries on your website or WhatsApp, connected to your own data",
      "LLM integration into existing software: classification, extracting data from documents, summarising, drafting replies",
      "Cost control: model choice per task, caching, limits, monitoring of API spend",
      "Quality assurance: test cases from real examples, human approval for anything that reaches customers or moves money",
      // TODO(Seya): name providers used and data locations
      "Data protection: which data may leave the building and which may not, with providers chosen accordingly",
      "Documentation, handover, operation",
    ],
    process: [
      {
        step: "First call",
        // TODO(Seya): confirm
        text: "You show the workflow that annoys you most, ideally on screen. About 30 to 45 minutes, free of charge.",
      },
      {
        step: "Process analysis and feasibility",
        // TODO(Seya): confirm
        text: "I watch, count and test with real examples whether a rule is enough or a language model is needed. Typically 1 to 2 weeks.",
      },
      {
        step: "Pilot on one process",
        // TODO(Seya): confirm
        text: "The automation runs alongside the current way of working, and the results are compared. Typically 2 to 6 weeks.",
      },
      {
        step: "Measure and roll out",
        text: "When accuracy and cost are right, the pilot becomes the default and the next process follows.",
      },
      {
        step: "Operation",
        text: "Monitoring of cost and error cases, adjustments when the process changes.",
      },
    ],
    pricing: {
      items: [
        {
          title: "Pilot at a fixed price",
          // TODO(Seya): price range, e.g. from CHF …, excl. VAT
          text: "for one clearly bounded process.",
        },
        {
          title: "Further development on a time-and-materials basis",
          // TODO(Seya): hourly rate / retainer range
          text: "or as a monthly retainer when several processes follow.",
        },
        {
          title: "Ongoing API costs",
          text: "of the language-model providers run on your own account without mark-up. Before the pilot you get a monthly estimate based on your volume.",
        },
      ],
    },
    references: [
      {
        slug: "flowlychat",
        name: "FlowlyChat",
        text: "Multi-tenant WhatsApp chatbot platform for SchulzMedia GmbH (since 2025) with Swiss German support, RAG via Cloudflare Vectorize and a four-stage abuse-protection system; around 65 % lower LLM costs through model routing across several Claude tiers.",
      },
      {
        slug: "everyday-explainer",
        name: "Everyday Explainer",
        text: "Self-initiated, self-improving AI pipeline for short-form YouTube explainers, in which specialised Claude Code subagents write scripts, fact-check claims through web research, review quality and learn from analytics.",
      },
      {
        slug: "webguide",
        name: "WebGuide",
        text: "Support platform in which Workers AI classifies incoming tickets and drafts articles, embedded in a ticket system with email routing.",
      },
    ],
    faq: [
      {
        q: "Do we need AI at all, or is ordinary automation enough?",
        a: "Often a rule is enough. If the workflow is always the same (file arrives, values are transferred, email goes out), fixed automation is cheaper, faster and never wrong. A language model pays off when inputs vary: free text, different PDF layouts, customer questions in their own words. The process analysis decides this step by step.",
      },
      {
        q: "What happens to our data when a language model processes it?",
        // TODO(Seya): standard provider, data location, and whether a data processing agreement is in place
        a: "That is settled before the pilot, not afterwards. Personal data and trade secrets can be masked before processing, or the step runs through a provider with a suitable data location and contract.",
      },
      {
        q: "What does running a chatbot cost per month?",
        // TODO(Seya): order of magnitude from FlowlyChat experience, e.g. CHF … per 1,000 conversations
        a: "It depends on volume: number of conversations, their length, the chosen model. Before the pilot you get an estimate based on your current enquiry numbers, and in operation limits are set so there is no surprise on the bill.",
      },
      {
        q: "How do you stop the chatbot from talking nonsense?",
        a: "Three ways. The bot answers only from the data you have provided and otherwise says it does not know. Anything binding (prices, appointments, commitments) goes to a person or a fixed system rather than to the model. And before launch it is tested with real enquiries from your inbox, not invented ones.",
      },
      {
        q: "What if our process changes?",
        a: "Rules and templates can be adjusted without starting over. Small changes go through maintenance, larger ones as a stage. If the process changes fundamentally every few weeks, automation is not yet the right step, and I will say so.",
      },
    ],
    cta: {
      lead: "Show me the workflow that costs manual effort every day.",
      text: "I reply within 24 hours with a first assessment of whether a rule, a language model or both is the right fit. info@sweber.dev or +41 79 899 11 12.",
    },
  },
  "digital-project-leadership": {
    key: "digital-project-leadership",
    slug: "digital-project-leadership",
    updatedAt: "2026-10-12",
    metaTitle: "Digital Project Leadership",
    metaDescription: "External project leadership for digitalisation projects in SMEs: requirements, tendering, rollout support. Eastern Switzerland, remote across Switzerland.",
    h1: "Digital project leadership on a mandate basis",
    // TODO(Seya): confirm wording of employment experience, without naming employers
    lead: "Weber Development takes on the project leadership for digitalisation projects in SMEs that nobody in-house can or should run: from requirements gathering through tendering and vendor selection to supporting the implementation. You keep the decisions; the project lead provides structure, deadlines and the translation between your departments and the vendor. Behind the mandate is Seya Weber, Bichwil SG, with experience as project lead for software and digitalisation in industry.",
    forWhomIntro: "Owners and managers who have a digitalisation project ahead of them but no one to lead it. Typical situations:",
    forWhom: [
      "An ERP, CRM or industry-software rollout is coming up. Management has no time for it, and IT is outsourced.",
      "Three quotes are on the table and cannot be compared, because each one contains something different.",
      "The project is already running, the deadline has slipped for the second time, and nobody has the full picture.",
      "Old software has to be replaced, and 15 years of data have to come along.",
      "The vendor talks technology, the department talks daily work, and something gets lost between them every week.",
    ],
    // TODO(Seya): confirm target size
    forWhomNote: "Industries: manufacturing, trade, healthcare, administration and services. Company size: SMEs without an in-house IT project lead.",
    deliverables: [
      "Current-state analysis: interviews with key people, process map, list of pain points",
      "Weighted requirements catalogue (must, should, could) as the basis for quotes",
      "Tendering: vendor shortlist, structured quote comparison, reference calls, preparation of contract negotiations",
      "Project plan with milestones, budget control and decision papers for management",
      "Vendor management: acceptance tests, test coordination, defect lists, escalation",
      "Risk management: staged rollout, data migration with completeness checks and a rollback plan",
      "Rollout: key users, training plan, communication to staff",
      "Reporting to management at a fixed rhythm, at the length that suits the leadership level",
      "Handover to regular operation with documentation and an open-items list",
    ],
    process: [
      {
        step: "First call",
        // TODO(Seya): confirm
        text: "You describe the project and where it stands. About 45 minutes, free of charge.",
      },
      {
        step: "Assessment",
        // TODO(Seya): confirm
        text: "Interviews, process analysis, risk picture, recommendation on how to proceed in a short report. Typically 2 to 4 weeks.",
      },
      {
        step: "Requirements and tendering",
        // TODO(Seya): confirm
        text: "Requirements catalogue, vendor selection, quote comparison, decision. Typically 4 to 8 weeks.",
      },
      {
        step: "Implementation support",
        // TODO(Seya): confirm
        text: "Steering the vendor over the duration of the rollout at an agreed workload, typically 1 to 2 days per week.",
      },
      {
        step: "Rollout and close",
        text: "Go-live, stabilisation, handover to operations, final report.",
      },
    ],
    processNote: "Joining a project that is already running is possible; the assessment then becomes a stocktake.",
    pricing: {
      items: [
        {
          title: "Assessment at a fixed price",
          // TODO(Seya): price range, e.g. CHF …, excl. VAT
          text: ", so the entry point is predictable.",
        },
        {
          title: "Mandate on a time basis",
          // TODO(Seya): day rate or hourly rate, excl. VAT
          text: "with an agreed workload and monthly report.",
        },
        {
          title: "Retainer",
          // TODO(Seya): retainer range
          text: "for longer projects with a steady workload.",
        },
      ],
      // TODO(Seya): confirm
      note: "Travel time and expenses are not included and are charged separately.",
    },
    references: [
      {
        slug: "flowlychat",
        name: "FlowlyChat",
        text: "Client project for SchulzMedia GmbH (since 2025): multi-tenant chatbot platform with architecture decisions on cost, tenant isolation and abuse protection, including cost tracking via Cloudflare AI Gateway.",
      },
      {
        slug: "stweg-roessliwiese",
        name: "STWEG Roessliwiese",
        text: "Portal for a condominium owners' association in Bichwil, from the requirement \"one central, protected place for documents, news and appointments\" through to operation in the EU region.",
      },
    ],
    referencesNote: "There is no public case study for project leadership on a mandate basis yet. The following projects show the delivery side that informs the assessment of quotes, architectures and vendors.",
    faq: [
      {
        q: "Are you neutral towards vendors?",
        // TODO(Seya): confirm
        a: "Yes. Weber Development sells no licences and has no reseller agreements with software vendors. The recommendation follows your requirements catalogue, and the quote comparison is laid out in the open.",
      },
      {
        q: "How is this different from consulting?",
        a: "Consulting ends with a report. A mandate ends when the software is running. The project lead carries responsibility for deadlines, acceptance tests and escalations over the whole duration, and sits on your side of the table in meetings with the vendor.",
      },
      {
        q: "How much of our time does this take?",
        // TODO(Seya): confirm typical client-side effort
        a: "Decisions stay with you, so it needs one person from management with about an hour every two weeks for decisions, plus, depending on the phase, specialists for interviews and testing.",
      },
      {
        q: "Can you also build it yourselves instead of just leading?",
        a: "Yes, and that is the difference from a pure project-management role: a development background in .NET and TypeScript makes it possible to judge quotes technically and settle interface questions directly. Within a mandate, though, the role is fixed in advance. Either project leadership with a neutral view of the vendor, or implementation. Mixing both blurs the interests.",
      },
      {
        q: "What if the project is already running and stuck?",
        // TODO(Seya): confirm
        a: "Then the mandate starts with a stocktake of two to three weeks: what was agreed, what was delivered, where it is stuck. The result is a cleaned-up plan that vendor and management sign off together.",
      },
      {
        q: "Do you work with international vendors?",
        a: "Yes, in English. German is the native language, English is at C1 level. Project meetings and documentation in English are no problem.",
      },
    ],
    cta: {
      lead: "Describe the project in three sentences.",
      text: "I reply within 24 hours with a first assessment of whether an assessment phase is the right entry point. info@sweber.dev or +41 79 899 11 12.",
    },
  },
}

// OMITTED FAQ (custom-software.en.md) TODO(Seya): Who owns the code in the end? -> confirm contractual arrangement, e.g. "The source code passes fully to you with the final payment, including repository access and documentation."
// OMITTED FAQ (custom-software.en.md) TODO(Seya): Where is our data stored? -> name the standard hosting and data location, e.g. Switzerland or EU, and whether Swiss hosting is available on request
// OMITTED FAQ (process-automation-ai.en.md) TODO(Seya): Which providers and models do you use? -> name the LLM providers and automation platforms used
// OMITTED REFERENCE (digital-project-leadership.en.md) TODO(Seya): confirm and approve, without naming employers; otherwise remove
