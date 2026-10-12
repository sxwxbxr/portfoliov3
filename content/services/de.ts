import type { ServiceContent, ServiceLabels, ServicesOverviewContent } from "./types"

/**
 * German service copy, converted from the copywriter drafts.
 * Placeholders from the drafts are never rendered: each `TODO(Seya)` comment sits above the
 * string it was removed from. Fill the text in and delete the comment.
 * FAQ entries whose answer was only a placeholder are omitted and listed at the bottom.
 */

export const labels: ServiceLabels = {
  forWhom: "Für wen das ist",
  deliverables: "Was dazugehört",
  process: "Ablauf",
  pricing: "Was es kostet",
  references: "Referenzen",
  faq: "Häufige Fragen",
  updated: "Zuletzt aktualisiert",
  furtherReading: "Weiterlesen",
  inGerman: "",
  overviewCrumb: "Leistungen",
}

export const overview: ServicesOverviewContent = {
  slug: "leistungen",
  updatedAt: "2026-10-12",
  metaTitle: "Leistungen für KMU",
  metaDescription: "Individualsoftware, Prozessautomatisierung mit KI und Projektleitung Digitalisierung für KMU in der Ostschweiz. Bichwil SG. Antwort innert 24 Stunden.",
  h1: "Software, Automatisierung und Projektleitung für KMU",
  lead: "Weber Development entwickelt Individualsoftware und Automatisierungen für KMU in der Ostschweiz und übernimmt die Projektleitung, wenn ein Digitalisierungsvorhaben eine verantwortliche Person braucht. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG. Das Ergebnis ist ein Werkzeug, das zu Ihrem Ablauf passt, statt ein Ablauf, der sich dem Werkzeug anpasst.",
  servicesHeading: "Drei Leistungen",
  services: [
    {
      key: "custom-software",
      title: "Individualsoftware und Webapplikationen",
      text: "Portale, Dashboards und interne Tools, wenn Excel oder Standardsoftware nicht mehr reichen. Entwickelt direkt von der Person, die später auch Ihre Fragen beantwortet, in TypeScript und React oder C# und .NET.",
      linkLabel: "Individualsoftware",
    },
    {
      key: "process-automation-ai",
      title: "Prozessautomatisierung und KI-Integration",
      text: "Wiederkehrende Abläufe automatisieren und Sprachmodelle dort einsetzen, wo sie Handarbeit ersetzen: Anfragen beantworten, Dokumente auslesen, Daten übertragen. Mit Kostenkontrolle und menschlicher Freigabe für alles, was verbindlich ist.",
      linkLabel: "Prozessautomatisierung und KI",
    },
    {
      key: "digital-project-leadership",
      title: "Projektleitung Digitalisierung im Mandat",
      text: "Anforderungen aufnehmen, Anbieter ausschreiben und vergleichen, Einführung begleiten. Für Geschäftsleitungen, die ein Projekt vor sich haben, aber keine Person, die es führt.",
      linkLabel: "Projektleitung Digitalisierung",
    },
  ],
  startHeading: "Wie ein Projekt startet",
  start: [
    {
      step: "Erstgespräch",
      // TODO(Seya): bestätigen
      text: "Sie schildern das Problem, ich frage nach. Etwa 30 bis 45 Minuten, telefonisch, per Video oder vor Ort in der Ostschweiz. Kostenlos.",
    },
    {
      step: "Offerte",
      // TODO(Seya): z.B. einer Woche
      text: "Sie erhalten eine schriftliche Offerte mit Umfang, Etappen, Preismodell und einem Vorschlag für den ersten Schritt. Preise exkl. MWST.",
    },
    {
      step: "Kickoff",
      text: "Gemeinsamer Start mit den Personen, die mit dem Ergebnis arbeiten werden. Ab hier gibt es feste Termine für Zwischenstände.",
    },
  ],
  // TODO(Seya): bestätigen
  serviceArea: "Einsatzgebiet: Wil, Uzwil, Gossau, St. Gallen und die ganze Ostschweiz vor Ort, remote in der ganzen Schweiz.",
  cta: {
    lead: "Schreiben Sie mir in drei Sätzen, was Sie beschäftigt.",
    text: "Ich antworte innert 24 Stunden. info@sweber.dev oder +41 79 899 11 12.",
  },
}

