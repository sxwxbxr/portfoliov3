/**
 * Strings of the Suchstring-Generator (tool, demo and paywall page).
 * German, Swiss orthography, informal "du". A copywriter pass happens later:
 * change wording here, not in the components.
 */
import type { Block, LintSeverity, NoticeSeverity } from "@/lib/physio/search-string/types"

export const ssCopy = {
  name: "Suchstring-Generator",
  metaTitle: "Suchstring-Generator für PubMed, Cochrane Library, CINAHL und Embase",
  metaDescription:
    "Baut aus deiner Fragestellung, am besten nach PICO, einen Suchstring für PubMed, die Cochrane Library, CINAHL und Embase: Schlagworte (MeSH), Stichworte, Klammern und Trunkierung in der Syntax der Datenbank. Regelbasiert, ohne KI. Deine Frage bleibt auf deinem Gerät.",

  hero: {
    title: "Suchstring-Generator",
    sub: "Frage rein, Suchstring raus. Für PubMed, Cochrane Library, CINAHL und Embase.",
    lede: "Fragestellung einfügen, Datenbank wählen, String kopieren. Anpassen kannst du danach.",
    demoBadge: "Demo",
    demoLede: "Probier den Generator mit einer Beispielfrage aus.",
  },

  privacyShort: "Deine Frage bleibt auf deinem Gerät.",
  privacy:
    "Deine Frage bleibt auf deinem Gerät. Das Tool lädt nur Teile eines öffentlichen MeSH-Wörterbuchs von physio.sweber.dev nach; abgefragt wird ein Dateiname wie «terms/lo.json», nie dein Text. Die Trefferzählung ist optional und schickt nur den fertigen Suchstring an PubMed (NCBI).",
  attribution: {
    source: "MeSH: U.S. National Library of Medicine · Deutsche Bezeichnungen: Wikidata (CC0)",
    version: (version: string, descriptors: number, german: number) =>
      `Wörterbuch: MeSH ${version}, ${descriptors.toLocaleString("de-CH")} Schlagworte, davon ${german.toLocaleString("de-CH")} mit deutschen Bezeichnungen.`,
    loading: "Wörterbuch wird geladen",
  },
  glossary: [
    { term: "Suchkomponente", text: "ein Baustein deiner Frage, zum Beispiel «Rückenschmerzen». Im String ist das eine Klammer, in der die Begriffe mit OR verknüpft sind." },
    { term: "Stichwort", text: "ein freies Wort, das die Datenbank in Titel und Abstract sucht. In PubMed steht dahinter [tiab], in der Cochrane Library und in Embase :ti,ab,kw, in CINAHL TI/AB." },
    { term: "Schlagwort", text: "ein Begriff aus dem kontrollierten Vokabular der Datenbank, in PubMed MeSH ([Mesh]), in der Cochrane Library [mh …]. CINAHL Headings und Emtree sind lizenziert; dort schlägt das Tool Schlagworte aus MeSH vor." },
  ],

  /** Shown above the result when the input reads like a case description (no block, the string is still built). */
  caseNotice: {
    title: "Das liest sich wie ein Fall, nicht wie eine Frage.",
    body: "Aus einer Fragestellung wird der String zuverlässiger als aus einer Fallbeschreibung. Formuliere eine Frage mit Population, Intervention, Vergleich und Outcome, zum Beispiel «Wie wirkt … im Vergleich zu … bei … auf …?». Den String unten hat das Tool trotzdem aus deinem Text gebaut.",
    action: "Frage mit dem geführten Modus formulieren",
  },

  draftNote: {
    title: "Das ist ein Entwurf.",
    body: "Geh Begriffe und Schlagworte durch und schau dir die Trefferliste an, bevor du den String in einer Arbeit verwendest. Das Tool arbeitet mit festen Regeln, dem MeSH-Wörterbuch und einer eigenen Begriffstabelle. Wie es deutsche Wörter zuordnet, ist fachlich nicht geprüft.",
  },

  tabs: { generate: "Suchstring erstellen", lint: "Eigenen String prüfen", label: "Werkzeug" },

  question: {
    exampleLabel: "Beispiel",
    examplePlaceholder: "Beispiel wählen",
    textLabel: "Fragestellung",
    textLabelDemo: "Fragestellung",
    textPlaceholder: "Wie wirkt Krafttraining im Vergleich zu Massage auf die Schmerzen bei älteren Menschen mit Kniearthrose?",
    hint: "Eine Frage, am besten mit Population, Intervention, Vergleich und Outcome.",
    textHint:
      "Tipp: «bei» leitet die Population ein, «im Vergleich zu» den Vergleich, «auf die» das Outcome. Zeilen mit «P:», «I:», «C:», «O:» haben Vorrang.",
    analysing: "Frage wird ausgewertet",
    picoHint: "Was hier steht, landet fix im passenden Block, sobald du den String neu erstellst.",
    pico: {
      population: { label: "Population (P)", placeholder: "Wer? Person oder Erkrankung" },
      intervention: { label: "Intervention (I)", placeholder: "Was wird gemacht?" },
      comparison: { label: "Vergleich (C)", placeholder: "Womit wird verglichen?" },
      outcome: { label: "Outcome (O)", placeholder: "Was wird gemessen?" },
      studyType: { label: "Studientyp", placeholder: "zum Beispiel RCT" },
    },
    submit: "Suchstring erstellen",
    submitting: "Wird ausgewertet",
    resubmit: "Neu erstellen",
    emptyError: "Schreib zuerst eine Fragestellung oder füll ein PICO-Feld aus.",
    failError: "Die Frage liess sich nicht auswerten. Kürze den Text oder füll die PICO-Felder aus.",
    lockedBody: "In der Demo wählst du ein Beispiel. Eigene Fragen gibt es mit dem Abo.",
    editedHint: "«Suchstring erstellen» setzt deine Änderungen an den Komponenten zurück.",
    created: "Suchstring erstellt.",
  },

  /** The areas under the result, folded by default. Status lines tell whether it is worth opening one. */
  sections: {
    heading: "Anpassen",
    hint: "Alles optional. Was du hier änderst, steht sofort im String oben.",
    current: "Aktueller Schritt",
    concepts: {
      title: "Suchkomponenten",
      status: (n: number, withoutMesh: number, unused: number) => {
        const parts = [`${n} ${n === 1 ? "Komponente" : "Komponenten"}`]
        if (withoutMesh) parts.push(`${withoutMesh} ohne Schlagwort`)
        if (unused) parts.push(`${unused} ${unused === 1 ? "Wort" : "Wörter"} nicht übernommen`)
        return parts.join(", ")
      },
      none: "keine Komponente",
    },
    pico: {
      title: "PICO-Felder",
      status: (filled: number, total: number) => (filled ? `${filled} von ${total} ausgefüllt` : "keines ausgefüllt"),
      statusLocked: (filled: number, total: number) => (filled ? `${filled} von ${total} aus dem Beispiel` : "im Beispiel keines ausgefüllt"),
    },
    filters: {
      title: "Filter",
      none: "keine Filter",
      active: (n: number) => `${n} Filter aktiv`,
      suggestions: (n: number) => `${n} ${n === 1 ? "Vorschlag" : "Vorschläge"} aus deiner Frage`,
      names: { language: "Sprache", years: "Zeitraum", studyTypes: "Studientyp", humans: "nur Menschen", age: "Alter", sex: "Geschlecht" },
    },
    mesh: { title: "MeSH-Wörterbuch", status: "Schlagwort suchen, Deutsch oder Englisch" },
    table: {
      title: "Tabelle für die Übung (RefHunter)",
      status: (rows: number) => `${rows} ${rows === 1 ? "Zeile" : "Zeilen"}: Komponente, Stichworte, Schlagworte`,
    },
    diff: {
      title: "Unterschiede zwischen Datenbanken",
      status: (names: string) => names,
    },
    export: { title: "Export", status: "als .txt oder .json speichern" },
  },

  concepts: {
    hint: "Prüfe, ob das Tool deine Frage richtig verstanden hat. Entferne, verschiebe oder ergänze Komponenten.",
    emptyTitle: "Noch keine Suchkomponente.",
    emptyBody: "Erstelle den Suchstring oben oder füge unten eine Komponente hinzu.",
    detectedFrom: "erkannt aus",
    custom: "eigene Komponente",
    noMesh: "Kein Schlagwort. Diese Komponente wird nur über Stichworte gesucht.",
    blocks: {
      population: { title: "Population", sub: "Wer oder welche Erkrankung?" },
      intervention: { title: "Intervention", sub: "Was wird gemacht?" },
      comparison: { title: "Vergleich", sub: "Womit wird verglichen?" },
      outcome: { title: "Outcome", sub: "Was wird gemessen?" },
    } satisfies Record<Block, { title: string; sub: string }>,
    blockInclude: "Im Suchstring",
    blockExcluded: "Dieser Block steht nicht im String.",
    comparisonNote: "Ein Vergleich im String schränkt die Treffer meist zu stark ein, darum ist dieser Block aus.",
    emptyBlock: "Keine Komponente in diesem Block.",
    schlagworte: "Schlagworte (MeSH)",
    stichworte: "Stichworte",
    explodeOn: "mit Unterbegriffen",
    explodeOff: "ohne Unterbegriffe",
    explodeHelp: "Mit Unterbegriffen findet [Mesh] auch alle engeren MeSH-Terms darunter, ohne ([Mesh:NoExp]) nur diesen einen.",
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
    addTermHint: "Auf Englisch. Mit * trunkierst du: exercis* findet exercise, exercises und exercising.",
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
    candidatesHeading: "Nicht übernommene Wörter",
    candidatesHint:
      "Diese Wörter hat das Tool nicht als Komponente aufgenommen: Entweder kennt das Wörterbuch nur einen zu allgemeinen Begriff dafür, oder gar keinen. Übernimm sie bei Bedarf auf Englisch als Stichwort.",
    candidateSuggestion: "Im Wörterbuch",
    candidateAddSuggestion: "Als Komponente übernehmen",
    candidateAdd: "Als Stichwort übernehmen",
    candidateDismiss: "Verwerfen",
    candidateBlock: "Block",
    notices: "Hinweise zur Auswertung",
    meshTitle: "Definition und deutsche Bezeichnungen",
    englishName: "Englisch",
    scopeNote: "Definition (englisch)",
    germanNames: "Deutsche Bezeichnungen",
    noGerman: "Keine deutsche Bezeichnung im Wörterbuch.",
    alternativesHeading: "Anderes Schlagwort wählen",
    alternativesHint: "Das Wort kann mehrere Schlagworte meinen. Das Tool hat das für die Physiotherapie naheliegendste gewählt; passt ein anderes besser, schalte um.",
    alternativesUse: "Dieses nehmen",
    moreSynonyms: "Weitere Synonyme aus MeSH",
    moreSynonymsHint: "Ein Klick nimmt das Synonym als Stichwort auf.",
    truncOn: "mit *",
    truncOff: "ohne *",
    truncHelp: "exercise* findet auch exercises und exercising. Sinnvoll nur, wenn der Wortanfang eindeutig ist.",
    truncLabel: "Trunkierung",
    tree: {
      open: "Breiter oder enger",
      close: "Schliessen",
      heading: "Breiter oder enger suchen",
      hint: "Breiter findet mehr, enger weniger. «Mit Unterbegriffen» sucht ohnehin alles darunter.",
      broader: "Breiter",
      narrower: "Enger",
      noBroader: "Das ist schon der oberste Begriff in diesem Zweig.",
      noNarrower: "Keine engeren Begriffe.",
      use: "Ersetzen durch",
      loading: "Wörterbuch wird geladen",
      failed: "Der Begriff liess sich im Wörterbuch nicht finden.",
    },
  },

  mesh: {
    heading: "MeSH-Wörterbuch durchsuchen",
    hint: "Such ein Schlagwort auf Deutsch oder Englisch, lies die Definition und nimm es als Komponente auf. Deutsche Bezeichnungen gibt es für etwa die Hälfte der Schlagworte; findest du nichts, probier den englischen Namen.",
    label: "Schlagwort suchen",
    placeholder: "zum Beispiel Rückenschmerzen oder low back pain",
    loading: "Wörterbuch wird geladen",
    minChars: "Tippe mindestens drei Buchstaben.",
    noResults: "Keine Treffer. Probier den englischen Namen oder einen kürzeren Wortanfang.",
    failed: "Das Wörterbuch ist gerade nicht erreichbar. Versuch es später noch einmal.",
    results: (n: number) => `${n} ${n === 1 ? "Vorschlag" : "Vorschläge"}`,
    english: "Englisch",
    german: "Deutsch",
    noGerman: "keine deutsche Bezeichnung",
    category: "Bereich",
    treeNumbers: "Baumnummer",
    scopeNote: "Definition (englisch)",
    noScopeNote: "Keine Definition im Wörterbuch.",
    broader: "Breiter",
    narrower: "Enger",
    noBroader: "oberster Begriff",
    noNarrower: "keine engeren Begriffe",
    add: "Zu Suchkomponente hinzufügen",
    addBlock: "Block",
    added: "Hinzugefügt, oben im gewählten Block.",
    alreadyThere: "Diese Komponente gibt es schon.",
    categories: {
      A: "Körperregion und Anatomie",
      B: "Lebewesen",
      C: "Krankheit oder Beschwerde",
      D: "Medikament oder Substanz",
      E: "Verfahren und Geräte",
      F: "Psyche und Verhalten",
      G: "Körperfunktion und Vorgänge",
      H: "Fachgebiet",
      I: "Gesellschaft und Bildung",
      J: "Technik und Ernährung",
      L: "Information",
      M: "Personengruppe",
      N: "Gesundheitswesen",
      V: "Publikationstyp",
      Z: "Ort",
    } as Record<string, string>,
  },

  database: {
    legend: "Datenbank",
    atLeastOne: "Mindestens eine Datenbank bleibt gewählt.",
    cochraneFilters:
      "Für die Cochrane Library stehen Sprache, Zeitraum, Studientyp und «nur Menschen» nicht im String, weil sich das dort nicht zuverlässig als Syntax schreiben lässt. Im Ergebnis steht, was du unter «Search limits» einstellst. Alter und Geschlecht schreibt das Tool als MeSH-Check-Tag.",
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
    humansHint: "Schliesst reine Tierstudien aus. Steht im String für PubMed und Embase; die Cochrane Library und CINAHL haben dafür keinen Filter.",
    caseHeading: "Vorschläge aus deiner Frage",
    caseHint:
      "Alter und Geschlecht stehen manchmal in der Frage. Als Filter schränken sie stark ein, weil nicht jede Studie danach verschlagwortet ist. Darum sind sie aus; schalte sie nur ein, wenn die Frage auf diese Gruppe zielt.",
    fromCase: (evidence: string) => `aus «${evidence}»`,
    ageLabels: {
      "Infant, Newborn": "Neugeborene",
      Infant: "Säuglinge (bis 23 Monate)",
      "Child, Preschool": "Vorschulkinder (2 bis 5 Jahre)",
      Child: "Kinder (6 bis 12 Jahre)",
      Adolescent: "Jugendliche (13 bis 18 Jahre)",
      "Young Adult": "Junge Erwachsene (19 bis 24 Jahre)",
      Adult: "Erwachsene (19 bis 44 Jahre)",
      "Middle Aged": "Mittleres Alter (45 bis 64 Jahre)",
      Aged: "Ältere (65 bis 79 Jahre)",
      "Aged, 80 and over": "Hochbetagte (ab 80 Jahren)",
    } as Record<string, string>,
    sexLabels: { Male: "Männlich", Female: "Weiblich" } as Record<string, string>,
  },

  result: {
    heading: "Dein Suchstring",
    created: "Suchstring erstellt",
    stringLabel: "Suchstring für PubMed",
    draftShort: "Entwurf. Prüfe Begriffe und Treffer, bevor du ihn verwendest.",
    draftMore: "mehr",
    draftLess: "weniger",
    componentsLabel: "Erkannte Suchkomponenten",
    blockLetters: { population: "P", intervention: "I", comparison: "C", outcome: "O" } as Record<Block, string>,
    blockNames: { population: "Population", intervention: "Intervention", comparison: "Vergleich", outcome: "Outcome" } as Record<Block, string>,
    withMesh: "mit Schlagwort (MeSH)",
    meshMark: "MeSH",
    notInString: "nicht im String",
    noneInBlock: "keine",
    hints: (n: number, warnings: number) =>
      `${n} ${n === 1 ? "Hinweis" : "Hinweise"}${warnings ? `, davon ${warnings} ${warnings === 1 ? "Warnung" : "Warnungen"}` : ""}`,
    hintsShow: "anzeigen",
    hintsHide: "ausblenden",
    managerTitle: "Search Manager (zeilenweise)",
    openIn: (db: string) => `In ${db} öffnen`,
    noCount: (db: string) => `Keine Trefferzählung für ${db}: Die Datenbank ist lizenziert und hat keine offene Schnittstelle. Die Zahl siehst du dort selbst.`,
    managerTitleFor: (db: string) => `${db}, zeilenweise`,
    managerStatus: (n: number) => `${n} ${n === 1 ? "Zeile" : "Zeilen"}`,
    downloadLines: "Zeilen als .txt",
    exportFor: (db: string) => `Export ${db}`,
    exportLinesTxt: "Als .txt, zeilenweise",
    exportLinesJson: "Als .json, zeilenweise",
    stringLabelFor: (db: string) => `Suchstring für ${db}`,
    format: {
      label: "Format",
      single: "Eine Zeile",
      manager: "Search Manager (zeilenweise)",
    },
    copyLines: "Zeilen kopieren",
    linesCopied: "Zeilen kopiert",
    cochraneSingleHint:
      "Füge den String im Search Manager der Cochrane Library in eine Zeile ein. Eine Zeile versteht Klammern, AND, OR, NOT, [mh …] und Feldcodes.",
    cochraneManagerHint:
      "Ein Begriff pro Zeile, je Suchkomponente eine OR-Zeile, am Ende eine AND-Zeile: So siehst du die Trefferzahl jedes Begriffs. Lege die Zeilen der Reihe nach ab #1 an; die Nummern vergibt die Cochrane Library selbst. Ob mehrzeilig eingefügter Text dort automatisch auf Zeilen verteilt wird, haben wir nicht geprüft.",
    cochraneOpen: "In Cochrane Library öffnen",
    cochraneOpenHint: "Öffnet den Search Manager. Den String fügst du dort selbst ein; ein Link kann ihn nicht übergeben.",
    cochraneNoCount:
      "Eine Trefferzählung gibt es nur für PubMed. Für die Cochrane Library kennen wir keine offene Schnittstelle; der Search Manager zeigt dir die Zahl je Zeile.",
    limitsHeading: "Das stellst du in der Cochrane Library ein",
    limitsHint: "Diese Filter lassen sich dort nicht zuverlässig als Syntax schreiben, darum stehen sie nicht im String.",
    lineKinds: { term: "Begriff", component: "Suchkomponente", filter: "Filter", final: "Alles verknüpft" },
    diff: {
      heading: "So steht jede Suchkomponente in den gewählten Datenbanken",
      intro:
        "Dieselben Begriffe, je Datenbank anders geschrieben. Gleich bleiben die Logik (OR innerhalb, AND zwischen den Suchkomponenten) und die Klammern.",
      component: "Suchkomponente",
      pubmed: "PubMed",
      cochrane: "Cochrane Library",
      points: [
        "Schlagwort: [Mesh] wird zu [mh …]. Ohne Unterbegriffe schreibst du in PubMed [Mesh:NoExp], in der Cochrane Library ein ^ vor das Schlagwort.",
        "Stichwort: [tiab] wird zu :ti,ab,kw. Der Feldcode steht hinter dem Begriff, und die Cochrane Library sucht zusätzlich in den Schlüsselwörtern.",
        "Trunkierung: PubMed erlaubt * in Anführungszeichen, die Cochrane Library nicht. Dort wird aus «back exercise*» der Ausdruck (back NEXT exercise*).",
        "Filter: Sprache, Zeitraum und Studientyp stehen in PubMed im String, in der Cochrane Library stellst du sie unter «Search limits» ein.",
      ],
    },
    empty: "Noch kein Suchstring. Dafür braucht es mindestens eine Suchkomponente mit einem aktiven Begriff.",
    copy: "Kopieren",
    copied: "Kopiert",
    copyFailed: "Kopieren hat nicht geklappt. Markiere den String und kopiere ihn von Hand.",
    downloadTxt: "Als .txt",
    downloadJson: "Als .json",
    stats: (components: number, terms: number) =>
      `${components} ${components === 1 ? "Suchkomponente" : "Suchkomponenten"}, ${terms} ${terms === 1 ? "Begriff" : "Begriffe"}`,
    noticesHeading: "Hinweise zur Auswertung",
    tableHeading: "Suchkomponenten im Überblick",
    tableCols: { component: "Suchkomponente", keywords: "Stichworte", subjectHeadings: "Schlagworte (MeSH)", syntax: "Schreibweise" },
    none: "keine",
    legend: "So liest du den String: Schlagworte mit [Mesh] sind umrandet, Stichworte mit [tiab] sucht PubMed in Titel und Abstract, AND und OR sind grau.",
    legendCochrane:
      "So liest du den String: Schlagworte mit [mh …] sind umrandet, Stichworte mit :ti,ab,kw sucht die Cochrane Library in Titel, Abstract und Schlüsselwörtern, AND, OR und NEXT sind grau.",
    legendCinahl:
      "So liest du den String: Schlagworte mit (MH …) sind umrandet, gestrichelt heisst Vorschlag aus MeSH. Stichworte mit TI und AB sucht CINAHL in Titel und Abstract, Trunkierung * ist fett, AND, OR und N5 sind grau.",
    legendEmbase:
      "So liest du den String: Schlagworte mit /exp sind umrandet, gestrichelt heisst Vorschlag aus MeSH. Stichworte mit :ti,ab,kw sucht Embase in Titel, Abstract und Keywords, Limits wie /lim sind kursiv, AND, OR und NEXT sind grau.",
  },

  pubmed: {
    heading: "Treffer in PubMed",
    hint: "Optional. Zählt die Treffer je Suchkomponente und für den ganzen String, damit du siehst, welche Komponente zu stark einschränkt.",
    privacy: "Dein Browser schickt dafür nur den Suchstring an PubMed (NCBI, USA), nicht deine Frage.",
    count: "Treffer in PubMed zählen",
    recount: "Noch einmal zählen",
    counting: (done: number, total: number) => `Zähle … (${done} von ${total})`,
    cancel: "Abbrechen",
    cancelled: "Abgebrochen. Die bisherigen Zahlen stehen unten.",
    open: "In PubMed öffnen",
    colComponent: "Suchkomponente",
    colHits: "Treffer",
    total: "Ganzer String",
    pending: "ausstehend",
    failedRow: "Fehler",
    errors: {
      rate: "PubMed hat die Anfragen vorübergehend begrenzt. Warte eine Minute und zähle noch einmal.",
      network: "PubMed hat auch nach drei Versuchen nicht geantwortet. Zähl in einer Minute noch einmal. Klappt es nie, blockiert oft ein Werbeblocker, ein VPN oder das Netz der Hochschule die Anfrage. Die Trefferzahl siehst du auch mit «In PubMed öffnen».",
      query: "PubMed hat den String nicht verstanden. Öffne ihn in PubMed, dort steht, was nicht stimmt.",
      other: "Die Zählung hat nicht geklappt. Öffne den String direkt in PubMed.",
    },
    zeroTotal:
      "Der ganze String findet nichts. Lockere zuerst die Komponente mit den wenigsten Treffern: eine Komponente rausnehmen (drei bis vier reichen meist), den Block Population weglassen, ein enges Schlagwort über «Breiter oder enger» ersetzen oder trunkieren, denn ein Stichwort ohne * findet nur genau diese Wortform.",
    fewTotal:
      "Der ganze String findet nur wenige Treffer. Lockere zuerst die Komponente mit den wenigsten Treffern: ein breiteres Schlagwort, «mit Unterbegriffen» oder ein Synonym mehr als Stichwort.",
    manyTotal:
      "Der ganze String findet sehr viele Treffer. Eine engere Population, ein konkretes Outcome oder ein Studientyp-Filter grenzt ein.",
    number: (n: number) => n.toLocaleString("de-CH"),
  },

  severity: {
    info: "Hinweis",
    warning: "Warnung",
    error: "Fehler",
  } satisfies Record<NoticeSeverity | LintSeverity, string>,

  lint: {
    heading: "Eigenen String prüfen",
    hint: "Erkennt die Syntax, markiert typische Fehler und korrigiert, wo es geht.",
    check: "Prüfen",
    checkAgain: "Erneut prüfen",
    moreOptions: "Mehr Optionen",
    moreOptionsStatus: (syntax: string) => `Syntax: ${syntax}, umwandeln für andere Datenbanken`,
    marked: "Markierte Stellen im String",
    markedStatus: "String mit Markierungen lesen",
    resultsLabel: "Ergebnis der Prüfung",
    syntax: {
      label: "Syntax",
      auto: "Automatisch",
      pubmed: "PubMed",
      cochrane: "Cochrane Library",
      detected: (name: string) => `Erkannt: ${name}`,
    },
    convert: {
      toCochrane: "In Cochrane-Syntax umwandeln",
      toPubmed: "In PubMed-Syntax umwandeln",
      exampleToCochrane: "Korrigiertes Beispiel in Cochrane-Syntax zeigen",
      converted: "Umgewandelt. Geh das Ergebnis durch, bevor du es verwendest.",
      nothing: "Hier gab es nichts umzuwandeln.",
      appliedHeading: "Das hat das Tool gemacht",
      unsafeHeading: "Nicht umgewandelt, das prüfst du selbst",
      unsafeHint: "Diese Teile blieben unverändert, weil es keine sichere Entsprechung gibt. Das Tool rät nicht.",
    },
    inputLabel: "Suchstring einfügen",
    inputPlaceholder: '("back pain"[tiab] OR "Back Pain"[Mesh]) AND ...',
    lockedBody: "In der Demo prüfst du den Beispielstring. Eigene Strings gibt es mit dem Abo.",
    insertExample: "Beispielstring einfügen",
    resetExample: "Beispielstring zurücksetzen",
    clear: "Leeren",
    undo: "Rückgängig",
    markedHeading: "Markierte Stellen",
    emptyTitle: "Noch kein String.",
    emptyBody: "Füge einen Suchstring ein und klick auf «Prüfen».",
    notChecked: "Klick auf «Prüfen». Danach läuft die Prüfung beim Tippen mit.",
    cleanTitle: "Nichts gefunden.",
    cleanBody: "Die Syntax stimmt. Ob die Begriffe zu deiner Frage passen, beurteilst du selbst.",
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
    fixAllNone: "Hier lässt sich nichts automatisch korrigieren.",
    at: "Stelle",
    moreSpots: (n: number) => `und ${n} weitere ${n === 1 ? "Stelle" : "Stellen"}`,
  },

  demo: {
    ctaHeading: "Eigene Fragen auswerten",
    ctaBody:
      "Mit dem Abo schreibst du deine eigene Fragestellung, füllst die PICO-Felder aus, prüfst eigene Strings und spielst den geführten Modus mit deiner Frage durch. Das Abo gilt für alle Tools auf dieser Seite, auch für die, die noch dazukommen.",
    ctaPrimary: "Abo ansehen",
    ctaSecondary: "Anmelden",
    footnote:
      "Beispiele, Begriffstabelle und MeSH-Wörterbuch sind dieselben wie im Abo. Wörterbuch-Suche, Trefferzählung und geführter Modus laufen auch in der Demo, mit den Beispielfragen.",
  },

  /**
   * CINAHL (EBSCOhost) and Embase (embase.com): labels for the fields the engine puts into BuiltQuery
   * (vocabulary, platform, platformNotes, limitNotes, components[].headings, lines[].suggested) and for the lint syntax picker.
   */
  databasesExtra: {
    hints: {
      cinahl: "(MH \"…+\"), TI/AB und N-Operatoren für EBSCOhost. Schlagworte (CINAHL Headings) sind Vorschläge aus MeSH. Sprache, Zeitraum und Studientyp stellst du dort ein.",
      embase: "'…'/exp, :ti,ab,kw und NEXT/n für embase.com. Schlagworte (Emtree) sind Vorschläge aus MeSH. Sprache, Jahre und Studientyp stehen als Limits im String.",
    } as Record<string, string>,
    platforms: {
      cinahl: "EBSCOhost (CINAHL Complete)",
      embase: "embase.com (Elsevier)",
    } as Record<string, string>,
    vocabularyLabels: {
      "cinahl-headings": "CINAHL Headings",
      emtree: "Emtree",
    } as Record<string, string>,
    headings: {
      toggleLegend: "Schlagworte",
      toggleOn: "Mit Schlagwort-Vorschlägen",
      toggleOff: "Nur Stichworte",
      toggleHint: (vocabulary: string) =>
        `Die Schlagworte (${vocabulary}) leitet das Tool aus MeSH ab; den lizenzierten Thesaurus kennt es nicht. Schalte sie aus, wenn du nur mit Stichworten suchen willst.`,
      badge: "Vorschlag aus MeSH",
      badgeTitle: (vocabulary: string) => `Vorschlag aus MeSH, im Thesaurus prüfen (${vocabulary})`,
      checkNote: (vocabulary: string) => `Vorschlag aus MeSH, im Thesaurus prüfen (${vocabulary}).`,
      columnTitle: (vocabulary: string) => `Schlagworte (${vocabulary}, Vorschläge aus MeSH)`,
      offNote: "Nur Stichworte, keine Schlagworte im String.",
    },
    platformHeading: "So gibst du den String ein",
    limitNotesHeading: (db: string) => `Das stellst du in ${db} ein`,
    lines: {
      cinahl: "Zeilenweise (S1, S2 …)",
      embase: "Zeilenweise (#1, #2 …)",
      single: "Eine Zeile",
    } as Record<string, string>,
    lint: {
      syntaxLabels: {
        cinahl: "CINAHL (EBSCOhost)",
        embase: "Embase (embase.com)",
      } as Record<string, string>,
      detected: (label: string) => `Erkannt: ${label}`,
      ovidNote:
        "Embase über Ovid hat eine andere Syntax (exp …/, .ti,ab.). Sie wird erkannt, aber nicht geprüft.",
    },
    convert: {
      toCinahl: "In CINAHL-Syntax umwandeln",
      toEmbase: "In Embase-Syntax umwandeln",
      pubmedOnly: "Umgewandelt werden nur PubMed-Strings.",
    },
  },

  paywall: {
    title: "Suchstring-Generator",
    sub: "Mit dem Abo freigeschaltet.",
    lede: "Frage einfügen, Suchstring kopieren, bei Bedarf anpassen.",
    whatHeading: "Was das Tool macht",
    points: [
      "Liest deine Fragestellung nach PICO: erkennt «P:»-Zeilen und Wörter wie «bei», «im Vergleich zu» und «auf» und schlägt Alter und Geschlecht als Filter vor, wenn sie in der Frage stehen; eingeschaltet werden sie nur von dir. Ein eingefügter Fall oder ein Aufgabenblatt wird auch gelesen, aus einer Frage wird der String aber zuverlässiger.",
      "Erkennt Suchkomponenten in deutschen und englischen Fragen, auch bei «Rueckenschmerzen» statt «Rückenschmerzen». Zusammengesetzte Wörter wie «Schultertraining» zerlegt es in zwei Komponenten und sagt dir das.",
      "Kennt rund 17'000 MeSH-Schlagworte (MeSH 2026), etwa die Hälfte davon mit deutschen Bezeichnungen aus Wikidata und einer eigenen Liste. Im Wörterbuch stöberst du von Hand und gehst breiter oder enger.",
      "Zeigt zu jeder Komponente Schlagworte (MeSH) und Stichworte, die du entfernen, ergänzen, trunkieren oder in einen anderen Block verschieben kannst. Bei mehrdeutigen Wörtern schaltest du auf ein anderes Schlagwort um.",
      "Schreibt den String für PubMed, die Cochrane Library, CINAHL (EBSCOhost) und Embase (embase.com), jeweils in der Syntax der Datenbank, in einer Zeile oder zeilenweise für den Search Manager.",
      "CINAHL Headings und Emtree sind lizenziert. Diese Schlagworte sind darum Vorschläge aus MeSH, die du im Thesaurus prüfst oder ganz abschaltest. Filter, die sich in der Cochrane Library oder in CINAHL nicht als Syntax schreiben lassen, listet das Tool auf, statt Syntax zu erfinden; in Embase stehen sie als Limits im String.",
      "Zählt auf Wunsch die Treffer in PubMed, Komponente für Komponente, und sagt dir bei null oder sehr vielen Treffern, wo du lockern oder eingrenzen kannst. Für die anderen Datenbanken gibt es keine Trefferzählung; die Zahl siehst du dort selbst.",
      "Prüft eigene Strings in allen vier Syntaxen auf typische Fehler: typografische Anführungszeichen, fehlende Klammern bei AND und OR, fehlende Field Tags oder Feldcodes, falsche Zeilenbezüge. Vieles davon korrigiert es mit einem Klick.",
      "Wandelt zwischen PubMed- und Cochrane-Syntax um und PubMed-Strings in CINAHL- und Embase-Syntax, soweit das eindeutig geht, und listet auf, was es nicht übertragen konnte.",
      "Geführter Modus: acht Schritte durch deine eigene Frage, von der Prüfung der Fragestellung über PICO, Ein- und Ausschlusskriterien, Suchkomponenten und Begriffe bis zu Treffern und Arbeitsblatt. Das Blatt ist ein Entwurf zum Prüfen, keine Musterlösung.",
    ],
    sampleHeading: "So sieht ein Ergebnis aus",
    sampleCaption: "Beispiel: Rückentraining bei Büroangestellten mit chronischen Rückenschmerzen (OST Übung 3), erzeugt mit diesem Tool. Ein Entwurf, kein fertiger String.",
    sampleLoading: "Beispiel wird berechnet",
    privacy: "Deine Frage bleibt auf deinem Gerät. Das Tool lädt nur Teile eines öffentlichen MeSH-Wörterbuchs von physio.sweber.dev nach, nie deinen Text. Die Trefferzählung ist optional und schickt nur den fertigen String an PubMed.",
    demoLink: "Kostenlose Demo ausprobieren",
    aboLink: "Abo ansehen",
    loginLink: "Anmelden",
    loginHint: "Schon ein Abo? Dann melde dich an.",
    verifyHint: "Du bist angemeldet, hast aber noch kein aktives Abo.",
  },
} as const
