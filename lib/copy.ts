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
    education: "Education",
    skills: "Skills",
    blog: "Blog",
    connect: "Connect",
    privacy: "Privacy",
    login: "Login",
    nxrthstack: "Nxrthstack",
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
    expertiseEyebrow: (n: number) => `Expertise · ${n} ${plural(n, "area", "areas")}`,
    skills: "Skills",
    skillsEyebrow: (groups: number, total: number) =>
      `${groups} ${plural(groups, "category", "categories")} · ${total} ${plural(total, "skill", "skills")}`,
    skillsEmpty: "Skills are maintained in the admin and will appear here by category.",
    education: "Education",
    educationEyebrow: (n: number) => `Education · ${n} ${plural(n, "station", "stations")}`,
    ctaTitle: "Want to work together?",
    ctaBody: "I'm open to new projects and collaborations.",
    getInTouch: "Get in touch",
    downloadCv: "Download CV",
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
    models: "Engagement Models",
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

  education: {
    title: "Education",
    subtitle: "My academic route — and the certificates that mark the way forward.",
    academicBackground: "Academic background",
    credentials: "Credentials & roadmap",
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

  notFound: {
    title: "Page not found",
    body: "This page does not exist, or it moved.",
    home: "Back to the homepage",
    /** The status code shown as the page's tab label. */
    code: "404",
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
