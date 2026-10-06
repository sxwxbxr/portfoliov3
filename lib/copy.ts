/**
 * UI chrome strings.
 *
 * Everything a component renders that does NOT come from the database lives
 * here: labels, buttons, section eyebrows, empty states, validation messages.
 * Database content (project titles, descriptions, skill names, site settings)
 * is authored in /admin and is never duplicated here.
 *
 * ## Why a file instead of inline JSX
 *
 * The site currently ships English only, matching the database content, the
 * metadata and the JSON-LD. A German edition is wanted later. Centralising the
 * strings now means that edition costs a second object and a locale switch,
 * rather than a pass over every component.
 *
 * ## Adding German later
 *
 * 1. Copy this file to `lib/copy.de.ts`, translate the values, keep the keys.
 * 2. Type it against `Copy` so a missing key is a compile error, not a blank.
 * 3. Replace the `copy` export with a resolver that picks by locale.
 *
 * Components must import `copy` and never inline a user-visible string, so
 * step 3 stays a one-file change.
 *
 * ## Rules for values here
 *
 * - Counted strings are functions, because plural rules differ per language.
 *   Never concatenate a count onto a fixed noun at the call site.
 * - No punctuation-only glue (" · ", " — "); build those in the helper so a
 *   translation can reorder the parts.
 */

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const copy = {
  nav: {
    work: "Work",
    about: "About",
    services: "Services",
    contact: "Contact",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    colorScheme: "Colour scheme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    brand: "seya weber",
    menu: "Menu",
    navigationLabel: "Navigation",
    mainNavigation: "Main navigation",
    footerLabel: "Footer",
    projects: "Projects",
    caseStudies: "Case Studies",
    experience: "Experience",
    career: "Career",
    education: "Education",
    skills: "Skills",
    blog: "Blog",
    releaseNotes: "Release notes",
    connect: "Connect",
    privacy: "Privacy",
    imprint: "Imprint",
    packages: "Packages",
    physio: "Physio Tools",
    login: "Login",
    github: "GitHub",
    linkedin: "LinkedIn",
  },

  common: {
    scroll: "Scroll",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    loading: "Loading…",
    back: "Back",
    current: "Current",
    recommended: "Recommended",
    /** Shown when site_settings has no location on record. */
    locationFallback: "St. Gallen, Switzerland",
    /** Locale for every date the UI formats itself. */
    dateLocale: "en-GB",
    /** Wall clock in Seya's timezone, e.g. "14:05 CET". */
    localTime: (time: string) => `${time} CET`,
    footerCtaTitle: "Let's work together.",
    footerCtaAction: "Start a project",
    copyright: (year: number) => `© ${year} Seya Weber`,
    /** Keyboard/screen-reader skip link, first focusable element on every page. */
    skipToContent: "Skip to main content",
    /** Link back to /about from /experience and /education. */
    moreAboutMe: "More about me",
    /**
     * The hand-written expertise summary. The homepage always renders it; /about
     * renders it only while the skills table is empty. One array, because two
     * copies of the same list drifted apart once already.
     */
    expertiseAreas: [
      {
        category: "Development",
        skills: [
          "C#",
          ".NET",
          "TypeScript",
          "React",
          "Next.js",
          "SQL",
          "REST APIs",
          "Python",
        ],
      },
      {
        category: "Project Management",
        skills: [
          "Agile / Scrum",
          "Stakeholder Management",
          "Requirements Engineering",
          "Risk Management",
        ],
      },
      {
        category: "Tools & Platforms",
        skills: ["Azure DevOps", "Git", "Docker", "Vercel", "Jira", "Supabase"],
      },
    ],
  },

  /**
   * The entry splash. It holds the frame until the fonts, the page load and the
   * hero renderer have settled, so `label` describes real work rather than a
   * decorative wait.
   */
  coldStart: {
    label: "Calibrating",
    ready: "Ready",
  },

  home: {
    availabilityFallback: "Available for projects",
    roleFallback: "Project Manager & Software Developer",
    introEyebrow: "In short",
    introLead:
      "I turn complex operational requirements into lean, maintainable software — and because I trained on both sides, I understand the requirement as well as the system that has to satisfy it.",
    introBody:
      "My path ran through electrical planning, energy optimisation, healthcare technology and SaaS development. That breadth is why I usually end up doing the translation work between the business side and the engineering side.",
    locationLead: (location: string) =>
      `I build lean digital solutions in ${location} — from automation workflows to full-stack applications.`,
    currentRole: (role: string, company: string) => `Current · ${role} at ${company}`,
    selectedWork: "Selected Work",
    selectedWorkEyebrow: "Selected work",
    expertise: "Expertise",
    expertiseEyebrow: (n: number) => `Expertise · ${n} ${plural(n, "area", "areas")}`,
    experience: "Experience",
    experienceEyebrow: (n: number, since?: number) =>
      `Career · ${n} ${plural(n, "station", "stations")}${since ? ` · since ${since}` : ""}`,
    fullCareer: "Full career",
    testimonialEyebrow: "Reference",
    testimonials: "What partners say",
    readCaseStudy: "Read case study",
    writing: "Writing",
    metricProjects: "Projects delivered",
    metricEmployers: "Employers",
    metricSince: "in the field",
    metricSinceValue: (year: number) => `since ${year}`,
    /** Screen-reader heading for the intro block, which is visually untitled. */
    introHeading: "Introduction",
    selectedWorkEyebrowCount: (n: number) =>
      `Selected work · ${n} ${plural(n, "project", "projects")}`,
    writingEyebrow: (n: number) => `Writing · ${n}`,
    /** Two-tone lines between the hero rulers. */
    heroTaglineLead: "Requirements in,",
    heroTaglineSub: "software out",
    introLabel: "In short",
    introTitle: "Both sides of the table",
    introSub: "the requirement and the system",
    workLabel: "Work",
    workTitle: "Selected projects",
    workSub: "across healthcare, energy and SaaS",
    expertiseLabel: "Expertise",
    expertiseTitle: "What I work with",
    expertiseSub: "from the plan to the pull request",
    careerLabel: "Career",
    careerTitle: "Stations so far",
    careerSub: (since?: number) => (since ? `in the field since ${since}` : "and counting"),
    referenceLabel: "Reference",
    referenceSub: "in their own words",
    writingLabel: "Writing",
    writingTitle: "Notes from the work",
    writingSub: "on delivery and engineering",
    ctaEyebrow: "From idea to delivery",
    ctaTitle: "Have a project in mind?",
    ctaButton: "Get in touch",
  },

  /** Strip above the navigation. */
  announcement: {
    text: "Introducing packages.sweber.dev",
  },

  projects: {
    label: (n: number) => (n > 0 ? `${n} ${plural(n, "project", "projects")}` : "Work"),
    title: "Projects",
    subtitle: "A selection across healthcare, energy, SaaS and developer tools.",
    empty: "No projects yet.",
    viewCaseStudies: "View case studies",
    backToProjects: "Back to projects",
    viewLive: "View live",
    sourceCode: "Source code",
    challengeEyebrow: "Starting point",
    challenge: "The Challenge",
    solutionEyebrow: "Approach",
    solution: "The Solution",
    resultsEyebrow: (n: number) => `Results · ${n}`,
    results: "Results",
    technologies: "Technologies",
    builtWith: "Built with",
    builtWithSub: "the stack behind it",
    nextProject: "Next project",
    allProjects: "All projects",
    /** Tile meta line: the index, plus the first tag when the project has one. */
    itemMeta: (index: string, category: string) =>
      category ? `${index} · ${category}` : index,
  },

  /** /blog and /blog/[slug]. Behind BLOG_ENABLED, but the chrome is real. */
  blog: {
    label: (n: number) => `${n} ${plural(n, "article", "articles")}`,
    title: "Writing",
    subtitle:
      "Notes on software development, project delivery and digital transformation.",
    empty: "No articles published yet.",
    externalLabel: "Packages",
    allArticles: "All articles",
    previousArticle: "Previous article",
    nextArticle: "Next article",
    taggedEyebrow: (n: number) => `Tagged · ${n}`,
    writtenBy: "Written by",
  },

  /** /case-studies and /case-studies/[slug]. Behind CASE_STUDIES_ENABLED. */
  caseStudies: {
    label: (n: number) => `${n} ${plural(n, "case study", "case studies")}`,
    title: "Case Studies",
    subtitle:
      "Real projects, solved problems and measurable outcomes across industries.",
    empty: "No case studies yet.",
    allCaseStudies: "All case studies",
    nextCaseStudy: "Next case study",
    /** Wider than the projects page's "Technologies" — this list includes tools. */
    technologies: "Technologies & Tools",
    builtWith: "Built with",
    builtWithSub: "the stack behind it",
  },

  experience: {
    label: (n: number, since?: number) =>
      n === 0
        ? "Career"
        : `${n} ${plural(n, "station", "stations")}${since ? ` · since ${since}` : ""}`,
    title: "Experience",
    subtitle: "My route through software development, project management and engineering.",
    empty: "No stations yet.",
  },

  about: {
    label: "About me",
    title: "About",
    subtitle:
      "Project manager, developer and builder of lean digital solutions in St. Gallen.",
    factLocation: "Location",
    factExperience: "Experience",
    factFocus: "Focus",
    factLanguages: "Languages",
    expertise: "Expertise",
    expertiseSub: "What I work with, grouped by area.",
    educationSub: "Formal training and the stations along the way.",
    expertiseEyebrow: (n: number) => `Expertise · ${n} ${plural(n, "area", "areas")}`,
    skills: "Skills",
    skillsEyebrow: (groups: number, total: number) =>
      `${groups} ${plural(groups, "category", "categories")} · ${total} ${plural(total, "skill", "skills")}`,
    skillsEmpty: "Skills are maintained in the admin and will appear here by category.",
    career: "Career",
    education: "Education",
    educationEyebrow: (n: number) => `Education · ${n} ${plural(n, "station", "stations")}`,
    ctaTitle: "Want to work together?",
    ctaBody: "I'm open to new projects and collaborations.",
    getInTouch: "Get in touch",
    // `downloadCv` used to live here. The download was removed on purpose — a CV
    // should be requested rather than left on a public URL. The replacement is
    // an opt-in checkbox on the contact form, specified in docs/CV_DELIVERY.md
    // and not yet built; its strings belong under `contact.form` when it is.
    portraitAlt: "Seya Weber, project manager and software developer",
    factLocationValue: "St. Gallen, CH",
    factExperienceValue: "3+ years",
    factFocusValue: "Automation & PM",
    factLanguagesValue: "DE, EN, FR",
    bio: [
      "I'm project manager for software and digitalisation at Telsonic, where I build bespoke automation workflows inside business-critical systems. Alongside that I run Weber Development, writing tailored software for a range of companies.",
      "With a dual background in software development and electrical planning, I translate complex operational requirements into clear specifications, lean processes and maintainable solutions. My path ran through electrical planning, energy optimisation for a Swiss banking portfolio, healthcare data migration, and now industrial automation and SaaS product development.",
      "I build solutions that do not only solve the immediate problem but grow with the business. Because I both develop and lead projects, I can translate between technical delivery and operational goals.",
    ],
    uncategorised: "Uncategorised",
    skillDetailLoading: "Loading details…",
    skillDetailFallback:
      "Used in various projects — see the Projects page for details.",
  },

  services: {
    label: "Services",
    title: "Services",
    subtitle:
      "Complex initiatives from idea to impact — with the right mix of strategy and execution.",
    packageEyebrow: (n: number) => `Package ${String(n).padStart(2, "0")}`,
    enquire: "Enquire",
    modelsEyebrow: (n: number) => `Engagement · ${n} ${plural(n, "model", "models")}`,
    models: "Engagement models",
    modelsSub: "Three ways to work together.",
    ctaTitle: "Does one of these fit?",
    ctaBody: "Tell me briefly what it's about — I'll reply within 24 hours.",
    startConversation: "Start a conversation",
    /**
     * Hard-coded page content, not database rows — the services page has no
     * admin surface. Structure is title / description / outcomes.
     */
    packages: [
      {
        title: "Delivery Leadership",
        description:
          "Interim project leadership for digitalisation programmes, complex migrations and automation initiatives.",
        outcomes: [
          "Clear scope, roadmap and stakeholder alignment",
          "Risk and dependency management across teams",
          "A reporting rhythm that fits the leadership level",
        ],
      },
      {
        title: "Solution Acceleration",
        description:
          "Hands-on delivery: validated concepts become production-ready tools and workflows.",
        outcomes: [
          "Fast proofs of concept and MVP builds",
          "Documentation and training for a clean handover",
          "QA support and instrumentation for continuous improvement",
        ],
      },
      {
        title: "Process & Product Coaching",
        description:
          "Support for teams adopting agile practices, sharpening product discovery and improving their delivery rituals.",
        outcomes: [
          "Discovery and delivery frameworks your team can run itself",
          "Templates, checklists and playbooks for repeatability",
          "Embedded coaching that makes new habits stick",
        ],
      },
    ],
    engagementModels: [
      {
        title: "Project-based",
        description: "Fixed scope with defined milestones and deliverables.",
        recommended: false,
      },
      {
        title: "Retainer",
        description:
          "Ongoing advice and delivery for teams that want a strategic partner on call.",
        recommended: true,
      },
      {
        title: "Workshops",
        description:
          "Focused sessions to unblock decisions, facilitate discovery or enable the internal team.",
        recommended: false,
      },
    ],
  },

  contact: {
    label: "Contact",
    title: "Get in touch",
    subtitle:
      "A project in mind, or a role to fill? Write to me — I reply within 24 hours.",
    email: "Email",
    phone: "Phone",
    location: "Location",
    responseTime: "Response time",
    responseValue: "Within 24 hours",
    form: {
      name: "Name *",
      namePlaceholder: "Your full name",
      email: "Email *",
      emailPlaceholder: "your.mail@example.com",
      company: "Company",
      companyPlaceholder: "Optional",
      projectType: "Project type *",
      projectTypePlaceholder: "Select a project type",
      budget: "Budget range",
      budgetPlaceholder: "Select a range",
      timeline: "Timeline",
      timelinePlaceholder: "When does it need to be done?",
      /**
       * Select options. `value` is the wire format the contact API stores and
       * mails out — only `label` is translatable, the values must stay stable.
       */
      projectTypeOptions: [
        { value: "automation", label: "Process automation" },
        { value: "web-development", label: "Web development" },
        { value: "data-integration", label: "Data integration" },
        { value: "consulting", label: "Technical consulting" },
        { value: "other", label: "Other" },
      ],
      budgetOptions: [
        { value: "under-10k", label: "< CHF 10’000" },
        { value: "10k-25k", label: "CHF 10’000 – 25’000" },
        { value: "25k-50k", label: "CHF 25’000 – 50’000" },
        { value: "50k-plus", label: "CHF 50’000+" },
        { value: "discuss", label: "Let's discuss" },
      ],
      timelineOptions: [
        { value: "asap", label: "As soon as possible" },
        { value: "1-month", label: "Within a month" },
        { value: "3-months", label: "Within 3 months" },
        { value: "6-months", label: "Within 6 months" },
        { value: "flexible", label: "Flexible" },
      ],
      message: "Message *",
      messagePlaceholder:
        "Tell me about your project, the goals and any concrete requirements…",
      submit: "Send message",
      submitting: "Sending…",
      analysisTitle: "AI match analysis",
      /** Screen-reader status while the match analysis is being written. */
      analysisLoading: "Running analysis…",
      /** Character counter under the message field. */
      messageCount: (n: number, max: number) => `${n}/${max}`,
      privacyLead:
        "By submitting you agree to your data being processed to answer your enquiry.",
      privacyLink: "privacy notice",
      privacyTail: "Details in the",
      successTitle: "Message sent",
      successBody: "Thanks for reaching out. I'll get back to you within 24 hours.",
      errors: {
        nameRequired: "Name is required",
        nameShort: "Name must be at least 2 characters",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address",
        projectTypeRequired: "Please select a project type",
        messageRequired: "Message is required",
        messageShort: "Message must be at least 10 characters",
        sendFailed: "Message could not be sent.",
        generic: "Something went wrong. Email me directly at info@sweber.dev.",
      },
    },
  },

  // /career merges what used to be /experience and /education. In the Swiss
  // apprenticeship model the two run concurrently, so splitting them left the
  // work page showing gaps where a full-time school year actually sat.
  career: {
    label: (work: number, education: number) => {
      const parts: string[] = []
      if (work > 0) parts.push(`${work} ${plural(work, "role", "roles")}`)
      if (education > 0)
        parts.push(
          `${education} ${plural(education, "qualification", "qualifications")}`
        )
      return parts.length > 0 ? parts.join(" · ") : "Career"
    },
    title: "Career",
    subtitle:
      "Work and education side by side. Through both apprenticeships they ran at the same time, which is why they belong on one axis rather than on two pages.",
    timelineEyebrow: (from: number, to: number) => `Timeline · ${from}–${to}`,
    timelineTitle: "The whole path",
    timelineSub: "Work and education on one axis.",
    timelineHint:
      "Hover or focus a bar to highlight its entry, and select one to jump to it.",
    timelineLabel: (from: number, to: number) =>
      `Career timeline from ${from} to ${to}, in two lanes: work and education`,
    barLabel: (title: string, subtitle: string, period: string) =>
      subtitle ? `${title} — ${subtitle}, ${period}` : `${title}, ${period}`,
    laneWork: "Work",
    laneEducation: "Education",
    planned: "Planned",
    empty: "Nothing here yet.",
    emptyTitle: "The career timeline is still being filled in.",
    emptyBody:
      "Roles and qualifications are maintained in the admin and will appear here on one axis.",
  },

  education: {
    title: "Education",
    subtitle: "My academic route — and the certificates that mark the way forward.",
    academicBackground: "Academic background",
    credentials: "Credentials & roadmap",
    credentialsSub: "What is done, what is running and what is next.",
    empty: "Nothing here yet.",
    label: (stations: number, certificates: number) => {
      const parts: string[] = []
      if (stations > 0)
        parts.push(`${stations} ${plural(stations, "station", "stations")}`)
      if (certificates > 0)
        parts.push(
          `${certificates} ${plural(certificates, "certificate", "certificates")}`
        )
      return parts.length > 0 ? parts.join(" · ") : "Education"
    },
    academicEyebrow: (n: number) =>
      `Education · ${n} ${plural(n, "station", "stations")}`,
    credentialsEyebrow: (n: number) => `Certificates · ${n}`,
    emptyTitle: "The shelf is still empty — for now.",
    emptyBody:
      "The next batch of certifications around AI, security and cloud is being planned. As soon as the first one is running it shows up here with progress and roadmap.",
    statusCompleted: "Completed",
    statusInProgress: "In Progress",
    statusPlanned: "Planned",
    lifetime: "Lifetime",
    certWindow: "Window",
    certHours: "Hours",
    certCost: "Cost",
    certDifficulty: "Difficulty",
    certDifficultyAria: (n: number) => `${n} out of 5`,
    certWhy: "Why it matters",
    certViewCredential: "View credential",
    certIssued: (month: string) => `Issued ${month}`,
    certWindowValue: (start: string, end: string) =>
      end ? `${start} – ${end}` : start,
    certMeta: (provider: string, category: string) =>
      [provider, category].filter(Boolean).join(" · "),
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "What's next on the bench.",
    roadmapHeading: (n: number) =>
      `${n} ${plural(n, "certificate", "certificates")} scheduled`,
    roadmapAxis: "Timeline",
    roadmapToday: "Today",
    roadmapMonthIndex: (n: number) => `M${n}`,
    roadmapBar: (months: number, label: string) =>
      `${months} ${plural(months, "mo", "mos")} · ${label}`,
    roadmapRange: (start: string, end: string) => `${start} – ${end}`,
    roadmapRowMeta: (status: string, start: string, end: string) =>
      `${status}${start ? ` · ${start}` : ""}${end ? ` – ${end}` : ""}`,
  },

  /** Package-site blog: /packages/blog and /packages/blog/[slug]. */
  pkgBlog: {
    label: "Blog",
    title: "News and tutorials",
    subtitle: "Tutorials and notes on the libraries.",
    empty: "No posts match this filter yet.",
    filterPackage: "Package",
    filterType: "Type",
    all: "All",
    allArticles: "All articles",
    releaseNotesLink: "Release notes",
    types: { news: "News", tutorial: "Tutorial", release: "Release" },
    rss: "RSS feed",
    backToBlog: "All posts",
    onThisPage: "On this page",
    usedPackage: "Package in this post",
    viewPackage: "View package",
    related: "Related posts",
    videos: "Video",
    readingTime: (n: number) => `${n} min read`,
    postedBy: (author: string) => `By ${author}`,
    previous: "Newer posts",
    next: "Older posts",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    originallyPublished: "Originally published elsewhere",
  },

  /** Release notes of the packages: /packages/releasenotes. */
  releaseNotes: {
    label: "Release notes",
    title: "Release notes",
    subtitle: "What changed in each version of the libraries.",
    empty: "No release notes match this filter yet.",
    filterPackage: "Package",
    all: "All",
    rss: "RSS feed",
    articlesLink: "Articles",
    previous: "Newer releases",
    next: "Older releases",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    allForPackage: "All release notes",
    latestOfPackage: "Latest release notes",
  },

  notFound: {
    title: "Page not found",
    body: "This page does not exist, or it moved.",
    home: "Back to the homepage",
    /** The status code shown as the page's tab label. */
    code: "404",
  },

  /** Package shop: /packages, /packages/[slug], pricing, licence, consent. */
  packages: {
    label: "Packages",
    overviewTitle: "Libraries for agencies",
    overviewSubtitle:
      "Small, focused libraries for agencies in Switzerland, Germany and Austria. The core is open source under MIT. Pro add-ons are sold as fair subscriptions, with no licence keys and no tracking.",
    overviewDescription:
      "Open-source libraries by Seya Weber for agencies in Switzerland, Germany and Austria, with optional Pro add-ons.",
    count: (n: number) => `${n} ${plural(n, "package", "packages")}`,
    allPackages: "All packages",
    browser: {
      searchLabel: "Search packages",
      searchPlaceholder: "Search by name, tag or npm package",
      searchHint: "Press / to search",
      clear: "Clear search",
      filterTag: "Tag",
      filterStatus: "Status",
      filterLicense: "License",
      all: "All",
      results: (n: number, total: number) =>
        n === total
          ? `${total} ${plural(total, "package", "packages")}`
          : `${n} of ${total} ${plural(total, "package", "packages")}`,
      empty: "No package matches these filters.",
      reset: "Reset filters",
    },
    status: {
      stable: "Stable",
      beta: "Beta",
      "coming-soon": "Coming soon",
    },
    license: {
      MIT: "MIT",
      "MIT + Pro": "MIT + Pro",
      commercial: "Commercial",
    },
    docs: "Docs",
    docsPage: {
      seoSuffix: (pkg: string) => `${pkg} docs`,
      overviewTitle: (pkg: string) => `${pkg} documentation`,
      overviewLabel: "Documentation",
      crumbs: "Breadcrumb",
      navLabel: "Documentation pages",
      menu: "Documentation menu",
      liveDemo: "Live demo",
      tryDemo: "Try the live demo",
      previous: "Previous",
      next: "Next",
      editOnGitHub: "Edit on GitHub",
      onThisPage: "On this page",
      unavailable:
        "The documentation could not be loaded right now. Try again in a few minutes, or read it in the repository.",
      openRepository: "Open the repository",
    },
    github: "GitHub",
    npm: "npm",
    changelog: "Changelog",
    pricing: "Pricing",
    viewPackage: (name: string) => `View ${name}`,
    descriptionHeading: "About",
    codeHeading: "Example",
    featuresHeading: "What you get",
    freeHeading: "Free, MIT",
    proHeading: "Pro",
    comparisonHeading: "Free and Pro",
    comparisonFeature: "Feature",
    comparisonFree: "Free",
    comparisonPro: "Pro",
    included: "Included",
    notIncluded: "Not included",
    proPackagesHeading: "Pro packages",
    faqHeading: "Questions",
    articlesHeading: "Articles",
    readMore: "Read",
    videosHeading: "Videos",
    // Grey follow-up lines for the two-tone section headings
    browse: "Browse packages",
    blogLink: "Read the blog",
    sections: {
      code: { label: "Example", title: "A short example", sub: "Copy it into your project." },
      features: { label: "Features", title: "What you get", sub: "Free under MIT, with Pro on top." },
      comparison: { label: "Compare", title: "Free and Pro", sub: "Side by side." },
      proPackages: { label: "Pro", title: "Pro packages", sub: "Add-ons on top of the core." },
      pricing: { label: "Pricing", title: "Pricing", sub: "Prices are in CHF." },
      faq: { label: "FAQ", title: "Questions", sub: "Short answers." },
      articles: { label: "Articles", title: "Articles", sub: "Guides and release notes." },
      videos: { label: "Videos", title: "Videos", sub: "Walkthroughs." },
    },
    liveDemo: "Live demo",
    liveDemoNote: "Try the themes, browse the catalog and read a real scanner report. The demo also shows the GTM container check, the monitoring of many client sites and the catalog changes per project.",
    // Live demo of the Pro packages (/permito/demo)
    demo: {
      seoTitle: "Permito live demo: core, Pro themes, catalog, cookie table, scanner, GTM check, monitoring",
      description:
        "Try Permito in your browser. The free core gives you the banner, the settings dialog and gates. The Pro themes, service catalog, cookie table and scanner report are rendered from the real Pro packages. Recorded runs show the GTM container check, the monitoring of many client sites and the catalog changes per project.",
      title: "Permito",
      titleSub: "Live demo, core and Pro.",
      intro:
        "The first section runs the free core (MIT). Every section after it is produced by the Pro packages themselves. The themes and layouts run in your browser. The catalog, the cookie table and the scanner report are rendered on the server, so what reaches your browser is the finished HTML and not the packages. The last three sections before the consent log (GTM container check, monitoring many client sites, catalog changes per project) show recorded output of the command-line tools.",
      isolation:
        "The banner preview uses its own in-memory storage. Nothing you click here changes the consent of this site.",
      overview: "Permito overview",
      pricing: "See pricing",
      jump: "On this page",
      jumpLinks: [
        { href: "#core", label: "Core" },
        { href: "#script-tag", label: "Script tag" },
        { href: "#themes", label: "Themes" },
        { href: "#catalog", label: "Catalog" },
        { href: "#cookie-table", label: "Cookie table" },
        { href: "#scanner", label: "Scanner" },
        { href: "#gtm-check", label: "GTM check" },
        { href: "#monitoring", label: "Monitoring" },
        { href: "#catalog-changes", label: "Catalog changes" },
        { href: "#log", label: "Consent log" },
      ],

      core: {
        label: "Core",
        title: "Core (free, MIT)",
        sub: "Banner, dialog and gates.",
        lede: "The banner, the settings dialog and the gates belong to the free core, @permitojs/react. Decide in the banner, then watch the gate and the video below react. The decision is kept in memory only and is gone on reload. It expires after 365 days (maxAgeDays), and the result shows whether your browser sends the Global Privacy Control signal.",
        openPreferences: "Open preference center",
        restart: "Restart demo",
        statsAllowed: "Statistics: allowed. An analytics script could load now.",
        statsBlocked: "Statistics: blocked until you agree.",
        gateLabel: "ConsentGate, category statistics",
        iframeLabel: "ConsentIframe, YouTube via youtube-nocookie.com",
        videoTitle: "Demo video",
        previewLabel: "Preview of a customer website. The banner and the dialog are the real components.",
        resultHeading: "Decision in the preview",
        resultPending: "No decision yet. Choose in the banner.",
        resultLoading: "Reading stored decision",
        granted: "true",
        declined: "false",
        expiresLabel: "expiresAt",
        gpcLabel: "globalPrivacyControl",
        mockHost: "client.example",
        mockHeading: "Page content",
        mockBody: "This mock page stands in for a client site. The consent UI is drawn on top of it.",
      },

      scriptTag: {
        label: "Script tag",
        title: "Without React (free, MIT)",
        sub: "One script tag, same banner.",
        lede: "Since 0.3.0 the banner and the settings dialog also run without React: as a script tag for WordPress, Webflow or plain HTML, or via createConsentUI from @permitojs/core/ui. The frame below runs that framework-free code. The decision is kept in memory only and is gone on reload.",
        openPreferences: "Open preference center",
        restart: "Restart demo",
        previewLabel: "Rendered by createConsentUI, without React.",
        snippetLabel: "The same banner on any website",
        resultPending: "No decision yet. Choose in the banner.",
      },

      themes: {
        label: "Themes",
        title: "Themes and layouts",
        sub: "Live, in the frame below.",
        lede: "Pick a theme, a mode and a layout, then decide in the banner. Changing the layout shows the banner again. The decision is kept in memory only and is gone on reload.",
        themeLegend: "Theme",
        modeLegend: "Mode",
        layoutLegend: "Layout",
        modes: { light: "Light", dark: "Dark" },
        themeNames: {
          neutral: "Neutral",
          minimal: "Minimal",
          rounded: "Rounded",
          contrast: "Contrast",
          corporate: "Corporate",
          warm: "Warm",
        },
        layouts: {
          bottom: "Banner, bottom",
          bar: "Bar, top",
          corner: "Banner, corner",
          twostep: "Two-step banner",
          modal: "Modal",
        },
        layoutHints: {
          bottom: "ConsentBanner, position bottom",
          bar: "ConsentBanner, position top, class pmt-bar",
          corner: "ConsentBanner, position bottom-left",
          twostep: "TwoStepBanner, categories in the same banner",
          modal: "ConsentModal, blocks the page until a choice is made",
        },
        showAgain: "Show banner again",
        previewLabel: "Preview of a customer website. The banner is the real component.",
        mockHost: "client.example",
        mockHeading: "Page content",
        mockBody: "This mock page stands in for a client site. The consent UI is drawn on top of it.",
        resultHeading: "Decision in the preview",
        resultPending: "No decision yet. Choose in the banner above.",
        resultLoading: "Reading stored decision",
        resultSource: "Source",
        resultTime: "Recorded",
        granted: "true",
        declined: "false",
        modalNote:
          "The modal traps focus on purpose. Make a choice in it to use the controls above again.",
      },

      catalog: {
        label: "Catalog",
        title: "Service catalog",
        sub: "Facts with a source.",
        lede: (total: number, shown: number) =>
          `The catalog holds ${total} services. ${shown} are shown in full below. Each entry states what the provider documents, with the source page and the date it was read.`,
        rule: "The catalog contains facts with a source, not a legal assessment. The category is set by you, the operator, when you turn an entry into a service.",
        provider: "Provider",
        entity: "Legal entity",
        hosting: "Hosting",
        hostingProvider: "Run by the provider",
        hostingSelf: "Self-hosted, runs on your infrastructure",
        selfHostedNote: "No provider receives data from this setup, so entity and transfers do not apply.",
        purpose: "Purpose",
        thirdCountries: "Third countries",
        thirdCountriesNone: "None named by the provider",
        dpf: "Data Privacy Framework",
        dpfNotChecked: "Not checked",
        dpfEntry: (entity: string, euUs: boolean, swissUs: boolean) =>
          `${entity}, EU-US ${euUs ? "listed" : "not listed"}, Swiss-US ${swissUs ? "listed" : "not listed"}`,
        storage: "Cookies and storage",
        storageNone: "The provider documents no cookies or storage entries.",
        colName: "Name",
        colType: "Type",
        colDuration: "Duration",
        colDescription: "Description",
        durationNone: "Not stated",
        source: "Source",
        retrieved: "retrieved",
        othersHeading: (n: number) => `${n} more services, by name`,
        othersNote: "Every entry has the same fields as the ones above.",
        mapperHeading: "From entry to config",
        mapperBody:
          "toConsentService takes over name, provider, purpose, cookies and privacy policy link. You add the category. The catalog cannot set it for you, and entries may not contain one.",
      },

      table: {
        label: "Cookie table",
        title: "Cookie table",
        sub: "From the same config as the banner.",
        lede: "This table is built from the config below with buildCookieTable and toHtml, enriched from the catalog and rendered on the server. The tabs only switch between finished blocks.",
        configNote:
          "The example config lists three services. The categories are choices made for this demo.",
        tabsLabel: "Cookie table language",
        tabs: {
          de: "Deutsch",
          fr: "Français",
          it: "Italiano",
          en: "English",
          md: "Markdown",
        },
        scrollHint: "The table scrolls sideways inside its frame.",
        ci: "In CI, run permito-cookie-table with --check and the file path. It writes nothing and exits with code 1 when the file differs from what the config generates, so the privacy policy page cannot fall behind the banner.",
        limits:
          "The table reflects the config. It does not check that the config is complete or correct. The scanner is for that.",
      },

      scanner: {
        label: "Scanner",
        title: "Scanner",
        sub: "A recorded run.",
        lede: "The scanner loads a page in headless Chromium without clicking anything and compares what it sees with your consent config. It reports and changes nothing.",
        recorded:
          "This is a recorded run against a demo page, not a live check. The config for the run lists one service, Google Analytics 4.",
        scanned: "Scanned page",
        summary: "Summary",
        unconfigured: "Not in your config",
        unconfiguredHint:
          "A cookie, storage key or third-party host that no configured service accounts for. Where the catalog knows a match, it suggests an entry. Whether it belongs in your config, and in which category, is your decision.",
        before: "Active before consent",
        beforeHint:
          "The entry belongs to a configured service that needs a decision, and it was present before any consent existed. This is an observation, not an assessment. A possible cause is a script that is not gated or a tag manager that loads it regardless.",
        suggestions: "Catalog suggestions",
        noSuggestions: "No catalog match",
        service: "Service",
        category: "Category",
        matched: "Matched, for information",
        none: "None",
        empty: "Nothing in this group.",
        run: "Run it yourself",
        exitHeading: "Exit code",
        exitThis: (code: number) => `This run: ${code}`,
        exits: [
          { code: "0", text: "No findings." },
          { code: "1", text: "At least one finding, not in your config or active before consent." },
          { code: "2", text: "Error during the run, for example an unreachable page or a missing Chromium." },
        ],
        limits:
          "A clean run is a snapshot, not proof. The scanner does not click, scroll or log in, so it misses what loads only after an interaction.",
        error: "The recorded report could not be read.",
      },

      gtmCheck: {
        label: "GTM check",
        title: "GTM container check",
        sub: "Before the container goes live.",
        lede: "permito gtm-check reads a container export from Google Tag Manager and matches each tag to a catalog service. It uses Google's tag types, the hosts in Custom HTML and community templates. It reads the file only and makes no network request.",
        demoNote: "Built from a demo container, not a client's.",
        demoNoteMore: "The export and the config were made for this page.",
        containerHeading: "The container export",
        containerNote: (name: string, id: string, version: string) =>
          `${name}, ${id}, version ${version}. Tags as listed in the export file.`,
        colTag: "Tag",
        colType: "Type",
        colTrigger: "Trigger",
        colConsent: "Consent check",
        scrollHint: "The table scrolls sideways inside its frame.",
        notInConfig: "Service not in your config",
        notInConfigHint:
          "The tag belongs to a catalog service that your Permito config does not list. Add the service or remove the tag.",
        noConsentCheck: "Fires without an additional consent check",
        noConsentCheckHint:
          "The service is in the config, but the tag has no consent check of its own (consentSettings not set). Set one, or gate the tag with a Permito consent trigger.",
        unknown: "Tag not assigned to a catalog service",
        unknownHint:
          "No catalog service matches. Check what the tag loads, then add a custom service to the config or confirm it needs none.",
        notice: "Notice: Google tag with built-in consent check",
        noticeHint:
          "Google documents a built-in consent check for these tag types. They are listed for information and do not count toward the exit code.",
        okLabel: "No finding",
        empty: "Nothing in this group.",
        via: "via",
        service: "Service",
        category: "Category",
        hosts: "Hosts",
        paused: "paused, not counted",
        run: "Run it yourself",
        exitHeading: "Exit code",
        exitThis: (code: number) => `This run: ${code}`,
        exits: [
          { code: "0", text: "No finding that counts." },
          { code: "1", text: "At least one tag is not in the config, has no consent check or cannot be assigned. Fits a CI step." },
        ],
        limits:
          "The result is an observation about the export file. Whether a service needs consent is your decision, set in the category and requiresConsent of your config.",
        error: "The recorded result could not be read.",
      },

      monitoring: {
        label: "Monitoring",
        title: "Monitoring many client sites",
        sub: "One run, one issue per site.",
        lede: "permito scan --sites checks every client site listed in a sites file in one run and writes a report per site. Findings the client has decided to keep go into accepted, per site.",
        recorded:
          "This is a recorded run against two local test sites, not a live check. Bakery Muster and Shop Beispiel are demo sites made for this page, not client sites.",
        sitesHeading: "permito.sites.json",
        summaryHeading: "Summary of the run",
        colSite: "Site",
        colStatus: "Status",
        colNotConfigured: "Not in config",
        colBefore: "Before consent",
        colAccepted: "Accepted",
        scrollHint: "The table scrolls sideways inside its frame.",
        status: { clean: "Clean", findings: "Findings" } as Record<string, string>,
        reportHeading: "Report for Shop Beispiel",
        reportNote: "The Markdown file the run writes for this site. The accepted entry is listed apart from the findings.",
        run: "Run it yourself",
        actionHeading: "GitHub Action template",
        actionBody:
          "The scanner package ships a workflow template. It runs weekly and opens one issue per client site. It comments only when something new appears and closes the issue once the site is clean again.",
        actionPoints: [
          "Weekly, Mondays at 05:00 UTC, or started by hand.",
          "One issue per site, in the repository you put the workflow in.",
          "A comment only for new differences, not for ones already reported.",
          "Runs on GitHub's runners in your agency's organisation. There is no hosted dashboard and nothing is sent to Seya.",
        ],
        actionNote: "Excerpt. The full template is in the scanner package.",
        limits: "A clean run is a snapshot of the pages the scanner loads, not proof.",
        error: "The recorded run could not be read.",
      },

      catalogChanges: {
        label: "Catalog changes",
        title: "Catalog changes per project",
        sub: "Only the services you use.",
        lede: "After you update the catalog package, permito-catalog changes lists what changed for the services in your own config, for example cookie durations, third countries or the legal entity. Every release also ships these changes as a changes.json, so they can be reviewed in the version pull request.",
        simulated: "Example output from a simulated catalog update.",
        simulatedBody:
          "The changes.json behind it was produced by the real script from a simulated update. It does not describe a real change in the catalog.",
        run: "Run it yourself",
        outputHeading: "Output",
        exitHeading: "Exit code",
        exitThis: "This run: 1, because a change touches the cookie table.",
        exitBody:
          "A change that affects the cookie table ends the run with exit code 1 and the note to generate the table again. This fits Renovate or Dependabot pull requests, where the check fails until the table is regenerated.",
        error: "The example output could not be read.",
      },

      log: {
        label: "Consent log",
        title: "Consent log",
        sub: "Stored on your server.",
        lede: "The log package is not part of this demo, so nothing is recorded here. This is what it stores per change of consent, and the route handler that receives it.",
        recordHeading: "One record",
        recordNote: "Example record with made-up values.",
        storedHeading: "Stored",
        stored:
          "The record is kept in a store you choose, on your infrastructure. The visitor ID is hashed with a secret salt and the ID itself is not stored.",
        notStoredHeading: "Not stored",
        notStored: "No IP address and no user agent. Fields the client adds are discarded.",
        yours:
          "Once the log runs, you process personal data. The retention period is required and has no default. Whether and how you use it is your decision.",
        routeHeading: "Next.js route handler",
        routeNote: "Two files: the log, and the route that receives the browser's POST.",
      },

      closing: {
        label: "Next step",
        title: "Use it in your own project",
        sub: "Pricing is per person.",
        lede: "After checkout, Polar gives your GitHub account access. The Pro packages then install from GitHub Packages with a read-only token.",
        cta: "See pricing",
        disclaimer: "Permito is technical consent infrastructure, not legal advice.",
      },
    },
    // Live demo of Surjection (/surjection/demo)
    surjectionDemo: {
      seoTitle: "Surjection live demo: accessibility check, client report, history and checklist",
      description:
        "Fix a small client site and watch the accessibility check react in your browser. Then see the branded client report, the project history and the WCAG 2.2 checklist that Surjection Pro produces.",
      title: "Surjection",
      titleSub: "Live demo, free and Pro.",
      intro:
        "The first section runs axe-core, the engine of the free package, in your browser against a small demo site. Every section after it shows output of the Pro packages, produced with their command-line tools from the same site and shown here as finished HTML.",
      isolation:
        "The demo site, the report and the checklist run in sandboxed frames. Nothing you do here is sent anywhere.",
      overview: "Surjection overview",
      pricing: "See pricing",
      jump: "On this page",
      jumpLinks: [
        { href: "#check", label: "Check" },
        { href: "#statement", label: "Statement" },
        { href: "#report", label: "Report" },
        { href: "#history", label: "History" },
        { href: "#checklist", label: "Checklist" },
      ],

      check: {
        label: "Check",
        title: "Check (free, MIT)",
        sub: "Fix the site, watch the result.",
        lede: "The bakery site below has six common barriers. Tick a fix and the page is checked again against WCAG 2.2 AA, with the same rules @sweberdev/surjection runs in Playwright, Vitest and the CLI.",
        previewLabel: "Demo site, checked in your browser",
        frameTitle: "Demo site Bäckerei Muster",
        fixesLegend: "Fixes",
        fixes: {
          lang: { label: "Declare the page language", criterion: "3.1.1" },
          contrast: { label: "Darken the opening hours", criterion: "1.4.3" },
          alt: { label: "Describe the image", criterion: "1.1.1" },
          label: { label: "Label the email field", criterion: "4.1.2" },
          button: { label: "Name the cart button", criterion: "4.1.2" },
          link: { label: "Give the Instagram link a text", criterion: "2.4.4" },
        },
        resultHeading: "Result",
        loading: "Loading the check",
        running: "Checking",
        error: "The check could not run in this browser.",
        summary: (rules: number, elements: number) =>
          rules === 0
            ? "No issues found by the automated check."
            : `${rules} ${rules === 1 ? "issue" : "issues"} on ${elements} ${elements === 1 ? "element" : "elements"}.`,
        impact: { critical: "Critical", serious: "Serious", moderate: "Moderate", minor: "Minor" },
        elements: "Elements",
        limits:
          "A clean result here means the automated rules pass. Automated tests find only part of all barriers, so a manual check is still needed.",
        cliHeading: "Same check on the command line",
        markdownHeading: "Markdown report of the first run",
      },

      statement: {
        label: "Statement",
        title: "Accessibility statement (free)",
        sub: "Five languages.",
        lede: "The statement generator is part of the free package. This one is in Swiss German, with the status and the known issue taken from the Pro checklist below.",
        fileLabel: "erklaerung.md",
      },

      report: {
        label: "Report",
        title: "Client report (Pro)",
        sub: "In your branding.",
        lede: "surjection-report turns the check, the history and the manual checklist into a report for the client, with the logo and colour of the agency, here the made-up Pixel & Co. It is available as HTML and PDF in German, Swiss German, French, Italian and English.",
        tabsLabel: "Report language",
        frameTitle: (lang: string) => `Example report, ${lang}`,
        pdf: "Download the PDF (German)",
        csv: "Download the fix list (CSV for Excel, German)",
      },

      history: {
        label: "History",
        title: "History (Pro)",
        sub: "Every client, every run.",
        lede: "surjection-history records each run per project and renders one dashboard for all clients: the latest status, the change since the last run and a trend line. These three projects were checked three times each, from August to October.",
        frameTitle: "Example dashboard",
        badgesLabel: "Status badges for READMEs and client portals",
      },

      checklist: {
        label: "Checklist",
        title: "Manual checklist (Pro)",
        sub: "Try it below.",
        lede: "surjection-checklist guides the part no tool can check. The full checklist has all 55 WCAG 2.2 A and AA criteria; this editor shows ten of them. The contrast criterion is already marked as failed by the automated check. Set the others and download the result as JSON.",
        frameTitle: "Example checklist editor",
      },

      closing: {
        label: "Next step",
        title: "Use it in your own projects",
        sub: "Pricing is per person.",
        lede: "The check and the statement are free on npm. After checkout, Polar gives your GitHub account access to the Pro packages, which install from GitHub Packages with a read-only token.",
        cta: "See pricing",
        disclaimer: "Surjection does not make a site legally compliant. Automated tests find only part of all barriers.",
      },
    },
    // Pricing
    pricingHeading: "Pricing",
    proComingSoon: (name: string) => `${name}: coming soon`,
    proComingSoonBody:
      "The Pro packages are not on sale yet. Join the waitlist and you get a note when they are.",
    billingLabel: "Billing period",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "per month",
    perYear: "per year",
    oneTime: "one-time",
    perSeatMonth: "per person, per month",
    perSeatYear: "per person, per year",
    perSeatOneTime: "per person, one-time",
    saving: (months: number) => `${months} ${plural(months, "month", "months")} free`,
    seats: (n: number) => (n === 1 ? "1 person" : `Up to ${n} people`),
    seatRange: (max: number) => `1 to ${max} people, chosen at checkout`,
    supportIncluded: "Support included",
    supportExcluded: "No support entitlement",
    recommended: "Recommended",
    subscribe: "Subscribe",
    buyLifetime: "Buy lifetime licence",
    joinWaitlist: "Join waitlist",
    customLine: (label: string) => `${label}: get in touch`,
    licenseLink: "Read the licence terms",
    // Install / links
    backToOverview: "All packages",
    // Shown on a package or bundle page after a Polar checkout (?checkout=success)
    checkoutSuccess: {
      title: (name: string) => `Thank you for buying ${name}`,
      portal: "Open the Polar customer portal and sign in with the e-mail address you used at checkout. Polar sends you a sign-in code.",
      portalLink: "Open the customer portal",
      seats: "Agency and Lifetime: access goes to seats. Assign a seat to every person who needs access, including yourself. Each person accepts the e-mail invitation. Freelancer licences skip this step.",
      github: "Connect your GitHub account in the portal. GitHub then sends you an invitation to the private Pro repository; accept it.",
      install: "Install the Pro packages from GitHub Packages with a read-only token.",
      docsLink: "Installation guide",
      help: "No invitation after a few minutes? Write to",
    },
    // Bundles of several Pro add-ons (/bundles/<slug>)
    bundle: {
      badge: "Bundle",
      seePricing: "See pricing",
      included: { label: "Included", title: "What is included", sub: "The full Pro add-on of each package." },
      upcoming: { label: "Next", title: "Coming to the bundle", sub: "Included at no extra cost once released." },
      pricing: { label: "Pricing", title: "Pricing", sub: "One licence for all of them, prices in CHF." },
      overviewHeading: "Bundles",
      overviewSub: "Several Pro add-ons under one licence.",
      packageNote: (pro: string, bundle: string) => `${pro} is also part of the ${bundle}.`,
      packageLink: (bundle: string) => `See the ${bundle}`,
    },
    // Licence page
    licenseLabel: "Licence",
    licenseTitle: "Licence terms",
    licenseSubtitle: "How the open-source and commercial packages are licensed.",
    // Consent
    consentTitle: "Video from YouTube",
    consentBody:
      "This video is hosted by YouTube. It loads only after you agree, because YouTube then receives your IP address and sets cookies.",
    consentAccept: "Load video and allow YouTube",
    consentSettings: "Cookie settings",
    consentProvider: "Privacy-enhanced mode (youtube-nocookie.com), Google Ireland Ltd.",
    // Legal pages
    imprintLabel: "Legal",
    imprintTitle: "Imprint",
    imprintSubtitle: "Who is responsible for this website.",
  },

  privacy: {
    label: "Privacy",
    title: "Privacy",
    subtitle: "How data submitted through this site is processed.",
  },

  pitch: {
    back: "Back to sweber.dev",
    stepForm: "Step 1 · Details",
    stepResult: "Step 2 · Result",
    title: "Generate a pitch",
    intro:
      "Tell me a little about what you're looking for and I'll generate a tailored summary of how Seya could help — ready to forward.",
    roleLabel: "Your role / context",
    rolePlaceholder: "Select your role",
    /** Sent verbatim to the pitch route, so the label is also the value. */
    roleOptions: ["Recruiter", "Startup Founder", "Agency", "Enterprise PM", "Other"],
    needsLabel: "What are you looking for?",
    needOptions: [
      "Full-Stack Development",
      "Project Management",
      "Automation & OPC-UA",
      "SaaS / Cloud Architecture",
      "Short-term Freelance",
      "Long-term Collaboration",
    ],
    requirementsLabel: "Any specific requirements? (optional)",
    requirementsPlaceholder:
      "e.g. a 3-month engagement building a TypeScript automation pipeline…",
    requirementsCount: (n: number, max: number) =>
      `${n}/${max} ${plural(max, "character", "characters")}`,
    generate: "Generate pitch",
    resultLabel: "Your pitch",
    writing: "Writing your pitch…",
    error: "Could not generate a pitch right now. Please try again.",
    copyToClipboard: "Copy to clipboard",
    startOver: "Start over",
    disclaimer:
      "This pitch was generated by AI based on Seya's actual profile. For direct contact:",
  },

  chat: {
    open: "Open chat — ask me anything",
    dialogLabel: "Chat with Seya's AI assistant",
    title: "Seya's AI assistant",
    subtitle: "Usually replies instantly",
    close: "Close chat",
    greeting:
      "Hi! I'm Seya's AI assistant. Ask me anything about his work, his projects or his availability.",
    error: "Something went wrong. Please try again.",
    inputLabel: "Message",
    inputPlaceholder: "Write your message…",
    send: "Send message",
    typing: "Assistant is typing",
  },

  deepDive: {
    toggle: "Technical deep dive",
    generated: "AI-generated analysis",
    loading: "Loading analysis…",
    error: "Details could not be loaded.",
    retry: "Try again",
  },

  auth: {
    label: "Admin",
    signInTitle: "Sign in",
    signInSubtitle: "Enter your credentials to continue",
    signIn: "Sign in",
    signingIn: "Signing in…",
    noAccount: "No account yet?",
    signUpTitle: "Create account",
    signUpSubtitle: "Set up your admin account",
    signUp: "Create account",
    signingUp: "Creating account…",
    haveAccount: "Already have an account?",
    checkingAvailability: "Checking availability…",
    signUpDisabled: "Signup is disabled. An account already exists.",
    goToSignIn: "Go to sign in",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    newPasswordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    errors: {
      signInFailed: "Login failed",
      signUpFailed: "Signup failed",
      passwordMismatch: "Passwords do not match",
      passwordShort: "Password must be at least 8 characters",
      generic: "Something went wrong. Please try again.",
    },
  },
} as const

export type Copy = typeof copy
