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
    skills: "Fähigkeiten",
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
    loading: "Wird geladen…",
    back: "Zurück",
    current: "Aktuell",
    recommended: "Empfohlen",
    locationFallback: "Bichwil SG, Ostschweiz",
    coreSentence:
      "Weber Development entwickelt Individualsoftware und Automatisierungen für KMU in der Ostschweiz. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    coreSentenceShort:
      "Individualsoftware und Automatisierungen für KMU in der Ostschweiz.",
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
        category: "Projektleitung",
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
    label: "Kalibrierung",
    ready: "Bereit",
  },

  home: {
    availabilityFallback: "Verfügbar für Projekte",
    heroHeadline: "Weber Development",
    heroOffer: "Individualsoftware und Automatisierungen für KMU in der Ostschweiz.",
    heroPerson:
      "Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    introEyebrow: "Kurz gesagt",
    introLead:
      "Ich übersetze komplexe betriebliche Anforderungen in schlanke, wartbare Software. Weil ich auf beiden Seiten ausgebildet bin, verstehe ich die Anforderung ebenso gut wie das System, das sie erfüllen muss.",
    introBody:
      "Mein Weg führte über Elektroplanung, Energieoptimierung, Medizintechnik und SaaS-Entwicklung. Diese Breite ist der Grund, weshalb ich meist die Übersetzung zwischen Fachseite und Technik übernehme.",
    currentRole: (role: string, company: string) => `Aktuell · ${role} bei ${company}`,
    selectedWork: "Ausgewählte Arbeiten",
    selectedWorkEyebrow: "Ausgewählte Arbeiten",
    expertise: "Kompetenzen",
    expertiseEyebrow: (n: number) => `Kompetenzen · ${n} ${plural(n,"Bereich","Bereiche")}`,
    experience: "Erfahrung",
    experienceEyebrow: (n: number, since?: number) => `Werdegang · ${n} ${plural(n,"Station","Stationen")}${since?` · seit ${since}`:""}`,
    fullCareer: "Ganzer Werdegang",
    testimonialEyebrow: "Referenz",
    testimonials: "Was Partner sagen",
    readCaseStudy: "Fallstudie lesen",
    writing: "Beiträge",
    metricProjects: "Umgesetzte Projekte",
    metricEmployers: "Arbeitgeber",
    metricSince: "im Beruf",
    metricSinceValue: (year: number) => `seit ${year}`,
    introHeading: "Einleitung",
    selectedWorkEyebrowCount: (n: number) => `Ausgewählte Arbeiten · ${n} ${plural(n,"Projekt","Projekte")}`,
    writingEyebrow: (n: number) => `Beiträge · ${n}`,
    heroTaglineLead: "Aus Anforderungen",
    heroTaglineSub: "wird Software",
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
    careerSub: (since?: number) => since?`im Beruf seit ${since}`:"und es geht weiter",
    referenceLabel: "Referenz",
    referenceSub: "in eigenen Worten",
    writingLabel: "Beiträge",
    writingTitle: "Notizen aus der Praxis",
    writingSub: "zu Umsetzung und Engineering",
    ctaEyebrow: "Von der Idee zur Umsetzung",
    ctaTitle: "Haben Sie ein Projekt vor?",
    ctaButton: "Kontakt aufnehmen",
  },

  announcement: {
    text: "Neu: packages.sweber.dev",
  },

  projects: {
    label: (n: number) => n>0?`${n} ${plural(n,"Projekt","Projekte")}`:"Arbeiten",
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
    itemMeta: (index: string, category: string) => category?`${index} · ${category}`:index,
  },

  blog: {
    label: (n: number) => `${n} ${plural(n,"Beitrag","Beiträge")}`,
    title: "Beiträge",
    subtitle:
      "Notizen zu Softwareentwicklung, Projektabwicklung und Digitalisierung.",
    empty: "Noch keine Beiträge veröffentlicht.",
    externalLabel: "Packages",
    allArticles: "Alle Beiträge",
    previousArticle: "Vorheriger Beitrag",
    nextArticle: "Nächster Beitrag",
    taggedEyebrow: (n: number) => `Schlagwort · ${n}`,
    writtenBy: "Verfasst von",
  },

  // English-only route: reused as is.
  caseStudies: copy.caseStudies,

  experience: {
    label: (n: number, since?: number) => n===0?"Werdegang":`${n} ${plural(n,"Station","Stationen")}${since?` · seit ${since}`:""}`,
    title: "Erfahrung",
    subtitle: "Mein Weg durch Softwareentwicklung, Projektleitung und Engineering.",
    empty: "Noch keine Stationen.",
  },

  about: {
    label: "Über mich",
    title: "Über mich",
    subtitle:
      "Weber Development entwickelt Individualsoftware und Automatisierungen für KMU in der Ostschweiz. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG.",
    factLocation: "Standort",
    factExperience: "Erfahrung",
    factFocus: "Schwerpunkt",
    factLanguages: "Sprachen",
    expertise: "Kompetenzen",
    expertiseSub: "Womit ich arbeite, nach Bereich geordnet.",
    educationSub: "Formale Ausbildung und die Stationen auf dem Weg.",
    expertiseEyebrow: (n: number) => `Kompetenzen · ${n} ${plural(n,"Bereich","Bereiche")}`,
    skills: "Fähigkeiten",
    skillsEyebrow: (groups: number, total: number) => `${groups} ${plural(groups,"Kategorie","Kategorien")} · ${total} ${plural(total,"Fähigkeit","Fähigkeiten")}`,
    skillsEmpty: "Fähigkeiten werden im Admin gepflegt und erscheinen hier nach Kategorie.",
    career: "Werdegang",
    education: "Ausbildung",
    educationEyebrow: (n: number) => `Ausbildung · ${n} ${plural(n,"Station","Stationen")}`,
    ctaTitle: "Möchten Sie zusammenarbeiten?",
    ctaBody: "Ich bin offen für neue Projekte und Kooperationen.",
    getInTouch: "Kontakt aufnehmen",
    portraitAlt: "Seya Weber, Projektleitung und Softwareentwicklung",
    factLocationValue: "Bichwil SG, CH",
    factExperienceValue: "3+ Jahre",
    factFocusValue: "Automatisierung & Projektleitung",
    factLanguagesValue: "DE, EN, FR",
    bio: [
      "Ich leite bei Telsonic Projekte für Software und Digitalisierung und baue dort massgeschneiderte Automatisierungs-Workflows in geschäftskritischen Systemen. Daneben führe ich Weber Development und entwickle Individualsoftware für verschiedene Unternehmen.",
      "Ausgebildet in Softwareentwicklung und Elektroplanung, übersetze ich komplexe betriebliche Anforderungen in klare Spezifikationen, schlanke Prozesse und wartbare Lösungen. Mein Weg führte über Elektroplanung, Energieoptimierung für das Portfolio einer Schweizer Bank und Datenmigration im Gesundheitswesen bis zur heutigen Arbeit in industrieller Automatisierung und SaaS-Produktentwicklung.",
      "Ich baue Lösungen, die nicht nur das aktuelle Problem lösen, sondern mit dem Unternehmen mitwachsen. Weil ich sowohl entwickle als auch Projekte leite, übersetze ich zwischen technischer Umsetzung und betrieblichen Zielen.",
    ],
    uncategorised: "Ohne Kategorie",
    skillDetailLoading: "Details werden geladen…",
    skillDetailFallback:
      "In verschiedenen Projekten eingesetzt. Details finden Sie unter Projekte.",
  },

  services: {
    label: "Leistungen",
    title: "Leistungen",
    subtitle:
      "Komplexe Vorhaben von der Idee bis zur Wirkung, mit der richtigen Mischung aus Strategie und Umsetzung.",
    packageEyebrow: (n: number) => `Leistung ${String(n).padStart(2,"0")}`,
    enquire: "Anfragen",
    modelsEyebrow: (n: number) => `Zusammenarbeit · ${n} ${plural(n,"Modell","Modelle")}`,
    models: "Formen der Zusammenarbeit",
    modelsSub: "Drei Möglichkeiten, zusammenzuarbeiten.",
    ctaTitle: "Passt eines davon?",
    ctaBody: "Schildern Sie mir kurz, worum es geht. Ich antworte innert 24 Stunden.",
    startConversation: "Gespräch starten",
    packages: [
      {
        // TODO(Seya): decide whether service names stay English or are translated.
        title: "Projektleitung",
        description:
          "Projektleitung auf Zeit für Digitalisierungsprogramme, komplexe Migrationen und Automatisierungsvorhaben.",
        outcomes: [
          "Klarer Umfang, Roadmap und Abstimmung mit allen Beteiligten",
          "Risiken und Abhängigkeiten über Teams hinweg im Griff",
          "Ein Reporting-Rhythmus, der zur Führungsebene passt",
        ],
      },
      {
        title: "Umsetzung",
        description:
          "Hands-on Umsetzung: Aus validierten Konzepten werden produktionsreife Tools und Workflows.",
        outcomes: [
          "Schnelle Proofs of Concept und MVPs",
          "Dokumentation und Schulung für eine saubere Übergabe",
          "QA-Unterstützung und Messpunkte für die laufende Verbesserung",
        ],
      },
      {
        title: "Prozess- und Produkt-Coaching",
        description:
          "Begleitung für Teams, die agile Methoden einführen, ihre Product Discovery schärfen und ihre Abläufe in der Umsetzung verbessern wollen.",
        outcomes: [
          "Vorgehensmodelle für Discovery und Umsetzung, die Ihr Team selbst betreibt",
          "Vorlagen, Checklisten und Playbooks, damit es wiederholbar wird",
          "Coaching im Arbeitsalltag, damit neue Gewohnheiten halten",
        ],
      },
    ],
    engagementModels: [
      {
        title: "Projektbasiert",
        description: "Fester Umfang mit definierten Meilensteinen und Lieferergebnissen.",
        recommended: false,
      },
      {
        title: "Retainer",
        description:
          "Laufende Beratung und Umsetzung für Teams, die eine feste Ansprechperson auf Abruf wünschen.",
        recommended: true,
      },
      {
        title: "Workshops",
        description:
          "Fokussierte Termine, um Entscheidungen zu klären, Discovery zu moderieren oder das interne Team zu befähigen.",
        recommended: false,
      },
    ],
  },

  contact: {
    label: "Kontakt",
    title: "Kontakt aufnehmen",
    subtitle:
      "Ein Projekt vor oder eine Stelle zu besetzen? Schreiben Sie mir, ich antworte innert 24 Stunden.",
    email: "E-Mail",
    phone: "Telefon",
    location: "Standort",
    // TODO(Seya): confirm the service area before launch.
    serviceArea:
      "Wil, Uzwil, Gossau, St. Gallen und die ganze Ostschweiz, remote in der ganzen Schweiz.",
    responseTime: "Antwortzeit",
    responseValue: "Innert 24 Stunden",
    form: {
      name: "Name *",
      namePlaceholder: "Vor- und Nachname",
      email: "E-Mail *",
      emailPlaceholder: "vorname.name@example.com",
      company: "Firma",
      companyPlaceholder: "Optional",
      projectType: "Projektart *",
      projectTypePlaceholder: "Projektart wählen",
      budget: "Budgetrahmen",
      budgetPlaceholder: "Rahmen wählen",
      timeline: "Zeitrahmen",
      timelinePlaceholder: "Bis wann soll es fertig sein?",
      // `value` is the wire format of the contact API: keep identical to English.
      projectTypeOptions: [
        { value: "automation", label: "Prozessautomatisierung" },
        { value: "web-development", label: "Webentwicklung" },
        { value: "data-integration", label: "Datenintegration" },
        { value: "consulting", label: "Technische Beratung" },
        { value: "other", label: "Sonstiges" },
      ],
      budgetOptions: [
        { value: "under-10k", label: "< CHF 10’000" },
        { value: "10k-25k", label: "CHF 10’000 – 25’000" },
        { value: "25k-50k", label: "CHF 25’000 – 50’000" },
        { value: "50k-plus", label: "CHF 50’000+" },
        { value: "discuss", label: "Nach Absprache" },
      ],
      timelineOptions: [
        { value: "asap", label: "So bald wie möglich" },
        { value: "1-month", label: "Innert eines Monats" },
        { value: "3-months", label: "Innert 3 Monaten" },
        { value: "6-months", label: "Innert 6 Monaten" },
        { value: "flexible", label: "Flexibel" },
      ],
      message: "Nachricht *",
      messagePlaceholder:
        "Worum geht es? Ausgangslage, Ziele und konkrete Anforderungen, soweit bekannt.",
      submit: "Nachricht senden",
      submitting: "Wird gesendet…",
      analysisTitle: "KI-Einschätzung zur Anfrage",
      analysisLoading: "Analyse läuft…",
      messageCount: (n: number, max: number) => `${n}/${max}`,
      privacyLead:
        "Mit dem Absenden stimmen Sie zu, dass Ihre Angaben zur Beantwortung Ihrer Anfrage bearbeitet werden.",
      privacyLink: "Datenschutzerklärung",
      privacyTail: "Details in der",
      successTitle: "Nachricht gesendet",
      successBody: "Danke für Ihre Nachricht. Ich melde mich innert 24 Stunden bei Ihnen.",
      errors: {
        nameRequired: "Bitte geben Sie Ihren Namen an",
        nameShort: "Der Name muss mindestens 2 Zeichen haben",
        emailRequired: "Bitte geben Sie Ihre E-Mail-Adresse an",
        emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        projectTypeRequired: "Bitte wählen Sie eine Projektart",
        messageRequired: "Bitte schreiben Sie eine Nachricht",
        messageShort: "Die Nachricht muss mindestens 10 Zeichen haben",
        sendFailed: "Die Nachricht konnte nicht gesendet werden.",
        generic: "Etwas ist schiefgelaufen. Schreiben Sie mir direkt an info@sweber.dev.",
      },
    },
  },

  career: {
    label: (work: number, education: number) => {const parts=[];if(work>0)parts.push(`${work} ${plural(work,"Stelle","Stellen")}`);if(education>0)parts.push(`${education} ${plural(education,"Abschluss","Abschlüsse")}`);return parts.length>0?parts.join(" · "):"Werdegang"},
    title: "Werdegang",
    subtitle:
      "Beruf und Ausbildung nebeneinander. Während beider Lehren liefen sie parallel, deshalb gehören sie auf eine Achse und nicht auf zwei Seiten.",
    timelineEyebrow: (from: number, to: number) => `Zeitstrahl · ${from}–${to}`,
    timelineTitle: "Der ganze Weg",
    timelineSub: "Beruf und Ausbildung auf einer Achse.",
    timelineHint:
      "Fahren Sie über einen Balken oder fokussieren Sie ihn, um den Eintrag hervorzuheben. Ein Klick springt dorthin.",
    timelineLabel: (from: number, to: number) => `Zeitstrahl des Werdegangs von ${from} bis ${to}, in zwei Spuren: Beruf und Ausbildung`,
    barLabel: (title: string, subtitle: string, period: string) => subtitle?`${title}, ${subtitle}, ${period}`:`${title}, ${period}`,
    laneWork: "Beruf",
    laneEducation: "Ausbildung",
    planned: "Geplant",
    empty: "Noch nichts vorhanden.",
    emptyTitle: "Der Zeitstrahl wird noch befüllt.",
    emptyBody:
      "Stellen und Abschlüsse werden im Admin gepflegt und erscheinen hier auf einer Achse.",
  },

  education: {
    title: "Ausbildung",
    subtitle: "Mein Ausbildungsweg und die Zertifikate, die den weiteren Weg markieren.",
    academicBackground: "Ausbildungsweg",
    credentials: "Zertifikate & Roadmap",
    credentialsSub: "Was abgeschlossen ist, was läuft und was als Nächstes kommt.",
    empty: "Noch nichts vorhanden.",
    label: (stations: number, certificates: number) => {const parts=[];if(stations>0)parts.push(`${stations} ${plural(stations,"Station","Stationen")}`);if(certificates>0)parts.push(`${certificates} ${plural(certificates,"Zertifikat","Zertifikate")}`);return parts.length>0?parts.join(" · "):"Ausbildung"},
    academicEyebrow: (n: number) => `Ausbildung · ${n} ${plural(n,"Station","Stationen")}`,
    credentialsEyebrow: (n: number) => `Zertifikate · ${n}`,
    emptyTitle: "Noch ist das Regal leer.",
    emptyBody:
      "Die nächste Runde Zertifizierungen rund um KI, Security und Cloud ist in Planung. Sobald die erste läuft, erscheint sie hier mit Fortschritt und Roadmap.",
    statusCompleted: "Abgeschlossen",
    statusInProgress: "Laufend",
    statusPlanned: "Geplant",
    lifetime: "Unbefristet",
    certWindow: "Zeitfenster",
    certHours: "Stunden",
    certCost: "Kosten",
    certDifficulty: "Schwierigkeit",
    certDifficultyAria: (n: number) => `${n} von 5`,
    certWhy: "Warum es zählt",
    certViewCredential: "Zertifikat ansehen",
    certIssued: (month: string) => `Ausgestellt ${month}`,
    certWindowValue: (start: string, end: string) => end?`${start} – ${end}`:start,
    certMeta: (provider: string, category: string) => [provider,category].filter(Boolean).join(" · "),
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "Was als Nächstes dran ist.",
    roadmapHeading: (n: number) => `${n} ${plural(n,"Zertifikat","Zertifikate")} geplant`,
    roadmapAxis: "Zeitachse",
    roadmapToday: "Heute",
    roadmapMonthIndex: (n: number) => `M${n}`,
    roadmapBar: (months: number, label: string) => `${months} ${plural(months,"Mt.","Mt.")} · ${label}`,
    roadmapRange: (start: string, end: string) => `${start} – ${end}`,
    roadmapRowMeta: (status: string, start: string, end: string) => `${status}${start?` · ${start}`:""}${end?` – ${end}`:""}`,
  },

  // English-only routes (/packages, blog and release notes of the packages): reused as is.
  pkgBlog: copy.pkgBlog,
  releaseNotes: copy.releaseNotes,

  notFound: {
    title: "Seite nicht gefunden",
    body: "Diese Seite gibt es nicht oder sie ist umgezogen.",
    home: "Zur Startseite",
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
    subtitle: "So werden Daten bearbeitet, die Sie über diese Website senden.",
  },

  // English-only route (pitch generator): reused as is.
  pitch: copy.pitch,

  chat: {
    open: "Chat öffnen und Fragen stellen",
    dialogLabel: "Chat mit Seyas KI-Assistent",
    title: "Seyas KI-Assistent",
    subtitle: "Antwortet meist sofort",
    close: "Chat schliessen",
    greeting:
      "Hallo, ich bin Seyas KI-Assistent. Fragen Sie mich zu Arbeit, Projekten oder Verfügbarkeit.",
    error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es noch einmal.",
    inputLabel: "Nachricht",
    inputPlaceholder: "Ihre Nachricht",
    send: "Nachricht senden",
    typing: "Assistent schreibt",
  },

  deepDive: {
    toggle: "Technische Vertiefung",
    generated: "KI-generierte Analyse",
    loading: "Analyse wird geladen…",
    error: "Die Details konnten nicht geladen werden.",
    retry: "Noch einmal versuchen",
  },

  // English-only routes (admin login): reused as is.
  auth: copy.auth,
}