export const services: Record<ServiceContent["key"], ServiceContent> = {
  "custom-software": {
    key: "custom-software",
    slug: "individualsoftware",
    updatedAt: "2026-10-12",
    metaTitle: "Individualsoftware für KMU",
    metaDescription: "Webapplikationen, Portale, Dashboards und interne Tools für KMU in der Ostschweiz. Entwickelt in Bichwil SG, mit klarer Offerte und einer Ansprechperson.",
    h1: "Individualsoftware und Webapplikationen für KMU",
    lead: "Weber Development baut Webapplikationen, Portale, Dashboards und interne Tools für KMU in der Ostschweiz, wenn Standardsoftware oder Excel nicht mehr reichen. Entwickelt wird in Bichwil SG, direkt von Seya Weber, ohne Agentur dazwischen. Sie erhalten ein Werkzeug, das Ihren Ablauf abbildet, und eine Ansprechperson, die den Code selbst geschrieben hat.",
    forWhomIntro: "Für Betriebe mit einem konkreten Ablauf, der heute über Excel, E-Mail und Zuruf läuft. Typische Situationen:",
    forWhom: [
      "Eine Excel-Datei ist zur zentralen Datenbank geworden. Mehrere Personen arbeiten darin, und niemand weiss mehr, welche Version stimmt.",
      "Kunden, Mitglieder oder Eigentümer fragen per Telefon nach Informationen, die sie in einem Portal selbst abrufen könnten.",
      "Kennzahlen aus zwei oder drei Systemen werden jeden Monat von Hand in eine Übersicht kopiert.",
      "Ein älteres Tool läuft noch, aber niemand kann es mehr anpassen oder der Hersteller gibt es auf.",
      "Eine Standardsoftware deckt den Grossteil ab, und der Rest kostet jeden Tag Zeit mit Umwegen.",
    ],
    // TODO(Seya): Zielgrösse bestätigen, z.B. 5 bis 100 Mitarbeitende
    forWhomNote: "Branchen: Produktion und Handwerk, Dienstleister, Liegenschafts- und Stockwerkeigentümer-Verwaltungen, Vereine und Verbände.",
    deliverables: [
      "Anforderungsaufnahme mit den Personen, die das Tool täglich nutzen werden, nicht nur mit der Geschäftsleitung",
      "Ablaufskizze und klickbarer Prototyp, bevor eine Zeile Produktionscode entsteht",
      "Entwicklung der Webapplikation: TypeScript, React und Next.js für Oberflächen, C# und .NET wo ein bestehendes Windows-Umfeld das verlangt, Postgres oder SQL Server als Datenbank",
      "Login, Rollen und Rechte (wer sieht und ändert was)",
      "Datenübernahme aus Excel oder dem Altsystem, mit Prüfung auf Vollständigkeit",
      // TODO(Seya): typische Systeme nennen, z.B. Buchhaltung, ERP, Microsoft 365
      "Anbindung an bestehende Systeme über Schnittstellen",
      // TODO(Seya): Standard-Hosting und Standort der Daten nennen
      "Hosting-Einrichtung und Backups",
      "Dokumentation und Einführung für die Nutzenden",
      "Optional: Wartung und Weiterentwicklung nach dem Start",
    ],
    process: [
      {
        step: "Erstgespräch",
        // TODO(Seya): bestätigen
        text: "Sie schildern den Ablauf, der Mühe macht. Ich frage nach, wo Zeit und Fehler entstehen. Dauer etwa 30 bis 45 Minuten, kostenlos.",
      },
      {
        step: "Anforderungen und Offerte",
        // TODO(Seya): bestätigen
        text: "Ein bis zwei Gespräche mit den Nutzenden, danach eine schriftliche Offerte mit Umfang, Etappen und Preis. Typisch 1 bis 2 Wochen.",
      },
      {
        step: "Prototyp",
        // TODO(Seya): bestätigen
        text: "Eine klickbare Version mit Ihren echten Begriffen und Beispieldaten. Typisch 2 bis 4 Wochen.",
      },
      {
        step: "Entwicklung in Etappen",
        // TODO(Seya): Rhythmus bestätigen
        text: "Alle zwei Wochen ein Stand, den Sie ausprobieren können. Rückmeldungen fliessen direkt in die nächste Etappe.",
      },
      {
        step: "Einführung",
        text: "Datenübernahme, Schulung, Start im Betrieb, Nachbetreuung in den ersten Wochen.",
      },
      {
        step: "Betrieb",
        text: "Wartungsvereinbarung oder Übergabe an Ihre IT, je nach Wunsch.",
      },
    ],
    pricing: {
      intro: "Zwei Modelle, je nach Klarheit des Umfangs:",
      items: [
        {
          title: "Pauschale",
          text: "mit definiertem Umfang und Meilensteinen. Passt, wenn nach dem Prototyp klar ist, was gebaut wird. Sie kennen den Preis vor dem Start.",
        },
        {
          title: "Nach Aufwand",
          text: "mit monatlichem Rapport. Passt, wenn der Umfang bewusst offen bleibt oder laufend erweitert wird.",
        },
      ],
      // TODO(Seya): Preisrahmen, z.B. ab CHF … für ein internes Tool, Stundensatz CHF …, Preise exkl. MWST
      // TODO(Seya): Grössenordnung pro Monat
      note: "Laufende Kosten für Hosting und Wartung werden separat ausgewiesen.",
    },
    references: [
      {
        slug: "stweg-roessliwiese",
        name: "STWEG Roessliwiese",
        text: "Eigeninitiiertes Projekt für die Stockwerkeigentümergemeinschaft Rössliwiese in Bichwil: öffentliche Website plus geschütztes Eigentümerportal mit Dokumentenablage, Mitteilungen, Terminen und rollenbasierter Verwaltung, Login über E-Mail-Allowlist, Betrieb in der EU-Region.",
      },
      {
        slug: "webguide",
        name: "WebGuide",
        text: "Eigeninitiierte zweisprachige Wissensplattform mit durchsuchbarem Wiki und eingebautem Ticketsystem (Anhänge, E-Mail-Weiterleitung, Spam-Schutz), die wiederkehrende Einzelhilfe bei PC-Fragen in Selbstbedienung überführt.",
      },
    ],
    faq: [
      {
        q: "Lohnt sich Individualsoftware für ein kleines Unternehmen überhaupt?",
        a: "Wenn ein Ablauf täglich Zeit kostet oder regelmässig Fehler produziert, meistens ja. Die Rechnung ist einfach: Stunden pro Woche, die heute in Excel, Abtippen und Nachfragen gehen, mal Stundenkosten, verglichen mit der Offerte. Im Erstgespräch rechnen wir das gemeinsam durch. Fällt die Rechnung gegen eine Eigenentwicklung aus, sage ich das und empfehle eine Standardlösung.",
      },
      {
        q: "Was passiert, wenn Sie ausfallen oder das Geschäft aufgeben?",
        // TODO(Seya): Stellvertretung oder Partnernetz für Notfälle nennen, falls vorhanden
        a: "Weber Development ist ein Ein-Personen-Betrieb, diese Frage ist berechtigt. Der Schutz dagegen ist gewöhnliche Technik: verbreitete Sprachen und Frameworks (TypeScript, React, .NET, SQL), Code und Dokumentation in Ihrem Besitz, Hosting auf Ihren Konten.",
      },
      {
        q: "Können wir mit einem kleinen Teil starten?",
        a: "Ja, das ist der übliche Weg. Der Prototyp deckt einen Ablauf ab, der im Alltag am meisten stört. Wenn er sich bewährt, kommt der nächste Schritt. So bleibt die erste Investition überschaubar und das Risiko klein.",
      },
      {
        q: "Wie viel Zeit müssen wir selbst investieren?",
        // TODO(Seya): typischen Aufwand auf Kundenseite bestätigen, z.B. 2 bis 4 Stunden pro Woche in der Anfangsphase
        a: "Am meisten zu Beginn: Gespräche mit den Nutzenden und Rückmeldungen zum Prototyp. Danach etwa ein kurzer Termin alle zwei Wochen und Testen der Zwischenstände.",
      },
    ],
    cta: {
      lead: "Schildern Sie mir den Ablauf, der am meisten Zeit frisst.",
      text: "Ich antworte innert 24 Stunden mit einer ersten Einschätzung, ob sich eine Eigenentwicklung lohnt. info@sweber.dev oder +41 79 899 11 12.",
    },
  },
  "process-automation-ai": {
    key: "process-automation-ai",
    slug: "prozessautomatisierung-ki",
    updatedAt: "2026-10-12",
    metaTitle: "Prozessautomatisierung & KI für KMU",
    metaDescription: "Workflows automatisieren, Chatbots und Sprachmodelle in bestehende Software einbinden. Für KMU in der Ostschweiz, mit Kostenkontrolle und klarem Nutzen.",
    h1: "Prozessautomatisierung und KI-Integration für KMU",
    lead: "Weber Development automatisiert wiederkehrende Abläufe in KMU und bindet Sprachmodelle (LLMs) dort ein, wo sie Handarbeit ersetzen: Anfragen beantworten, Dokumente auslesen, Daten zwischen Systemen übertragen. Der Massstab ist nicht, ob etwas KI enthält, sondern ob danach weniger abgetippt, nachgefragt und kopiert wird. Entwickelt in Bichwil SG von Seya Weber, mit Erfahrung aus einer produktiv laufenden Chatbot-Plattform und mehrstufigen KI-Pipelines.",
    forWhomIntro: "Für Betriebe, in denen dieselbe Arbeit jeden Tag von Hand wiederholt wird. Typische Situationen:",
    forWhom: [
      "Täglich treffen ähnliche Anfragen per E-Mail oder WhatsApp ein, und die Antworten sind zu 80 Prozent gleich.",
      "Offerten, Rapporte oder Bestellungen kommen als PDF und werden ins ERP oder in die Buchhaltung abgetippt.",
      "Zwei Systeme haben keine Schnittstelle, also werden Daten von Hand nachgetragen.",
      "Ein KI-Chatbot wurde ausprobiert und produziert jetzt hohe API-Rechnungen oder Antworten, die nicht stimmen.",
      "Eine bestehende Automatisierung mit Zapier, Make oder Power Automate ist am Limit und niemand weiss, was sie genau tut.",
    ],
    // TODO(Seya): Zielgrösse bestätigen
    forWhomNote: "Branchen: Produktion und Service, Handel, Praxen und Kliniken, Verwaltungen.",
    deliverables: [
      "Prozessaufnahme: welche Schritte, wie oft, durch wen, mit welchen Ausnahmen",
      "Bewertung pro Schritt: feste Regel oder Sprachmodell, und was sich gemessen am Aufwand lohnt",
      "Workflow-Automatisierungen: Schnittstellen, Hintergrundjobs, Skripte, Anbindung an E-Mail, ERP, CRM oder Buchhaltung",
      "Chatbots für Kundenanfragen auf Website oder WhatsApp, angebunden an Ihre eigenen Daten",
      "LLM-Integration in bestehende Software: Klassifizieren, Daten aus Dokumenten extrahieren, Zusammenfassen, Antwortentwürfe erstellen",
      "Kostenkontrolle: Modellwahl pro Aufgabe, Caching, Limits, Überwachung der API-Kosten",
      "Qualitätssicherung: Testfälle mit echten Beispielen, menschliche Freigabe für alles, was nach aussen geht oder Geld bewegt",
      // TODO(Seya): eingesetzte Anbieter und Datenstandorte nennen
      "Datenschutz: Festlegen, welche Daten das Haus verlassen dürfen und welche nicht, Anbieterwahl entsprechend",
      "Dokumentation, Übergabe, Betrieb",
    ],
    process: [
      {
        step: "Erstgespräch",
        // TODO(Seya): bestätigen
        text: "Sie zeigen den Ablauf, der am meisten nervt, am besten direkt am Bildschirm. Etwa 30 bis 45 Minuten, kostenlos.",
      },
      {
        step: "Prozessaufnahme und Machbarkeit",
        // TODO(Seya): bestätigen
        text: "Ich schaue zu, zähle mit und prüfe mit echten Beispielen, ob eine Regel reicht oder ein Sprachmodell nötig ist. Typisch 1 bis 2 Wochen.",
      },
      {
        step: "Pilot auf einem Prozess",
        // TODO(Seya): bestätigen
        text: "Eine Automatisierung läuft parallel zum bisherigen Weg, Ergebnisse werden verglichen. Typisch 2 bis 6 Wochen.",
      },
      {
        step: "Messen und ausrollen",
        text: "Wenn Trefferquote und Kosten stimmen, wird der Pilot zum Normalfall und der nächste Prozess kommt dran.",
      },
      {
        step: "Betrieb",
        text: "Monitoring der Kosten und Fehlerfälle, Anpassung bei Prozessänderungen.",
      },
    ],
    pricing: {
      items: [
        {
          title: "Pilot als Pauschale",
          // TODO(Seya): Preisrahmen, z.B. ab CHF …, exkl. MWST
          text: "für einen abgegrenzten Prozess.",
        },
        {
          title: "Weiterentwicklung nach Aufwand",
          // TODO(Seya): Stundensatz / Retainer-Rahmen
          text: "oder als monatlicher Retainer, wenn mehrere Prozesse folgen.",
        },
        {
          title: "Laufende API-Kosten",
          text: "der Sprachmodell-Anbieter laufen auf Ihrem Konto und werden nicht aufgeschlagen. Vor dem Pilot gibt es eine Schätzung pro Monat auf Basis Ihres Volumens.",
        },
      ],
    },
    references: [
      {
        slug: "flowlychat",
        name: "FlowlyChat",
        text: "Multi-Tenant-WhatsApp-Chatbot-Plattform für die SchulzMedia GmbH (seit 2025) mit Schweizerdeutsch-Unterstützung, RAG über Cloudflare Vectorize und vierstufigem Missbrauchsschutz; durch Model Routing über mehrere Claude-Stufen rund 65 % tiefere LLM-Kosten.",
      },
      {
        slug: "everyday-explainer",
        name: "Everyday Explainer",
        text: "Eigeninitiierte, selbstlernende KI-Pipeline für kurze YouTube-Erklärvideos, in der spezialisierte Claude-Code-Subagenten Skripte schreiben, Aussagen per Webrecherche prüfen, die Qualität reviewen und aus Analytics lernen.",
      },
      {
        slug: "webguide",
        name: "WebGuide",
        text: "Supportplattform, in der Workers AI eingehende Tickets klassifiziert und Artikelentwürfe vorbereitet, eingebettet in ein Ticketsystem mit E-Mail-Weiterleitung.",
      },
    ],
    faq: [
      {
        q: "Brauchen wir überhaupt KI, oder reicht eine normale Automatisierung?",
        a: "Oft reicht eine Regel. Wenn der Ablauf immer gleich ist (Datei kommt an, Werte werden übertragen, Mail geht raus), ist eine feste Automatisierung billiger, schneller und nie falsch. Ein Sprachmodell lohnt sich, wenn Eingaben uneinheitlich sind: freier Text, unterschiedliche PDF-Layouts, Kundenfragen in eigenen Worten. In der Prozessaufnahme wird das pro Schritt entschieden.",
      },
      {
        q: "Was passiert mit unseren Daten, wenn ein Sprachmodell sie verarbeitet?",
        // TODO(Seya): Standard-Anbieter, Datenstandort und ob Auftragsverarbeitungsvertrag vorliegt
        a: "Das wird vor dem Pilot festgelegt und nicht nachträglich. Personendaten und Geschäftsgeheimnisse können vor der Verarbeitung maskiert werden, oder der Schritt läuft über einen Anbieter mit passendem Datenstandort und Vertrag.",
      },
      {
        q: "Was kostet der Betrieb eines Chatbots pro Monat?",
        // TODO(Seya): Grössenordnung aus FlowlyChat-Erfahrung, z.B. CHF … pro 1000 Gespräche
        a: "Das hängt vom Volumen ab: Anzahl Gespräche, Länge, gewähltes Modell. Vor dem Pilot gibt es eine Schätzung auf Basis Ihrer heutigen Anfragezahlen, und im Betrieb sind Limits gesetzt, damit keine Überraschung auf der Rechnung steht.",
      },
      {
        q: "Wie verhindern Sie, dass der Chatbot Unsinn erzählt?",
        a: "Mit drei Mitteln: Der Bot antwortet nur aus Ihren hinterlegten Daten und sagt sonst, dass er es nicht weiss. Alles, was verbindlich ist (Preise, Termine, Zusagen), geht an einen Menschen oder an ein festes System statt ans Modell. Und vor dem Start wird mit echten Anfragen aus Ihrer Mailbox getestet, nicht mit erfundenen.",
      },
      {
        q: "Was, wenn sich unser Prozess ändert?",
        a: "Regeln und Vorlagen lassen sich anpassen, ohne alles neu zu bauen. Kleine Änderungen laufen über die Wartung, grössere als Etappe. Ändert sich der Prozess alle paar Wochen grundlegend, ist Automatisierung noch nicht der richtige Schritt; dann sage ich das.",
      },
    ],
    cta: {
      lead: "Zeigen Sie mir den Ablauf, der jeden Tag Handarbeit kostet.",
      text: "Ich antworte innert 24 Stunden mit einer ersten Einschätzung, ob Regel, Sprachmodell oder beides passt. info@sweber.dev oder +41 79 899 11 12.",
    },
  },
  "digital-project-leadership": {
    key: "digital-project-leadership",
    slug: "projektleitung-digitalisierung",
    updatedAt: "2026-10-12",
    metaTitle: "Projektleitung Digitalisierung im Mandat",
    metaDescription: "Externe Projektleitung für Digitalisierungsvorhaben in KMU: Anforderungen, Ausschreibung, Begleitung der Einführung. Ostschweiz, remote in der ganzen Schweiz.",
    h1: "Projektleitung Digitalisierung im Mandat",
    // TODO(Seya): Formulierung der Anstellungserfahrung bestätigen, ohne Arbeitgebernamen
    lead: "Weber Development übernimmt die Projektleitung für Digitalisierungsvorhaben in KMU, die intern niemand führen kann oder soll: von der Anforderungsaufnahme über die Ausschreibung und Anbieterwahl bis zur Begleitung der Einführung. Sie behalten die Entscheidungen, die Projektleitung übernimmt Struktur, Termine und die Übersetzung zwischen Fachabteilung und Lieferant. Hinter dem Mandat steht Seya Weber, Bichwil SG, mit Erfahrung als Projektleitung für Software und Digitalisierung in der Industrie.",
    forWhomIntro: "Für Geschäftsleitungen, die ein Digitalisierungsprojekt vor sich haben, aber keine Person, die es führt. Typische Situationen:",
    forWhom: [
      "Eine ERP-, CRM- oder Branchensoftware-Einführung steht an. Die Geschäftsleitung hat keine Zeit dafür, die IT ist extern.",
      "Drei Offerten liegen auf dem Tisch und sind nicht vergleichbar, weil jede etwas anderes enthält.",
      "Das Projekt läuft schon, der Termin rutscht zum zweiten Mal, und niemand hat die Gesamtübersicht.",
      "Eine alte Software muss abgelöst werden, und die Daten aus 15 Jahren müssen mit.",
      "Der Lieferant redet Technik, die Fachabteilung redet Alltag, und zwischen beiden geht laufend etwas verloren.",
    ],
    // TODO(Seya): Zielgrösse bestätigen
    forWhomNote: "Branchen: Produktion, Handel, Gesundheitswesen, Verwaltung und Dienstleistung. Unternehmensgrösse: KMU ohne eigene IT-Projektleitung.",
    deliverables: [
      "Ist-Aufnahme: Interviews mit Schlüsselpersonen, Prozesslandkarte, Liste der Schmerzpunkte",
      "Anforderungskatalog mit Gewichtung (Muss, Soll, Kann), als Grundlage für Offerten",
      "Ausschreibung: Anbieter-Shortlist, strukturierter Offertvergleich, Referenzgespräche, Vorbereitung der Vertragsverhandlung",
      "Projektplan mit Meilensteinen, Budgetkontrolle und Entscheidungsvorlagen für die Geschäftsleitung",
      "Steuerung des Lieferanten: Abnahmen, Testkoordination, Mängellisten, Eskalation",
      "Risikomanagement: stufenweise Einführung, Datenmigration mit Vollständigkeitsprüfung und Rückfallplan",
      "Einführung: Key-User, Schulungsplan, Kommunikation an die Mitarbeitenden",
      "Reporting an die Geschäftsleitung in festem Rhythmus, in der Länge, die zur Führungsebene passt",
      "Übergabe in den Regelbetrieb mit Dokumentation und offener Punkteliste",
    ],
    process: [
      {
        step: "Erstgespräch",
        // TODO(Seya): bestätigen
        text: "Sie beschreiben das Vorhaben und den Stand. Etwa 45 Minuten, kostenlos.",
      },
      {
        step: "Standortbestimmung",
        // TODO(Seya): bestätigen
        text: "Interviews, Prozessaufnahme, Risikobild, Empfehlung zum weiteren Vorgehen in einem kurzen Bericht. Typisch 2 bis 4 Wochen.",
      },
      {
        step: "Anforderungen und Ausschreibung",
        // TODO(Seya): bestätigen
        text: "Anforderungskatalog, Anbieterauswahl, Offertvergleich, Entscheid. Typisch 4 bis 8 Wochen.",
      },
      {
        step: "Umsetzungsbegleitung",
        // TODO(Seya): bestätigen
        text: "Steuerung des Lieferanten über die Dauer der Einführung, mit einem festen Pensum, typisch 1 bis 2 Tage pro Woche.",
      },
      {
        step: "Einführung und Abschluss",
        text: "Go-live, Stabilisierung, Übergabe an den Betrieb, Abschlussbericht.",
      },
    ],
    processNote: "Ein Einstieg in ein laufendes Projekt ist möglich; die Standortbestimmung wird dann zur Bestandsaufnahme.",
    pricing: {
      items: [
        {
          title: "Standortbestimmung als Pauschale",
          // TODO(Seya): Preisrahmen, z.B. CHF …, exkl. MWST
          text: ", damit der Einstieg kalkulierbar ist.",
        },
        {
          title: "Mandat nach Aufwand",
          // TODO(Seya): Tagessatz oder Stundensatz, exkl. MWST
          text: "mit vereinbartem Pensum und monatlichem Rapport.",
        },
        {
          title: "Retainer",
          // TODO(Seya): Retainer-Rahmen
          text: "für Projekte mit längerer Laufzeit und gleichmässigem Pensum.",
        },
      ],
      // TODO(Seya): bestätigen
      note: "Reisekosten innerhalb der Ostschweiz sind inbegriffen; ausserhalb nach Aufwand.",
    },
    references: [
      {
        slug: "flowlychat",
        name: "FlowlyChat",
        text: "Kundenprojekt für die SchulzMedia GmbH (seit 2025): Multi-Tenant-Chatbot-Plattform mit Architekturentscheiden zu Kosten, Mandantentrennung und Missbrauchsschutz, inklusive Kostentracking über Cloudflare AI Gateway.",
      },
      {
        slug: "stweg-roessliwiese",
        name: "STWEG Roessliwiese",
        text: "Portal für eine Stockwerkeigentümergemeinschaft in Bichwil, von der Anforderung «ein zentraler, geschützter Ort für Dokumente, Mitteilungen und Termine» bis zum Betrieb in der EU-Region.",
      },
    ],
    referencesNote: "Für die Projektleitung im Mandat gibt es noch kein eigenes öffentliches Fallbeispiel. Die folgenden Projekte zeigen die Umsetzungsseite, aus der die Beurteilung von Offerten, Architekturen und Lieferanten kommt.",
    faq: [
      {
        q: "Sind Sie neutral gegenüber Anbietern?",
        // TODO(Seya): bestätigen
        a: "Ja. Weber Development verkauft keine Lizenzen und hat keine Wiederverkaufsverträge mit Softwareherstellern. Die Empfehlung richtet sich nach Ihrem Anforderungskatalog, und der Offertvergleich liegt offen auf dem Tisch.",
      },
      {
        q: "Was unterscheidet das von einer Beratung?",
        a: "Eine Beratung endet mit einem Bericht. Ein Mandat endet, wenn die Software läuft. Die Projektleitung trägt die Verantwortung für Termine, Abnahmen und Eskalationen über die ganze Laufzeit und sitzt in den Sitzungen mit dem Lieferanten auf Ihrer Seite des Tischs.",
      },
      {
        q: "Wie viel Zeit braucht das von uns?",
        // TODO(Seya): typischen Aufwand auf Kundenseite bestätigen
        a: "Entscheidungen bleiben bei Ihnen, deshalb braucht es eine Person aus der Geschäftsleitung, die etwa alle zwei Wochen eine Stunde für Entscheide hat, und je nach Phase Fachpersonen für Interviews und Tests.",
      },
      {
        q: "Können Sie auch selbst entwickeln, statt nur zu leiten?",
        a: "Ja, das ist der Unterschied zu einer reinen Projektleitung: Mit Entwicklungshintergrund in .NET und TypeScript lassen sich Offerten technisch beurteilen und Schnittstellenfragen direkt klären. Im Mandat wird die Rolle aber vorher festgelegt. Entweder Projektleitung mit neutralem Blick auf den Lieferanten, oder Umsetzung. Beides gleichzeitig vermischt die Interessen.",
      },
      {
        q: "Was, wenn das Projekt schon läuft und hängt?",
        // TODO(Seya): bestätigen
        a: "Dann beginnt das Mandat mit einer Bestandsaufnahme von zwei bis drei Wochen: Was ist vereinbart, was ist geliefert, wo klemmt es. Daraus entsteht ein bereinigter Plan, den Lieferant und Geschäftsleitung gemeinsam verabschieden.",
      },
      {
        q: "Sprechen Sie mit französischsprachigen oder internationalen Lieferanten?",
        // TODO(Seya): bestätigen, wie weit Französisch im Projektalltag eingesetzt wird
        a: "Deutsch ist Muttersprache, Englisch auf Niveau C1, Französisch auf Niveau B2. Projektgespräche und Dokumentation auf Englisch sind kein Problem; Französisch für Sitzungen und Korrespondenz.",
      },
    ],
    cta: {
      lead: "Beschreiben Sie das Vorhaben in drei Sätzen.",
      text: "Ich antworte innert 24 Stunden mit einer ersten Einschätzung, ob eine Standortbestimmung der richtige Einstieg ist. info@sweber.dev oder +41 79 899 11 12.",
    },
  },
}

// OMITTED FAQ (individualsoftware.de.md) TODO(Seya): Wem gehört der Code am Ende? -> vertragliche Regelung bestätigen, z.B. «Der Quellcode geht mit der Schlusszahlung vollständig an Sie über, inklusive Repository-Zugang und Dokumentation.»
// OMITTED FAQ (individualsoftware.de.md) TODO(Seya): Wo liegen unsere Daten? -> Standard-Hosting und Datenstandort nennen, z.B. Schweiz oder EU, und ob Hosting in der Schweiz auf Wunsch möglich ist
// OMITTED FAQ (prozessautomatisierung-ki.de.md) TODO(Seya): Welche Anbieter und Modelle setzen Sie ein? -> eingesetzte LLM-Anbieter und Automatisierungsplattformen nennen
// OMITTED REFERENCE (projektleitung-digitalisierung.de.md) TODO(Seya): bestätigen und freigeben, ohne Arbeitgebernamen; sonst streichen
