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
    more: "More",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    colorScheme: "Colour scheme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
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
    allProjects: "All projects",
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
    allArticles: "All articles",
    metricProjects: "Projects delivered",
    metricEmployers: "Employers",
    metricSince: "in the field",
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
  },

  experience: {
    label: (n: number, since?: number) =>
      n === 0
        ? "Career"
        : `${n} ${plural(n, "station", "stations")}${since ? ` · since ${since}` : ""}`,
    title: "Experience",
    subtitle: "My route through software development, project management and engineering.",
    empty: "No stations yet.",
    moreAboutMe: "More about me",
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
      message: "Message *",
      messagePlaceholder:
        "Tell me about your project, the goals and any concrete requirements…",
      submit: "Send message",
      submitting: "Sending…",
      analysisTitle: "AI match analysis",
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
  },

  notFound: {
    title: "Page not found",
    body: "This page does not exist, or it moved.",
    home: "Back to the homepage",
  },
} as const

export type Copy = typeof copy
