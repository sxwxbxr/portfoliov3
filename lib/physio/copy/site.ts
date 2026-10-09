/**
 * Strings of the platform shell, the landing page and the privacy notice.
 * German (Swiss orthography: always "ss", never "ß"), informal "du".
 * A copywriter pass happens later; keep every user-visible string here.
 */

export const siteCopy = {
  brand: { name: "Physio Tools", byline: "by sweber.dev" },

  nav: {
    label: "Hauptnavigation",
    tools: "Tools",
    suggestions: "Vorschläge",
    plans: "Abo",
    login: "Anmelden",
    account: "Konto",
    menuOpen: "Menü",
    menuClose: "Schliessen",
  },

  /** The /tools hub, the shared tool frame, the paywall teaser and the account list. */
  tools: {
    meta: {
      title: "Tools",
      description:
        "Browser-Tools für das Physiotherapie-Studium, nach Kategorie sortiert. Die Demos sind frei, die Vollversionen im Abo.",
    },
    hero: {
      title: "Tools",
      sub: "für dein Physiotherapie-Studium.",
      lede: "Kleine Browser-Tools für Aufgaben, die im Studium immer wiederkommen. Die Demos sind für alle offen, die Vollversionen aller Tools sind im Abo enthalten.",
    },
    search: {
      label: "Tools durchsuchen",
      placeholder: "Name oder Thema, zum Beispiel PubMed",
      clear: "Suche leeren",
    },
    filters: {
      label: "Nach Kategorie filtern",
      all: "Alle",
    },
    count: (n: number) => (n === 1 ? "1 Tool" : `${n} Tools`),
    results: (n: number) => (n === 0 ? "Keine Tools gefunden." : n === 1 ? "1 Tool gefunden." : `${n} Tools gefunden.`),
    recent: {
      heading: "Zuletzt verwendet",
    },
    card: {
      new: "Neu",
      beta: "Beta",
      soon: "Bald",
      demo: "Demo",
      open: "Öffnen",
      openNamed: (name: string) => `${name} öffnen`,
      demoNamed: (name: string) => `Demo von ${name} ausprobieren`,
      paid: "Vollversion mit Abo, Demo frei",
      paidNoDemo: "Vollversion mit Abo",
      free: "Ohne Konto nutzbar",
      soonNote: "Angekündigt, noch nicht nutzbar.",
      tags: "Themen",
    },
    empty: {
      title: "Nichts gefunden",
      text: (q: string) => `Zu «${q}» gibt es noch kein Tool. Schlag es vor, dann sehe ich, was dir fehlt.`,
      textFiltered: "In dieser Kategorie gibt es noch kein Tool. Schlag eines vor, dann sehe ich, was dir fehlt.",
      suggest: "Tool vorschlagen",
      reset: "Suche und Filter zurücksetzen",
    },
    missing: {
      title: "Dein Tool fehlt?",
      text: "Beschreib die Aufgabe, die dich im Studium Zeit kostet. Ich lese jeden Vorschlag. Dass jede Idee zu einem Tool wird, kann ich nicht versprechen.",
      cta: "Tool vorschlagen",
    },
    frame: {
      breadcrumb: "Navigationspfad",
      home: "Tools",
      viewLabel: "Ansicht",
      demo: "Demo",
      full: "Vollversion",
    },
    paywall: {
      title: "Mit dem Abo freigeschaltet",
      whatHeading: "Was das Tool macht",
      demoLink: "Kostenlose Demo ausprobieren",
      aboLink: "Abo ansehen",
      loginLink: "Anmelden",
      loginHint: "Schon ein Abo? Dann melde dich an.",
      verifyHint: "Du bist angemeldet, hast aber noch kein aktives Abo.",
    },
    account: {
      heading: "Deine Tools",
      textActive: "Alle Tools sind in deinem Abo enthalten.",
      textInactive: "Ohne aktives Abo zeigt dir die Vollversion nur, was das Tool kann. Die Demos bleiben frei.",
      open: "Öffnen",
      demo: "Demo",
      all: "Alle Tools ansehen",
    },
  },

  footer: {
    privacy: "Datenschutz",
    imprint: "Impressum",
    main: "sweber.dev",
    note: "Ein unabhängiges Projekt von Seya Weber, nicht von einer Fachhochschule.",
  },

  landing: {
    metaTitle: "Physio Tools: Browser-Tools für das Physiotherapie-Studium",
    metaDescription:
      "Kleine Browser-Tools für das Physiotherapie-Studium. Der Suchstring-Generator baut aus deiner Fragestellung einen Suchstring für PubMed, Cochrane Library, CINAHL und Embase, mit Schlagworten (MeSH) und Stichworten.",
    eyebrow: "Für das Physiotherapie-Studium",
    title: "Frage rein,",
    titleSub: "Suchstring raus.",
    lede: "Der Suchstring-Generator zerlegt deine Fragestellung in Suchkomponenten, schlägt Schlagworte (MeSH) und Stichworte vor und schreibt den String für PubMed, die Cochrane Library, CINAHL und Embase. Anpassen und prüfen kannst du jeden Teil, bevor du kopierst.",
    ctaDemo: "Demo ausprobieren",
    ctaPlans: "Abo ansehen",
    ctaNote: "Die Demo braucht kein Konto.",

    preview: {
      /** Id of the example in lib/physio/search-string/examples.json that the hero renders with the real engine. */
      exampleId: "parkinson",
      caption: "Echtes Ergebnis des Tools für diese Frage. Ein Entwurf, den du vor der Verwendung prüfst.",
      questionLabel: "Deine Frage",
      componentsLabel: "Erkannte Suchkomponenten",
      stringLabel: "Suchstring für PubMed",
      legendMesh: "Schlagwort (MeSH)",
      legendTiab: "Stichwort in Titel und Abstract",
    },

    tools: {
      heading: "Tools",
      sub: "Die Demos sind frei, die Vollversionen sind im Abo enthalten.",
      demo: "Demo ausprobieren",
      open: "Tool öffnen",
      new: "Neu",
      highlights: {
        suchstring: [
          "Versteht deutsche und englische Fragen, am besten mit Population, Intervention, Vergleich und Outcome.",
          "Schreibt den String für PubMed, Cochrane Library, CINAHL und Embase, je in der Syntax der Datenbank.",
          "Kennt rund 17'000 MeSH-Schlagworte, etwa die Hälfte davon mit deutschen Bezeichnungen.",
          "Zählt auf Wunsch die Treffer in PubMed und prüft eigene Strings auf typische Fehler.",
          "Geführter Modus: acht Schritte durch deine Frage, von der Prüfung der Fragestellung bis zum Arbeitsblatt.",
        ] as string[],
      } as Record<string, string[]>,
      moreTitle: "Weitere Tools",
      moreText: "Was als Nächstes entsteht, richtet sich nach euren Vorschlägen. Die Aufgaben, die am häufigsten genannt werden, nehme ich zuerst dran.",
      moreCta: "Aufgabe vorschlagen",
      all: "Alle Tools ansehen",
    },

    how: {
      heading: "So funktioniert der Suchstring-Generator",
      sub: "Vier Schritte, und bei jedem entscheidest du.",
      items: [
        {
          title: "Frage eingeben",
          text: "Als Satz auf Deutsch oder Englisch, am besten mit Population, Intervention, Vergleich und Outcome, oder als PICO. Dann wählst du die Datenbanken.",
        },
        {
          title: "String kopieren",
          text: "Das Ergebnis zeigt den String, die erkannten Komponenten nach P, I, C und O und Hinweise zur Auswertung. Für PubMed zählt das Tool auf Wunsch die Treffer.",
        },
        {
          title: "Anpassen",
          text: "Komponenten, PICO-Felder, Filter, MeSH-Wörterbuch: alles optional, jede Änderung steht sofort im String. Für die Cochrane Library und CINAHL sagt dir das Tool, welche Filter du dort selbst einstellst.",
        },
        {
          title: "Gegenprüfen",
          text: "Schau dir die Trefferliste an, bevor du den String in einer Arbeit verwendest. Der geführte Modus geht den Weg mit dir Schritt für Schritt durch, bis zum Arbeitsblatt.",
        },
      ],
    },

    trust: {
      heading: "Worauf du dich verlassen kannst",
      items: [
        {
          title: "Läuft in deinem Browser",
          text: "Deine Frage bleibt auf deinem Gerät. Das Tool lädt nur Teile des MeSH-Wörterbuchs nach, und die Trefferzählung in PubMed startest du selbst; sie schickt nur den fertigen String.",
        },
        {
          title: "Regelbasiert, ohne KI",
          text: "Feste Regeln, das MeSH-Wörterbuch und eine eigene Begriffstabelle statt eines Sprachmodells. Das Tool erfindet keine Begriffe und keine Syntax: Was es für eine Datenbank nicht sicher weiss, sagt es dir. Das Ergebnis bleibt ein Entwurf, den du prüfst.",
        },
        {
          title: "Aus der Schweiz",
          text: "Ein unabhängiges Projekt von Seya Weber aus St. Gallen. Vorschläge landen direkt bei mir.",
        },
      ],
    },

    pricing: {
      heading: "Ein Abo, alle Tools",
      text: "Die Demos sind für alle offen. Für eigene Eingaben brauchst du ein Konto und das Abo, auch für Tools, die später dazukommen.",
      priceFallback: "Monatlich oder jährlich, bezahlt über Polar.sh. Die aktuellen Preise stehen auf der Abo-Seite.",
      points: [
        "Erst ausprobieren, dann freischalten.",
        "Du kündigst selbst im Kundenportal von Polar.",
        "Dein Zugang bleibt bis zum Ende der bezahlten Periode.",
      ],
      cta: "Zur Abo-Seite",
    },

    suggest: {
      heading: "Welches Tool fehlt dir?",
      text: "Beschreib die Aufgabe, die dich im Studium am meisten Zeit kostet. Ich lese jeden Vorschlag, und was oft gewünscht wird, kommt zuerst dran.",
      cta: "Tool vorschlagen",
    },
  },

  privacy: {
    metaTitle: "Datenschutz",
    metaDescription: "Welche Daten Physio Tools speichert, wer sie bearbeitet und wie du dein Konto löschst.",
    title: "Datenschutz",
    titleSub: "Physio Tools",
    updated: "Stand: Oktober 2026",
    intro:
      "Diese Erklärung gilt für physio.sweber.dev. Für die übrigen Seiten auf sweber.dev gilt die dortige Datenschutzerklärung. Wir halten das Schweizer Datenschutzgesetz (nDSG) ein und, soweit anwendbar, die DSGVO.",
    sections: [
      {
        heading: "Verantwortlich",
        paragraphs: [
          "Verantwortlich ist Seya Weber, St. Gallen, Schweiz. Die Kontaktangaben stehen im Impressum.",
        ],
      },
      {
        heading: "Welche Daten wir speichern",
        list: [
          "Konto: deine E-Mail-Adresse, dein Passwort als bcrypt-Hash (das Passwort selbst kennen wir nicht), der Zeitpunkt der E-Mail-Bestätigung und eine Sitzungsnummer, mit der wir bei einem Passwortwechsel alle Geräte abmelden.",
          "Abo: der Status deines Abos, gespiegelt von Polar (Kunden- und Abo-Kennung, Tarif, Ende der aktuellen Periode, ob gekündigt). Kartendaten sehen und speichern wir nicht.",
          "Vorschläge: der Text, den du im Formular einträgst, die gewählte Kategorie und, nur wenn du sie angibst, eine Kontakt-E-Mail für Rückfragen. Bist du angemeldet, kann der Vorschlag mit deinem Konto verknüpft werden.",
          "Sitzungs-Cookie: Nach dem Anmelden setzen wir das technisch notwendige Cookie physio_session (30 Tage, nicht für Skripte lesbar). Es dient nur dazu, dich angemeldet zu halten.",
          "Server-Protokolle: Beim Aufruf der Seiten verarbeiten unsere Hosting-Anbieter technisch bedingt deine IP-Adresse und Angaben zum Browser. Zum Schutz vor Missbrauch zählen wir ausserdem Anmelde-, Registrierungs- und Mailanfragen pro IP-Adresse kurzzeitig im Arbeitsspeicher.",
          "Reichweitenmessung: Die Seiten laden Vercel Web Analytics und Speed Insights. Beide arbeiten ohne Cookies und ohne Profile einzelner Personen.",
        ],
      },
      {
        heading: "Der Suchstring-Generator",
        paragraphs: [
          "Deine Fragestellung und die erzeugten Suchstrings verarbeitet der Suchstring-Generator in deinem Browser. Wir empfangen und speichern sie nicht. Das Tool lädt dafür Teile eines öffentlichen MeSH-Wörterbuchs von physio.sweber.dev nach; dein Browser fragt dabei Dateinamen wie «terms/lo.json» ab, nie deinen Text.",
          "Die Trefferzählung ist optional. Erst wenn du sie startest, schickt dein Browser den fertigen Suchstring (nicht deine Fragestellung) direkt an PubMed, einen Dienst der U.S. National Library of Medicine (NCBI, USA). Dasselbe gilt für «In PubMed öffnen». Für diese Abfragen gilt die Datenschutzerklärung des NCBI.",
        ],
      },
      {
        heading: "Wozu und auf welcher Grundlage",
        paragraphs: [
          "Konto, Abo und Anmeldung brauchen wir, um den Vertrag mit dir zu erfüllen (Art. 6 Abs. 1 lit. b DSGVO). Sicherheitsmassnahmen und Missbrauchsschutz beruhen auf unserem berechtigten Interesse (lit. f). Die Kontakt-E-Mail bei einem Vorschlag verwenden wir nur mit deiner Einwilligung (lit. a), die du jederzeit widerrufen kannst.",
          "Wir bearbeiten Daten nur für diese Zwecke, so sparsam wie möglich und nicht länger, als wir sie brauchen.",
        ],
      },
      {
        heading: "Wer die Daten bearbeitet",
        list: [
          "Vercel Inc., USA: Hosting der Plattform.",
          "Neon, Datenbank in der EU: Speicherung von Konto, Abo-Status und Vorschlägen.",
          "Polar.sh: Händler (Merchant of Record) für Zahlung, Rechnung und Mehrwertsteuer. Polar bearbeitet Zahlungs- und Rechnungsdaten in eigener Verantwortung, siehe deren Datenschutzerklärung.",
          "Unser E-Mail-Anbieter (SMTP): Versand der Bestätigungs- und Passwort-Mails an deine Adresse.",
          "Bei Anbietern in den USA stützt sich die Übermittlung auf die gesetzlich vorgesehenen Garantien (Art. 16 nDSG, Art. 46 DSGVO). Wir verkaufen deine Daten nicht und geben sie nicht zu Werbezwecken weiter.",
        ],
      },
      {
        heading: "Wie lange wir Daten aufbewahren",
        paragraphs: [
          "Kontodaten bleiben, bis du dein Konto löschst. Links zur Bestätigung und zum Zurücksetzen des Passworts sind 48 Stunden beziehungsweise eine Stunde gültig und nur einmal verwendbar. Löschst du dein Konto, bleiben deine Vorschläge ohne Verknüpfung zu dir erhalten. Rechnungsdaten bewahrt Polar so lange auf, wie das Gesetz es verlangt.",
        ],
      },
      {
        heading: "Deine Rechte",
        paragraphs: [
          "Du kannst Auskunft über deine Daten verlangen, sie berichtigen oder löschen lassen, der Bearbeitung widersprechen und die Daten in einem gängigen Format herausverlangen. Dein Konto löschst du selbst unter Konto. Läuft ein Abo, kündigst du es vorher im Kundenportal. Für alles andere schreib uns über die Kontaktangaben im Impressum. Du kannst dich zudem beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) oder bei der Aufsichtsbehörde an deinem Wohnort beschweren.",
        ],
      },
    ],
  },
}
