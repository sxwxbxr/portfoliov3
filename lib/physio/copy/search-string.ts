/**
 * Strings of the Suchstring-Generator (tool, demo and paywall page).
 * German, Swiss orthography, informal "du". A copywriter pass happens later:
 * change wording here, not in the components.
 */
import type { Block, LintSeverity, NoticeSeverity } from "@/lib/physio/search-string/types"

export const ssCopy = {
  name: "Suchstring-Generator",
  metaTitle: "Suchstring-Generator für PubMed",
  metaDescription:
    "Baut aus deiner PICO-Frage einen PubMed-Suchstring mit MeSH-Schlagworten, Stichworten, Klammern und Trunkierung. Regelbasiert, ohne KI, komplett im Browser.",

  hero: {
    title: "Suchstring-Generator",
    sub: "Von der PICO-Frage zum PubMed-Suchstring.",
    lede: "Schreib deine Fragestellung rein. Das Tool erkennt die Suchkomponenten, schlägt Schlagworte (MeSH) und Stichworte vor und baut daraus einen String mit Klammern, Field Tags und Trunkierung. Du gehst drüber und korrigierst, bevor du kopierst.",
    demoBadge: "Demo",
    demoLede:
      "In der Demo arbeitest du mit festen Beispielen. Komponenten und Begriffe kannst du bearbeiten, den String kopieren und den Prüfmodus am Beispielstring testen.",
  },

  privacy: "Deine Fragestellung bleibt auf deinem Gerät: Das Tool läuft komplett im Browser und schickt nichts an einen Server.",
  glossary: [
    { term: "Suchkomponente", text: "ein Baustein deiner Frage, zum Beispiel «Rückenschmerzen». Im String ist das eine Klammer, in der die Begriffe mit OR verknüpft sind." },
    { term: "Stichwort", text: "ein Freitext-Begriff, den PubMed in Titel und Abstract sucht ([tiab])." },
    { term: "Schlagwort", text: "ein MeSH-Term aus dem kontrollierten Vokabular von PubMed ([Mesh])." },
  ],

  draftNote: {
    title: "Das ist ein Entwurf.",
    body: "Geh Begriffe und Schlagworte durch und schau dir die Trefferliste an, bevor du den String in einer Arbeit verwendest. Das Tool arbeitet mit festen Regeln und einer Begriffstabelle, die fachlich noch nicht geprüft ist.",
  },

  tabs: { generate: "Suchstring erstellen", lint: "Eigenen String prüfen" },

  step: { label: "Schritt" },

  question: {
    heading: "Fragestellung",
    hint: "Aufgabe aus dem Unterricht, Forschungsfrage oder PICO-Frage, auf Deutsch oder Englisch.",
    exampleLabel: "Beispiel laden",
    examplePlaceholder: "Beispiel wählen",
    textLabel: "Deine Fragestellung",
    textPlaceholder: "Wie wirkt Krafttraining auf die Schmerzen bei älteren Menschen mit Kniearthrose?",
    textHint: "Tipp: «bei» leitet die Population ein, «im Vergleich zu» den Vergleich, «auf die» das Outcome. Du kannst auch direkt «P:», «I:», «C:», «O:» schreiben.",
    picoSummary: "Optional: PICO-Felder einzeln ausfüllen",
    picoHint: "Was du hier einträgst, landet fix im passenden Block.",
    pico: {
      population: { label: "Population (P)", placeholder: "Wer? Person oder Erkrankung" },
      intervention: { label: "Intervention (I)", placeholder: "Was wird gemacht?" },
      comparison: { label: "Vergleich (C)", placeholder: "Womit wird verglichen?" },
      outcome: { label: "Outcome (O)", placeholder: "Was wird gemessen?" },
      studyType: { label: "Studientyp", placeholder: "zum Beispiel RCT" },
    },
    submit: "Suchstring erstellen",
    reset: "Zurücksetzen",
    emptyError: "Schreib zuerst eine Fragestellung oder füll mindestens ein PICO-Feld aus.",
    failError: "Die Fragestellung liess sich nicht auswerten. Kürze den Text oder füll die PICO-Felder direkt aus.",
    lockedTitle: "In der Demo kannst du nur die Beispiele wählen.",
    lockedBody: "Eigene Fragestellungen und PICO-Felder gibt es mit dem Abo.",
    editedHint: "«Suchstring erstellen» setzt deine Änderungen an den Komponenten zurück.",
  },

  concepts: {
    heading: "Erkannte Suchkomponenten",
    hint: "Schau nach, ob das Tool deine Frage richtig verstanden hat. Entferne, verschiebe oder ergänze Komponenten, bevor du den String übernimmst.",
    emptyTitle: "Noch keine Suchkomponente.",
    emptyBody: "Erstelle den String im ersten Schritt oder füge unten eine Komponente hinzu.",
    waiting: "Der Rest erscheint, sobald du im ersten Schritt auf «Suchstring erstellen» klickst.",
    detectedFrom: "erkannt aus",
    custom: "eigene Komponente",
    noMesh: "Kein Schlagwort hinterlegt. Diese Komponente wird nur über Stichworte gesucht.",
    blocks: {
      population: { title: "Population", sub: "Wer oder welche Erkrankung?" },
      intervention: { title: "Intervention", sub: "Was wird gemacht?" },
      comparison: { title: "Vergleich", sub: "Womit wird verglichen?" },
      outcome: { title: "Outcome", sub: "Was wird gemessen?" },
    } satisfies Record<Block, { title: string; sub: string }>,
    blockInclude: "Im Suchstring",
    blockExcluded: "Dieser Block steht nicht im String.",
    comparisonNote: "Ein Vergleich im String schränkt die Treffer meist zu stark ein. Darum ist dieser Block standardmässig aus.",
    emptyBlock: "Keine Komponente in diesem Block.",
    schlagworte: "Schlagworte (MeSH)",
    stichworte: "Stichworte",
    explodeOn: "mit Unterbegriffen",
    explodeOff: "ohne Unterbegriffe",
    explodeHelp: "Mit Unterbegriffen findet [Mesh] auch alle engeren MeSH-Terms darunter. Ohne ([Mesh:NoExp]) nur genau diesen einen.",
    removeConcept: "Komponente entfernen",
    removeConceptButton: "Entfernen",
    allMeshRemoved: "Alle Schlagworte sind entfernt.",
    allTextRemoved: "Alle Stichworte sind entfernt.",
    moveTo: "Block",
    removeTerm: "entfernen",
    restore: "Wiederherstellen",
    removedTerms: "Entfernte Begriffe",
    addTermLabel: "Stichwort ergänzen",
    addTermPlaceholder: "englisches Wort oder Phrase",
    addTermButton: "Hinzufügen",
    addTermHint: "PubMed sucht auf Englisch. Mit * trunkierst du: exercis* findet exercise, exercises und exercising.",
    addConceptHeading: "Komponente ergänzen",
    addFromList: "Aus der Begriffstabelle",
    addFromListPlaceholder: "Komponente wählen",
    addFromListButton: "Komponente hinzufügen",
    addCustomLabel: "Eigene Komponente",
    addCustomPlaceholder: "englisches Stichwort",
    addCustomButton: "Eigene Komponente hinzufügen",
    categories: {
      population: "Population und Erkrankung",
      setting: "Umfeld",
      intervention: "Intervention",
      comparison: "Vergleich",
      outcome: "Outcome",
      studytype: "Studientyp",
    },
    candidatesHeading: "Nicht erkannte Wörter",
    candidatesHint:
      "Diese Wörter stehen nicht in der Begriffstabelle, darum schlägt das Tool kein Schlagwort dafür vor. Du kannst sie als Stichwort übernehmen, dann aber auf Englisch, weil PubMed so sucht.",
    candidateAdd: "Als Stichwort übernehmen",
    candidateDismiss: "Verwerfen",
    candidateBlock: "Block",
    notices: "Hinweise zur Auswertung",
  },

  database: {
    heading: "Datenbank und Filter",
    hint: "In dieser Version gibt es nur PubMed. Weitere Datenbanken kommen später.",
    legend: "Datenbank",
    soon: "bald",
    filtersHeading: "Filter",
    filtersHint: "Alle Filter sind optional.",
    language: "Sprache",
    languageAny: "alle Sprachen",
    years: "Erscheinungsjahr",
    yearFrom: "von",
    yearTo: "bis",
    yearPlaceholder: "Jahr",
    studyTypes: "Studientyp",
    studyTypeLabels: {
      rct: "Randomisierte kontrollierte Studie",
      "systematic-review": "Systematische Übersichtsarbeit",
      "meta-analysis": "Metaanalyse",
    },
    humans: "Nur Studien am Menschen",
    humansHint: "Schliesst reine Tierstudien aus.",
  },

  result: {
    heading: "Suchstring",
    hint: "Kopiere den String direkt ins Suchfeld von PubMed oder lade ihn herunter.",
    stringLabel: "Suchstring für PubMed",
    empty: "Noch kein Suchstring. Dafür braucht es mindestens eine Suchkomponente mit einem aktiven Begriff.",
    copy: "Kopieren",
    copied: "Kopiert",
    copyFailed: "Kopieren hat nicht geklappt. Markiere den String und kopiere ihn von Hand.",
    downloadTxt: "Als .txt",
    downloadJson: "Als .json",
    stats: (components: number, terms: number) =>
      `${components} ${components === 1 ? "Suchkomponente" : "Suchkomponenten"}, ${terms} ${terms === 1 ? "Begriff" : "Begriffe"}`,
    noticesHeading: "Auf einen Blick",
    tableHeading: "Suchkomponenten im Überblick",
    tableCols: { component: "Suchkomponente", keywords: "Stichworte", subjectHeadings: "Schlagworte (MeSH)" },
    none: "keine",
    legend: "So liest du den String: Schlagworte mit [Mesh] sind umrandet, Stichworte mit [tiab] sucht PubMed in Titel und Abstract, AND und OR sind grau.",
  },

  severity: {
    info: "Hinweis",
    warning: "Warnung",
    error: "Fehler",
  } satisfies Record<NoticeSeverity | LintSeverity, string>,

  lint: {
    heading: "Eigenen String prüfen",
    hint: "Füge deinen PubMed-Suchstring ein, zum Beispiel aus einer Übung. Das Tool markiert typische Fehler wie typografische Anführungszeichen, fehlende Klammern bei AND und OR oder fehlende Field Tags, und korrigiert, wo es geht.",
    inputLabel: "Dein Suchstring",
    inputPlaceholder: '("back pain"[tiab] OR "Back Pain"[Mesh]) AND ...',
    lockedTitle: "In der Demo kannst du nur den Beispielstring prüfen.",
    lockedBody: "Eigene Strings prüfst du mit dem Abo. Die Korrekturen kannst du hier schon ausprobieren.",
    insertExample: "Beispielstring einfügen",
    resetExample: "Beispielstring zurücksetzen",
    clear: "Leeren",
    undo: "Rückgängig",
    markedHeading: "Markierte Stellen",
    emptyTitle: "Noch kein String.",
    emptyBody: "Füge oben einen Suchstring ein. Die Prüfung läuft beim Tippen mit.",
    cleanTitle: "Nichts gefunden.",
    cleanBody: "Die Syntax stimmt. Ob die Begriffe zu deiner Frage passen, kann das Tool nicht beurteilen, das bleibt bei dir.",
    summary: (errors: number, warnings: number, infos: number) => {
      const parts: string[] = []
      if (errors) parts.push(`${errors} Fehler`)
      if (warnings) parts.push(`${warnings} ${warnings === 1 ? "Warnung" : "Warnungen"}`)
      if (infos) parts.push(`${infos} ${infos === 1 ? "Hinweis" : "Hinweise"}`)
      return parts.join(", ")
    },
    goTo: "Zur Stelle",
    fix: "Korrigieren",
    fixAll: "Alles automatisch korrigieren",
    fixAllDone: (n: number) => `${n} ${n === 1 ? "Korrektur" : "Korrekturen"} angewendet.`,
    fixAllNone: "Hier gibt es nichts, was sich automatisch korrigieren lässt.",
    at: "Stelle",
    moreSpots: (n: number) => `und ${n} weitere ${n === 1 ? "Stelle" : "Stellen"}`,
  },

  demo: {
    ctaHeading: "Eigene Fragen auswerten",
    ctaBody:
      "Mit dem Abo schreibst du deine eigene Fragestellung, füllst die PICO-Felder aus und prüfst eigene Strings. Das Abo gilt für alle Tools auf dieser Seite, auch für die, die noch dazukommen.",
    ctaPrimary: "Abo ansehen",
    ctaSecondary: "Anmelden",
    footnote: "Die Beispiele und die Begriffstabelle sind dieselben wie im Abo.",
  },

  paywall: {
    title: "Suchstring-Generator",
    sub: "Mit dem Abo freigeschaltet.",
    lede: "Du schreibst deine PICO-Frage oder die Aufgabe aus dem Unterricht rein. Das Tool erkennt die Suchkomponenten, ordnet Schlagworte (MeSH) und Stichworte zu und baut daraus einen PubMed-String. Du gehst drüber und korrigierst, bevor du ihn kopierst.",
    whatHeading: "Was das Tool macht",
    points: [
      "Erkennt Suchkomponenten in deutschen und englischen Fragen, auch wenn du «Rueckenschmerzen» statt «Rückenschmerzen» schreibst.",
      "Zeigt zu jeder Komponente Schlagworte (MeSH) und Stichworte, die du entfernen, ergänzen oder in einen anderen Block verschieben kannst.",
      "Setzt Klammern, Field Tags und Trunkierung so, wie es die aktuelle PubMed-Hilfe vorgibt.",
      "Prüft eigene Strings auf typische Fehler: typografische Anführungszeichen, fehlende Klammern bei AND und OR, fehlende Field Tags. Vieles davon korrigiert es mit einem Klick.",
    ],
    sampleHeading: "So sieht ein Ergebnis aus",
    sampleCaption: "Beispiel: die Aufgabe zu Herrn Müller, erzeugt mit diesem Tool. Ein Entwurf, kein fertiger String.",
    privacy: "Deine Fragestellung bleibt auf deinem Gerät: Das Tool läuft komplett im Browser und schickt nichts an einen Server.",
    demoLink: "Kostenlose Demo ausprobieren",
    aboLink: "Abo ansehen",
    loginLink: "Anmelden",
    loginHint: "Schon ein Abo? Dann melde dich an.",
    verifyHint: "Du bist angemeldet, hast aber noch kein aktives Abo.",
  },
} as const
