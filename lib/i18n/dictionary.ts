export type SupportedLanguage = "en" | "de" | "fr" | "it" | "es"

type TranslationDictionary = Record<SupportedLanguage, Record<string, string>>

const normalizeKey = (value: string): string => value.replace(/\s+/g, " ").trim().toLowerCase()

const createDictionary = (entries: TranslationDictionary): TranslationDictionary => {
  const normalized: TranslationDictionary = {
    en: {},
    de: {},
    fr: {},
    it: {},
    es: {},
  }

  ;(Object.keys(entries) as SupportedLanguage[]).forEach((language) => {
    const map = entries[language]
    normalized[language] = Object.fromEntries(
      Object.entries(map).map(([key, value]) => [normalizeKey(key), value]),
    )
  })

  return normalized
}

export const TRANSLATION_DICTIONARY = createDictionary({
  en: {
    "": "",
  },
  de: {
    "home": "Startseite",
    "about": "Über mich",
    "experience": "Erfahrung",
    "projects": "Projekte",
    "case studies": "Fallstudien",
    "services": "Dienstleistungen",
    "blog": "Blog",
    "education": "Ausbildung",
    "skills": "Fähigkeiten",
    "contact": "Kontakt",
    "get in touch": "Kontakt aufnehmen",
    "view projects": "Projekte ansehen",
    "projects completed": "Abgeschlossene Projekte",
    "years experience": "Jahre Erfahrung",
    "client satisfaction": "Kundenzufriedenheit",
    "about me": "Über mich",
    "learn more about my background and passion for technology.":
      "Erfahren Sie mehr über meinen Hintergrund und meine Leidenschaft für Technologie.",
    "discover the projects i've worked on and their impact.":
      "Entdecken Sie die Projekte, an denen ich gearbeitet habe, und ihren Einfluss.",
    "browse detailed case studies showcasing measurable outcomes.":
      "Stöbern Sie in detaillierten Fallstudien mit messbaren Ergebnissen.",
    "explore all projects": "Alle Projekte erkunden",
    "view full case studies": "Alle Fallstudien anzeigen",
    "latest writing": "Aktuelle Beiträge",
    "read more": "Weiterlesen",
    "featured testimonials": "Ausgewählte Testimonials",
    "what clients say": "Was Kund:innen sagen",
    "digital transformation leadership": "Digitale Transformationsführung",
    "product & delivery coaching": "Produkt- & Delivery-Coaching",
    "technical implementation": "Technische Umsetzung",
    "fractional leadership for complex software migrations, workflow automation, and cross-team programs with measurable outcomes.":
      "Teilzeit-Führung für komplexe Software-Migrationen, Workflow-Automatisierung und bereichsübergreifende Programme mit messbaren Ergebnissen.",
    "hands-on support to align discovery, delivery, and stakeholder communication so your roadmap ships on time and on budget.":
      "Praktische Unterstützung, um Discovery, Delivery und Stakeholder-Kommunikation auszurichten – damit Ihre Roadmap pünktlich und im Budget bleibt.",
    "execution for .net, c#, and automation initiatives—from proof of concept to production with documentation and training.":
      "Umsetzung für .NET-, C#- und Automatisierungsprojekte – von Proof-of-Concept bis Produktion inklusive Dokumentation und Schulung.",
    "hi, i'm seya weber": "Hallo, ich bin Seya Weber",
    "project manager software and digitalisation and founder / owner of weber development in st. gallen, switzerland.":
      "Projektmanagerin für Software und Digitalisierung sowie Gründerin und Inhaberin von Weber Development in St. Gallen, Schweiz.",
    "st. gallen, switzerland": "St. Gallen, Schweiz",
    "quick facts": "Kurzinfos",
    "location": "Standort",
    "experience label": "Erfahrung",
    "focus": "Schwerpunkt",
    "languages": "Sprachen",
    "connect": "Vernetzen",
    "email": "E-Mail",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "call": "Anrufen",
    "featured projects": "Ausgewählte Projekte",
    "a snapshot of multidisciplinary engagements that span software delivery, automation, and operations.":
      "Ein Einblick in multidisziplinäre Projekte aus Softwarebereitstellung, Automatisierung und Betrieb.",
    "services at a glance": "Dienstleistungen im Überblick",
    "partner with me for strategy, delivery, and implementation support tailored to your product or transformation initiative.":
      "Partnerschaft für Strategie, Delivery und Umsetzung – maßgeschneidert für Ihr Produkt oder Transformationsvorhaben.",
    "view case details": "Projektdetails ansehen",
    "what partners say": "Was Partner sagen",
    "real feedback from engagements across healthcare, finance, and residential projects.":
      "Echtes Feedback aus Projekten im Gesundheitswesen, in der Finanzbranche und im Wohnbau.",
    "read the full story": "Zur vollständigen Story",
    "latest writing": "Aktuelle Beiträge",
    "essays and notes on moving complex initiatives from idea to production without losing momentum.":
      "Essays und Gedanken darüber, wie komplexe Initiativen vom Konzept bis in den Betrieb ohne Tempoverlust gelangen.",
    "visit the blog": "Zum Blog",
    "read article": "Artikel lesen",
  },
  fr: {
    "home": "Accueil",
    "about": "À propos",
    "experience": "Expérience",
    "projects": "Projets",
    "case studies": "Études de cas",
    "services": "Services",
    "blog": "Blog",
    "education": "Formation",
    "skills": "Compétences",
    "contact": "Contact",
    "get in touch": "Me contacter",
    "view projects": "Voir les projets",
    "projects completed": "Projets réalisés",
    "years experience": "Années d'expérience",
    "client satisfaction": "Satisfaction client",
    "about me": "À propos de moi",
    "learn more about my background and passion for technology.":
      "Découvrez mon parcours et ma passion pour la technologie.",
    "discover the projects i've worked on and their impact.":
      "Découvrez les projets sur lesquels j'ai travaillé et leur impact.",
    "browse detailed case studies showcasing measurable outcomes.":
      "Parcourez des études de cas détaillées présentant des résultats mesurables.",
    "explore all projects": "Explorer tous les projets",
    "view full case studies": "Voir toutes les études de cas",
    "latest writing": "Derniers articles",
    "read more": "En savoir plus",
    "featured testimonials": "Témoignages",
    "what clients say": "Ce que disent les clients",
    "digital transformation leadership": "Direction de la transformation numérique",
    "product & delivery coaching": "Coaching produit et livraison",
    "technical implementation": "Mise en œuvre technique",
    "fractional leadership for complex software migrations, workflow automation, and cross-team programs with measurable outcomes.":
      "Leadership fractionné pour des migrations logicielles complexes, l'automatisation des flux de travail et des programmes inter-équipes avec des résultats mesurables.",
    "hands-on support to align discovery, delivery, and stakeholder communication so your roadmap ships on time and on budget.":
      "Support opérationnel pour aligner discovery, delivery et communication des parties prenantes afin de livrer votre feuille de route dans les délais et le budget.",
    "execution for .net, c#, and automation initiatives—from proof of concept to production with documentation and training.":
      "Exécution des projets .NET, C# et d'automatisation – du proof of concept à la production avec documentation et formation.",
    "hi, i'm seya weber": "Bonjour, je suis Seya Weber",
    "project manager software and digitalisation and founder / owner of weber development in st. gallen, switzerland.":
      "Cheffe de projet logiciels et digitalisation et fondatrice/propriétaire de Weber Development à Saint-Gall, Suisse.",
    "st. gallen, switzerland": "Saint-Gall, Suisse",
    "quick facts": "Infos rapides",
    "location": "Localisation",
    "experience label": "Expérience",
    "focus": "Spécialité",
    "languages": "Langues",
    "connect": "Réseaux",
    "email": "E-mail",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "call": "Appeler",
    "featured projects": "Projets à la une",
    "a snapshot of multidisciplinary engagements that span software delivery, automation, and operations.":
      "Un aperçu d'engagements pluridisciplinaires alliant livraison logicielle, automatisation et opérations.",
    "services at a glance": "Services en un coup d'œil",
    "partner with me for strategy, delivery, and implementation support tailored to your product or transformation initiative.":
      "Collaborons pour la stratégie, la livraison et l'implémentation adaptées à votre produit ou projet de transformation.",
    "view full services": "Voir tous les services",
    "view case details": "Voir les détails",
    "what partners say": "Ce que disent les partenaires",
    "real feedback from engagements across healthcare, finance, and residential projects.":
      "Des retours concrets issus de missions dans la santé, la finance et l'immobilier résidentiel.",
    "read the full story": "Lire l'histoire complète",
    "latest writing": "Derniers articles",
    "essays and notes on moving complex initiatives from idea to production without losing momentum.":
      "Essais et notes sur la façon de mener des initiatives complexes jusqu'en production sans perdre d'élan.",
    "visit the blog": "Visiter le blog",
    "read article": "Lire l'article",
  },
  it: {
    "home": "Home",
    "about": "Chi sono",
    "experience": "Esperienza",
    "projects": "Progetti",
    "case studies": "Casi di studio",
    "services": "Servizi",
    "blog": "Blog",
    "education": "Formazione",
    "skills": "Competenze",
    "contact": "Contatti",
    "get in touch": "Contattami",
    "view projects": "Guarda i progetti",
    "projects completed": "Progetti completati",
    "years experience": "Anni di esperienza",
    "client satisfaction": "Soddisfazione dei clienti",
    "about me": "Chi sono",
    "learn more about my background and passion for technology.":
      "Scopri di più sul mio percorso e sulla mia passione per la tecnologia.",
    "discover the projects i've worked on and their impact.":
      "Scopri i progetti a cui ho lavorato e il loro impatto.",
    "browse detailed case studies showcasing measurable outcomes.":
      "Consulta casi di studio dettagliati con risultati misurabili.",
    "explore all projects": "Esplora tutti i progetti",
    "view full case studies": "Vedi tutti i casi di studio",
    "latest writing": "Ultimi articoli",
    "read more": "Leggi di più",
    "featured testimonials": "Testimonianze",
    "what clients say": "Cosa dicono i clienti",
    "digital transformation leadership": "Leadership nella trasformazione digitale",
    "product & delivery coaching": "Coaching prodotto e delivery",
    "technical implementation": "Implementazione tecnica",
    "fractional leadership for complex software migrations, workflow automation, and cross-team programs with measurable outcomes.":
      "Leadership part-time per migrazioni software complesse, automazione dei flussi di lavoro e programmi interfunzionali con risultati misurabili.",
    "hands-on support to align discovery, delivery, and stakeholder communication so your roadmap ships on time and on budget.":
      "Supporto operativo per allineare discovery, delivery e comunicazione con gli stakeholder, garantendo roadmap puntuali e in linea con il budget.",
    "execution for .net, c#, and automation initiatives—from proof of concept to production with documentation and training.":
      "Esecuzione di iniziative .NET, C# e automazione – dal proof of concept alla produzione con documentazione e formazione.",
    "hi, i'm seya weber": "Ciao, sono Seya Weber",
    "project manager software and digitalisation and founder / owner of weber development in st. gallen, switzerland.":
      "Project Manager software e digitalizzazione e fondatrice/proprietaria di Weber Development a San Gallo, Svizzera.",
    "st. gallen, switzerland": "San Gallo, Svizzera",
    "quick facts": "Informazioni rapide",
    "location": "Località",
    "experience label": "Esperienza",
    "focus": "Focus",
    "languages": "Lingue",
    "connect": "Contatti",
    "email": "E-mail",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "call": "Chiama",
    "featured projects": "Progetti in evidenza",
    "a snapshot of multidisciplinary engagements that span software delivery, automation, and operations.":
      "Uno sguardo a progetti multidisciplinari che coprono delivery software, automazione e operations.",
    "services at a glance": "Servizi in sintesi",
    "partner with me for strategy, delivery, and implementation support tailored to your product or transformation initiative.":
      "Collabora con me per strategia, delivery e implementazione su misura per il tuo prodotto o iniziativa di trasformazione.",
    "view full services": "Vedi tutti i servizi",
    "view case details": "Vedi i dettagli",
    "what partners say": "Cosa dicono i partner",
    "real feedback from engagements across healthcare, finance, and residential projects.":
      "Feedback reale da progetti in sanità, finanza e residenziale.",
    "read the full story": "Leggi l'intera storia",
    "latest writing": "Ultimi articoli",
    "essays and notes on moving complex initiatives from idea to production without losing momentum.":
      "Saggi e appunti su come portare iniziative complesse dall'idea alla produzione senza perdere slancio.",
    "visit the blog": "Visita il blog",
    "read article": "Leggi l'articolo",
  },
  es: {
    "home": "Inicio",
    "about": "Sobre mí",
    "experience": "Experiencia",
    "projects": "Proyectos",
    "case studies": "Casos de estudio",
    "services": "Servicios",
    "blog": "Blog",
    "education": "Formación",
    "skills": "Habilidades",
    "contact": "Contacto",
    "get in touch": "Contactar",
    "view projects": "Ver proyectos",
    "projects completed": "Proyectos completados",
    "years experience": "Años de experiencia",
    "client satisfaction": "Satisfacción del cliente",
    "about me": "Sobre mí",
    "learn more about my background and passion for technology.":
      "Conoce mi trayectoria y mi pasión por la tecnología.",
    "discover the projects i've worked on and their impact.":
      "Descubre los proyectos en los que he trabajado y su impacto.",
    "browse detailed case studies showcasing measurable outcomes.":
      "Explora estudios de caso detallados con resultados medibles.",
    "explore all projects": "Explorar todos los proyectos",
    "view full case studies": "Ver todos los casos de estudio",
    "latest writing": "Últimos artículos",
    "read more": "Leer más",
    "featured testimonials": "Testimonios",
    "what clients say": "Lo que dicen los clientes",
    "digital transformation leadership": "Liderazgo en transformación digital",
    "product & delivery coaching": "Coaching de producto y entrega",
    "technical implementation": "Implementación técnica",
    "fractional leadership for complex software migrations, workflow automation, and cross-team programs with measurable outcomes.":
      "Liderazgo fraccionado para migraciones de software complejas, automatización de flujos de trabajo y programas interequipos con resultados medibles.",
    "hands-on support to align discovery, delivery, and stakeholder communication so your roadmap ships on time and on budget.":
      "Soporte práctico para alinear discovery, delivery y la comunicación con los stakeholders, garantizando entregas a tiempo y dentro del presupuesto.",
    "execution for .net, c#, and automation initiatives—from proof of concept to production with documentation and training.":
      "Ejecución de iniciativas .NET, C# y automatización, desde el proof of concept hasta la producción con documentación y formación.",
    "hi, i'm seya weber": "Hola, soy Seya Weber",
    "project manager software and digitalisation and founder / owner of weber development in st. gallen, switzerland.":
      "Project Manager de software y digitalización y fundadora/propietaria de Weber Development en St. Gallen, Suiza.",
    "st. gallen, switzerland": "San Galo, Suiza",
    "quick facts": "Datos rápidos",
    "location": "Ubicación",
    "experience label": "Experiencia",
    "focus": "Enfoque",
    "languages": "Idiomas",
    "connect": "Conectar",
    "email": "Correo",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "call": "Llamar",
    "featured projects": "Proyectos destacados",
    "a snapshot of multidisciplinary engagements that span software delivery, automation, and operations.":
      "Un vistazo a proyectos multidisciplinarios que abarcan entrega de software, automatización y operaciones.",
    "services at a glance": "Servicios de un vistazo",
    "partner with me for strategy, delivery, and implementation support tailored to your product or transformation initiative.":
      "Colabora conmigo para estrategia, entrega e implementación adaptadas a tu producto o iniciativa de transformación.",
    "view full services": "Ver todos los servicios",
    "view case details": "Ver detalles",
    "what partners say": "Lo que dicen los socios",
    "real feedback from engagements across healthcare, finance, and residential projects.":
      "Comentarios reales de proyectos en salud, finanzas y residencial.",
    "read the full story": "Leer la historia completa",
    "latest writing": "Últimos artículos",
    "essays and notes on moving complex initiatives from idea to production without losing momentum.":
      "Ensayos y notas sobre cómo llevar iniciativas complejas de la idea a la producción sin perder impulso.",
    "visit the blog": "Visitar el blog",
    "read article": "Leer artículo",
  },
})

export const translateFromDictionary = (language: SupportedLanguage, text: string): string | null => {
  if (!text) return text
  if (language === "en") return text
  const normalizedKey = normalizeKey(text)
  const entry = TRANSLATION_DICTIONARY[language]?.[normalizedKey]
  return entry ?? null
}

export const normalizeForLookup = normalizeKey
