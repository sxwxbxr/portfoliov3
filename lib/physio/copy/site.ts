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

  footer: {
    privacy: "Datenschutz",
    imprint: "Impressum",
    main: "sweber.dev",
    note: "Ein unabhängiges Projekt von Seya Weber, nicht von einer Fachhochschule.",
  },

  landing: {
    metaTitle: "Physio Tools: Browser-Tools für das Physiotherapie-Studium",
    metaDescription:
      "Kleine Browser-Tools für das Physiotherapie-Studium. Der Suchstring-Generator baut aus deiner PICO-Frage einen PubMed-Suchstring mit MeSH-Terms und Stichworten.",
    eyebrow: "Für das Physiotherapie-Studium",
    title: "Aus deiner PICO-Frage",
    titleSub: "wird ein PubMed-Suchstring.",
    lede: "Der Suchstring-Generator zerlegt deine Fragestellung in Suchkomponenten, schlägt MeSH-Schlagworte und Stichworte vor und setzt Klammern, Field Tags und Trunkierung. Du siehst jeden Schritt und korrigierst, bevor du kopierst.",
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
      sub: "Was es gibt und was gerade entsteht.",
      demo: "Demo ausprobieren",
      open: "Tool öffnen",
      soon: "Bald",
      highlights: {
        suchstring: [
          "Versteht deutsche und englische Fragen, auch mit «ue» statt «ü».",
          "Zeigt zu jeder Komponente Schlagworte und Stichworte, die du entfernen, ergänzen oder verschieben kannst.",
          "Prüft eigene Strings auf typische Fehler und korrigiert vieles mit einem Klick.",
        ] as string[],
      } as Record<string, string[]>,
      moreTitle: "Weitere Tools",
      moreText: "Was als Nächstes entsteht, richtet sich nach euren Vorschlägen. Die Aufgaben, die am häufigsten genannt werden, nehme ich zuerst dran.",
      moreCta: "Aufgabe vorschlagen",
    },

    how: {
      heading: "So funktioniert der Suchstring-Generator",
      sub: "Vier Schritte, und du bleibst bei jedem am Steuer.",
      items: [
        {
          title: "Frage eingeben",
          text: "Als Satz auf Deutsch oder Englisch, oder mit P, I, C und O einzeln. Eine Aufgabe aus dem Unterricht geht auch.",
        },
        {
          title: "Komponenten prüfen",
          text: "Das Tool zeigt, was es erkannt hat. Du entfernst, verschiebst oder ergänzt Begriffe, bis es zu deiner Frage passt.",
        },
        {
          title: "Filter setzen",
          text: "Sprache, Erscheinungsjahr und Studientyp. Alles ist optional.",
        },
        {
          title: "Kopieren und gegenprüfen",
          text: "Kopiere den String oder lade ihn als Datei herunter. Schau dir die Trefferliste in PubMed an, bevor du ihn in einer Arbeit verwendest.",
        },
      ],
    },

    trust: {
      heading: "Worauf du dich verlassen kannst",
      items: [
        {
          title: "Läuft in deinem Browser",
          text: "Deine Fragestellung wird weder an einen Server gesendet noch gespeichert.",
        },
        {
          title: "Regelbasiert, ohne KI",
          text: "Feste Regeln und eine Begriffstabelle statt eines Sprachmodells. Das Tool erfindet keine Begriffe, und das Ergebnis bleibt ein Entwurf, den du prüfst.",
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
          "Deine Fragestellung und die erzeugten Suchstrings verarbeitet der Suchstring-Generator nur in deinem Browser. Sie werden weder an unseren Server gesendet noch gespeichert.",
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
