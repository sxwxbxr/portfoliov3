/**
 * German UI chrome strings, typed against the widened English `copy`.
 *
 * Swiss Standard German: Sie-Form, always "ss", KMU, Offerte, CHF.
 * Sections used only by English-only routes (packages, physio, admin, pitch,
 * login) are reused from the English object on purpose.
 */
import { copy, type Copy } from "@/lib/copy"

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const copyDe: Copy = {
  nav: {
    work: "Arbeiten",
    about: "Über mich",
    services: "Leistungen",
    contact: "Kontakt",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schliessen",
    colorScheme: "Farbschema",
    themeSystem: "System",
    themeLight: "Hell",
    themeDark: "Dunkel",
    brand: "seya weber",
    menu: "Menü",
    navigationLabel: "Navigation",
    mainNavigation: "Hauptnavigation",
    footerLabel: "Fusszeile",
    projects: "Projekte",
    caseStudies: "Fallstudien",
    experience: "Erfahrung",
    career: "Werdegang",
    education: "Ausbildung",
    skills: "Kompetenzen",
    blog: "Blog",
    releaseNotes: "Release Notes",
    connect: "Vernetzen",
    privacy: "Datenschutz",
    imprint: "Impressum",
    packages: "Packages",
    physio: "Physio Tools",
    login: "Anmelden",
    github: "GitHub",
    linkedin: "LinkedIn",
  },

  common: {
    scroll: "Scrollen",
    close: "Schliessen",
    copy: "Kopieren",
    copied: "Kopiert",
    loading: "Lädt…",
    back: "Zurück",
    current: "Aktuell",
    recommended: "Empfohlen",
    locationFallback: "Bichwil SG, Ostschweiz",
    coreSentence:
      "Weber Development entwickelt individuelle Software und Automatisierungen für KMU in der Ostschweiz. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    coreSentenceShort:
      "Individuelle Software und Automatisierung für KMU in der Ostschweiz.",
    dateLocale: "de-CH",
    localTime: (time: string) => `${time} MEZ`,
    footerCtaTitle: "Arbeiten wir zusammen.",
    footerCtaAction: "Projekt starten",
    copyright: (year: number) => `© ${year} Seya Weber`,
    skipToContent: "Zum Hauptinhalt springen",
    moreAboutMe: "Mehr über mich",
    expertiseAreas: [
      {
        category: "Entwicklung",
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
        category: "Projektmanagement",
        skills: [
          "Agile / Scrum",
          "Stakeholder-Management",
          "Requirements Engineering",
          "Risikomanagement",
        ],
      },
      {
        category: "Tools & Plattformen",
        skills: ["Azure DevOps", "Git", "Docker", "Vercel", "Jira", "Supabase"],
      },
    ],
  },

  coldStart: {
    label: "Kalibriere",
    ready: "Bereit",
  },

  home: {
    availabilityFallback: "Für Projekte verfügbar",
    heroHeadline: "Weber Development",
    heroOffer: "Individuelle Software und Automatisierung für KMU in der Ostschweiz.",
    heroPerson:
      "Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    introEyebrow: "Kurz gesagt",
    introLead:
      "Ich übersetze komplexe betriebliche Anforderungen in schlanke, wartbare Software – und weil ich auf beiden Seiten ausgebildet bin, verstehe ich die Anforderung ebenso gut wie das System, das sie erfüllen muss.",
    introBody:
      "Mein Weg führte über Elektroplanung, Energieoptimierung, Medizintechnik und SaaS-Entwicklung. Diese Breite ist der Grund, weshalb ich meist die Übersetzungsarbeit zwischen Fachseite und Technik übernehme.",
    currentRole: (role: string, company: string) => `Aktuell · ${role} bei ${company}`,
    selectedWork: "Ausgewählte Arbeiten",
    selectedWorkEyebrow: "Ausgewählte Arbeiten",
    expertise: "Kompetenzen",
    expertiseEyebrow: (n: number) => `Kompetenzen · ${n} ${plural(n, "Bereich", "Bereiche")}`,
    experience: "Erfahrung",
    experienceEyebrow: (n: number, since?: number) =>
      `Werdegang · ${n} ${plural(n, "Station", "Stationen")}${since ? ` · seit ${since}` : ""}`,
    fullCareer: "Gesamter Werdegang",
    testimonialEyebrow: "Referenz",
    testimonials: "Was Partner sagen",
    readCaseStudy: "Fallstudie lesen",
    writing: "Texte",
    metricProjects: "Realisierte Projekte",
    metricEmployers: "Arbeitgeber",
    metricSince: "in der Branche",
    metricSinceValue: (year: number) => `seit ${year}`,
    introHeading: "Einleitung",
    selectedWorkEyebrowCount: (n: number) =>
      `Ausgewählte Arbeiten · ${n} ${plural(n, "Projekt", "Projekte")}`,
    writingEyebrow: (n: number) => `Texte · ${n}`,
    heroTaglineLead: "Anforderungen rein,",
    heroTaglineSub: "Software raus",
    introLabel: "Kurz gesagt",
    introTitle: "Beide Seiten des Tisches",
    introSub: "die Anforderung und das System",
    workLabel: "Arbeiten",
    workTitle: "Ausgewählte Projekte",
    workSub: "aus Gesundheitswesen, Energie und SaaS",
    expertiseLabel: "Kompetenzen",
    expertiseTitle: "Womit ich arbeite",
    expertiseSub: "vom Plan bis zum Pull Request",
    careerLabel: "Werdegang",
    careerTitle: "Bisherige Stationen",
    careerSub: (since?: number) => (since ? `in der Branche seit ${since}` : "und es geht weiter"),
    referenceLabel: "Referenz",
    referenceSub: "in ihren eigenen Worten",
    writingLabel: "Texte",
    writingTitle: "Notizen aus der Praxis",
    writingSub: "zu Umsetzung und Engineering",
    ctaEyebrow: "Von der Idee zur Umsetzung",
    ctaTitle: "Haben Sie ein Projekt im Kopf?",
    ctaButton: "Kontakt aufnehmen",
  },

  announcement: {
    text: "Neu: packages.sweber.dev",
  },

  projects: {
    label: (n: number) => (n > 0 ? `${n} ${plural(n, "Projekt", "Projekte")}` : "Arbeiten"),
    title: "Projekte",
    subtitle: "Eine Auswahl aus Gesundheitswesen, Energie, SaaS und Developer Tools.",
    empty: "Noch keine Projekte.",
    viewCaseStudies: "Fallstudien ansehen",
    backToProjects: "Zurück zu den Projekten",
    viewLive: "Live ansehen",
    sourceCode: "Quellcode",
    challengeEyebrow: "Ausgangslage",
    challenge: "Die Herausforderung",
    solutionEyebrow: "Vorgehen",
    solution: "Die Lösung",
    resultsEyebrow: (n: number) => `Ergebnisse · ${n}`,
    results: "Ergebnisse",
    technologies: "Technologien",
    builtWith: "Umgesetzt mit",
    builtWithSub: "der Stack dahinter",
    nextProject: "Nächstes Projekt",
    allProjects: "Alle Projekte",
    itemMeta: (index: string, category: string) =>
      category ? `${index} · ${category}` : index,
  },

  blog: {
    label: (n: number) => `${n} ${plural(n, "Artikel", "Artikel")}`,
    title: "Texte",
    subtitle:
      "Notizen zu Softwareentwicklung, Projektumsetzung und digitaler Transformation.",
    empty: "Noch keine Artikel veröffentlicht.",
    externalLabel: "Packages",
    allArticles: "Alle Artikel",
    previousArticle: "Vorheriger Artikel",
    nextArticle: "Nächster Artikel",
    taggedEyebrow: (n: number) => `Verschlagwortet · ${n}`,
    writtenBy: "Verfasst von",
  },

  // English-only route: reused as is.
  caseStudies: copy.caseStudies,

  experience: {
    label: (n: number, since?: number) =>
      n === 0
        ? "Werdegang"
        : `${n} ${plural(n, "Station", "Stationen")}${since ? ` · seit ${since}` : ""}`,
    title: "Erfahrung",
    subtitle: "Mein Weg durch Softwareentwicklung, Projektmanagement und Engineering.",
    empty: "Noch keine Stationen.",
  },

  about: {
    label: "Über mich",
    title: "Über mich",
    subtitle:
      "Weber Development entwickelt individuelle Software und Automatisierungen für KMU in der Ostschweiz. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    factLocation: "Standort",
    factExperience: "Erfahrung",
    factFocus: "Schwerpunkt",
    factLanguages: "Sprachen",
    expertise: "Kompetenzen",
    expertiseSub: "Womit ich arbeite, nach Bereichen gruppiert.",
    educationSub: "Formale Ausbildung und die Stationen auf dem Weg.",
    expertiseEyebrow: (n: number) => `Kompetenzen · ${n} ${plural(n, "Bereich", "Bereiche")}`,
    skills: "Fähigkeiten",
    skillsEyebrow: (groups: number, total: number) =>
      `${groups} ${plural(groups, "Kategorie", "Kategorien")} · ${total} ${plural(total, "Fähigkeit", "Fähigkeiten")}`,
    skillsEmpty: "Die Fähigkeiten werden im Admin gepflegt und erscheinen hier nach Kategorie.",
    career: "Werdegang",
    education: "Ausbildung",
    educationEyebrow: (n: number) => `Ausbildung · ${n} ${plural(n, "Station", "Stationen")}`,
    ctaTitle: "Möchten Sie zusammenarbeiten?",
    ctaBody: "Ich bin offen für neue Projekte und Zusammenarbeit.",
    getInTouch: "Kontakt aufnehmen",
    portraitAlt: "Seya Weber, Projektleiter und Softwareentwickler",
    factLocationValue: "Bichwil SG, CH",
    factExperienceValue: "3+ Jahre",
    factFocusValue: "Automatisierung & PM",
    factLanguagesValue: "DE, EN, FR",
    bio: [
      "Ich bin Projektleiter für Software und Digitalisierung bei Telsonic und baue dort massgeschneiderte Automatisierungs-Workflows in geschäftskritischen Systemen. Daneben führe ich Weber Development und schreibe massgeschneiderte Software für verschiedene Unternehmen.",
      "Mit einem doppelten Hintergrund in Softwareentwicklung und Elektroplanung übersetze ich komplexe betriebliche Anforderungen in klare Spezifikationen, schlanke Prozesse und wartbare Lösungen. Mein Weg führte über Elektroplanung, Energieoptimierung für ein Schweizer Bankenportfolio, Datenmigration im Gesundheitswesen und heute über industrielle Automatisierung und SaaS-Produktentwicklung.",
      "Ich baue Lösungen, die nicht nur das aktuelle Problem lösen, sondern mit dem Unternehmen mitwachsen. Weil ich sowohl entwickle als auch Projekte leite, kann ich zwischen technischer Umsetzung und betrieblichen Zielen übersetzen.",
    ],
    uncategorised: "Ohne Kategorie",
    skillDetailLoading: "Details werden geladen…",
    skillDetailFallback:
      "In verschiedenen Projekten eingesetzt – Details finden Sie auf der Projektseite.",
  },

  services: {
    label: "Leistungen",
    title: "Leistungen",
    subtitle:
      "Komplexe Vorhaben von der Idee bis zur Wirkung – mit der richtigen Mischung aus Strategie und Umsetzung.",
    packageEyebrow: (n: number) => `Paket ${String(n).padStart(2, "0")}`,
    enquire: "Anfragen",
    modelsEyebrow: (n: number) =>
      `Zusammenarbeit · ${n} ${plural(n, "Modell", "Modelle")}`,
    models: "Zusammenarbeitsmodelle",
    modelsSub: "Drei Wege, zusammenzuarbeiten.",
    ctaTitle: "Passt eines davon?",
    ctaBody: "Schildern Sie mir kurz, worum es geht – ich antworte innerhalb von 24 Stunden.",
    startConversation: "Gespräch beginnen",
    packages: [
      {
        // TODO(Seya): decide whether service names stay English or are translated.
        title: "Delivery Leadership",
        description:
          "Interimistische Projektleitung für Digitalisierungsprogramme, komplexe Migrationen und Automatisierungsvorhaben.",
        outcomes: [
          "Klarer Umfang, klare Roadmap und abgestimmte Stakeholder",
          "Risiko- und Abhängigkeitsmanagement über Teams hinweg",
          "Ein Reporting-Rhythmus, der zur Führungsebene passt",
        ],
      },
      {
        title: "Solution Acceleration",
        description:
          "Praktische Umsetzung: Validierte Konzepte werden zu produktionsreifen Werkzeugen und Workflows.",
        outcomes: [
          "Schnelle Proofs of Concept und MVP-Entwicklung",
          "Dokumentation und Schulung für eine saubere Übergabe",
          "QA-Unterstützung und Instrumentierung für kontinuierliche Verbesserung",
        ],
      },
      {
        title: "Process & Product Coaching",
        description:
          "Unterstützung für Teams, die agile Praktiken einführen, ihre Product Discovery schärfen und ihre Delivery-Rituale verbessern.",
        outcomes: [
          "Discovery- und Delivery-Frameworks, die Ihr Team selbst betreiben kann",
          "Vorlagen, Checklisten und Playbooks für Wiederholbarkeit",
          "Begleitendes Coaching, damit neue Gewohnheiten bleiben",
        ],
      },
    ],
    engagementModels: [
      {
        title: "Projektbasiert",
        description: "Fester Umfang mit definierten Meilensteinen und Liefergegenständen.",
        recommended: false,
      },
      {
        title: "Retainer",
        description:
          "Laufende Beratung und Umsetzung für Teams, die einen strategischen Partner auf Abruf wünschen.",
        recommended: true,
      },
      {
        title: "Workshops",
        description:
          "Fokussierte Sessions, um Entscheidungen freizumachen, Discovery zu moderieren oder das interne Team zu befähigen.",
        recommended: false,
      },
    ],
  },

  contact: {
    label: "Kontakt",
    title: "Kontakt aufnehmen",
    subtitle:
      "Ein Projekt im Kopf oder eine Stelle zu besetzen? Schreiben Sie mir – ich antworte innerhalb von 24 Stunden.",
    email: "E-Mail",
    phone: "Telefon",
    location: "Standort",
    // TODO(Seya): confirm the service area before launch.
    serviceArea:
      "Wil, Uzwil, Gossau, St. Gallen und die gesamte Ostschweiz, remote in der ganzen Schweiz.",
    responseTime: "Antwortzeit",
    responseValue: "Innerhalb von 24 Stunden",
    form: {
      name: "Name *",
      namePlaceholder: "Ihr vollständiger Name",
      email: "E-Mail *",
      emailPlaceholder: "ihre.mail@example.com",
      company: "Firma",
      companyPlaceholder: "Optional",
      projectType: "Projektart *",
      projectTypePlaceholder: "Projektart auswählen",
      budget: "Budgetrahmen",
      budgetPlaceholder: "Rahmen auswählen",
      timeline: "Zeitrahmen",
      timelinePlaceholder: "Bis wann soll es fertig sein?",
      // `value` is the wire format of the contact API: keep identical to English.
      projectTypeOptions: [
        { value: "automation", label: "Prozessautomatisierung" },
        { value: "web-development", label: "Webentwicklung" },
        { value: "data-integration", label: "Datenintegration" },
        { value: "consulting", label: "Technische Beratung" },
        { value: "other", label: "Anderes" },
      ],
      budgetOptions: [
        { value: "under-10k", label: "< CHF 10’000" },
        { value: "10k-25k", label: "CHF 10’000 – 25’000" },
        { value: "25k-50k", label: "CHF 25’000 – 50’000" },
        { value: "50k-plus", label: "CHF 50’000+" },
        { value: "discuss", label: "Besprechen wir" },
      ],
      timelineOptions: [
        { value: "asap", label: "So bald wie möglich" },
        { value: "1-month", label: "Innerhalb eines Monats" },
        { value: "3-months", label: "Innerhalb von 3 Monaten" },
        { value: "6-months", label: "Innerhalb von 6 Monaten" },
        { value: "flexible", label: "Flexibel" },
      ],
      message: "Nachricht *",
      messagePlaceholder:
        "Erzählen Sie mir von Ihrem Projekt, den Zielen und konkreten Anforderungen…",
      submit: "Nachricht senden",
      submitting: "Wird gesendet…",
      analysisTitle: "KI-Match-Analyse",
      analysisLoading: "Analyse läuft…",
      messageCount: (n: number, max: number) => `${n}/${max}`,
      privacyLead:
        "Mit dem Absenden erklären Sie sich einverstanden, dass Ihre Daten zur Beantwortung Ihrer Anfrage verarbeitet werden.",
      privacyLink: "Datenschutzerklärung",
      privacyTail: "Details in der",
      successTitle: "Nachricht gesendet",
      successBody: "Danke für Ihre Nachricht. Ich melde mich innerhalb von 24 Stunden bei Ihnen.",
      errors: {
        nameRequired: "Name ist erforderlich",
        nameShort: "Der Name muss mindestens 2 Zeichen lang sein",
        emailRequired: "E-Mail ist erforderlich",
        emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        projectTypeRequired: "Bitte wählen Sie eine Projektart",
        messageRequired: "Nachricht ist erforderlich",
        messageShort: "Die Nachricht muss mindestens 10 Zeichen lang sein",
        sendFailed: "Die Nachricht konnte nicht gesendet werden.",
        generic: "Etwas ist schiefgelaufen. Schreiben Sie mir direkt an info@sweber.dev.",
      },
    },
  },

  career: {
    label: (work: number, education: number) => {
      const parts: string[] = []
      if (work > 0) parts.push(`${work} ${plural(work, "Rolle", "Rollen")}`)
      if (education > 0)
        parts.push(
          `${education} ${plural(education, "Qualifikation", "Qualifikationen")}`
        )
      return parts.length > 0 ? parts.join(" · ") : "Werdegang"
    },
    title: "Werdegang",
    subtitle:
      "Berufstätigkeit und Ausbildung nebeneinander. In beiden Lehren liefen sie gleichzeitig, deshalb gehören sie auf eine Achse und nicht auf zwei Seiten.",
    timelineEyebrow: (from: number, to: number) => `Zeitstrahl · ${from}–${to}`,
    timelineTitle: "Der ganze Weg",
    timelineSub: "Beruf und Ausbildung auf einer Achse.",
    timelineHint:
      "Balken überfahren oder fokussieren, um den Eintrag hervorzuheben, und auswählen, um dorthin zu springen.",
    timelineLabel: (from: number, to: number) =>
      `Zeitstrahl des Werdegangs von ${from} bis ${to}, in zwei Spuren: Beruf und Ausbildung`,
    barLabel: (title: string, subtitle: string, period: string) =>
      subtitle ? `${title} – ${subtitle}, ${period}` : `${title}, ${period}`,
    laneWork: "Beruf",
    laneEducation: "Ausbildung",
    planned: "Geplant",
    empty: "Hier ist noch nichts.",
    emptyTitle: "Der Zeitstrahl des Werdegangs wird noch befüllt.",
    emptyBody:
      "Rollen und Qualifikationen werden im Admin gepflegt und erscheinen hier auf einer Achse.",
  },

  education: {
    title: "Ausbildung",
    subtitle: "Mein akademischer Weg – und die Zertifikate, die den weiteren Weg markieren.",
    academicBackground: "Akademischer Hintergrund",
    credentials: "Zertifikate & Roadmap",
    credentialsSub: "Was erledigt ist, was läuft und was als Nächstes kommt.",
    empty: "Hier ist noch nichts.",
    label: (stations: number, certificates: number) => {
      const parts: string[] = []
      if (stations > 0)
        parts.push(`${stations} ${plural(stations, "Station", "Stationen")}`)
      if (certificates > 0)
        parts.push(
          `${certificates} ${plural(certificates, "Zertifikat", "Zertifikate")}`
        )
      return parts.length > 0 ? parts.join(" · ") : "Ausbildung"
    },
    academicEyebrow: (n: number) =>
      `Ausbildung · ${n} ${plural(n, "Station", "Stationen")}`,
    credentialsEyebrow: (n: number) => `Zertifikate · ${n}`,
    emptyTitle: "Das Regal ist noch leer – vorerst.",
    emptyBody:
      "Die nächste Runde von Zertifizierungen rund um KI, Sicherheit und Cloud ist in Planung. Sobald die erste läuft, erscheint sie hier mit Fortschritt und Roadmap.",
    statusCompleted: "Abgeschlossen",
    statusInProgress: "In Arbeit",
    statusPlanned: "Geplant",
    lifetime: "Unbefristet",
    certWindow: "Zeitfenster",
    certHours: "Stunden",
    certCost: "Kosten",
    certDifficulty: "Schwierigkeit",
    certDifficultyAria: (n: number) => `${n} von 5`,
    certWhy: "Warum es wichtig ist",
    certViewCredential: "Nachweis ansehen",
    certIssued: (month: string) => `Ausgestellt ${month}`,
    certWindowValue: (start: string, end: string) =>
      end ? `${start} – ${end}` : start,
    certMeta: (provider: string, category: string) =>
      [provider, category].filter(Boolean).join(" · "),
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "Was als Nächstes ansteht.",
    roadmapHeading: (n: number) =>
      `${n} ${plural(n, "Zertifikat", "Zertifikate")} geplant`,
    roadmapAxis: "Zeitstrahl",
    roadmapToday: "Heute",
    roadmapMonthIndex: (n: number) => `M${n}`,
    roadmapBar: (months: number, label: string) =>
      `${months} ${plural(months, "Mt.", "Mt.")} · ${label}`,
    roadmapRange: (start: string, end: string) => `${start} – ${end}`,
    roadmapRowMeta: (status: string, start: string, end: string) =>
      `${status}${start ? ` · ${start}` : ""}${end ? ` – ${end}` : ""}`,
  },

  // English-only routes (/packages, blog and release notes of the packages): reused as is.
  pkgBlog: copy.pkgBlog,
  releaseNotes: copy.releaseNotes,

  notFound: {
    title: "Seite nicht gefunden",
    body: "Diese Seite existiert nicht oder wurde verschoben.",
    home: "Zurück zur Startseite",
    code: "404",
  },

  // English-only route (package shop): never translated.
  // Only the imprint headings are German: the portfolio's /de/impressum page reads
  // them from this section (shared with the English imprint).
  packages: {
    ...copy.packages,
    imprintLabel: "Rechtliches",
    imprintTitle: "Impressum",
    imprintSubtitle: "Wer für diese Website verantwortlich ist.",
  },

  privacy: {
    label: "Datenschutz",
    title: "Datenschutz",
    subtitle: "Wie über diese Website übermittelte Daten verarbeitet werden.",
  },

  // English-only route (pitch generator): reused as is.
  pitch: copy.pitch,

  chat: {
    open: "Chat öffnen – fragen Sie mich alles",
    dialogLabel: "Chat mit Seyas KI-Assistent",
    title: "Seyas KI-Assistent",
    subtitle: "Antwortet in der Regel sofort",
    close: "Chat schliessen",
    greeting:
      "Hallo! Ich bin Seyas KI-Assistent. Fragen Sie mich alles zu seiner Arbeit, seinen Projekten oder seiner Verfügbarkeit.",
    error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    inputLabel: "Nachricht",
    inputPlaceholder: "Nachricht schreiben…",
    send: "Nachricht senden",
    typing: "Assistent schreibt",
  },

  deepDive: {
    toggle: "Technischer Deep Dive",
    generated: "KI-generierte Analyse",
    loading: "Analyse wird geladen…",
    error: "Die Details konnten nicht geladen werden.",
    retry: "Erneut versuchen",
  },

  // English-only routes (admin login): reused as is.
  auth: copy.auth,
}
