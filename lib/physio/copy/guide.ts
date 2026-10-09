/**
 * Strings of the guided mode ("Geführter Modus"): the panel, the Suchstring-Generator
 * guide and the lint guide. German, Swiss orthography, informal "du". Change wording
 * here, not in the components or the step logic.
 */

export const guideCopy = {
  name: "Geführter Modus",

  toolBadge: "mit Anleitung",

  toggle: {
    label: "Geführter Modus",
    hintOff: "Führt dich in acht Schritten von der Fragestellung bis zum Arbeitsblatt.",
    hintOn: "Läuft. Du arbeitest normal im Tool weiter.",
  },

  invite: {
    title: "Neu hier? Geh deine Fragestellung Schritt für Schritt durch.",
    body: "Acht Schritte von der Fragestellung bis zum Arbeitsblatt: Frage prüfen, PICO, Ein- und Ausschlusskriterien, Suchkomponenten, Begriffe, Suchstring, Treffer. Die Hinweise beziehen sich auf deine Frage, und du arbeitest dabei normal im Tool.",
    start: "Anleitung starten",
    later: "Nicht jetzt",
  },

  panel: {
    label: "Geführter Modus",
    stepOf: (i: number, n: number) => `Schritt ${i} von ${n}`,
    yourCase: "Bei deiner Frage:",
    yourTurn: "Jetzt du:",
    next: "Weiter",
    prev: "Zurück",
    skip: "Trotzdem weiter",
    stillOpen: "Dieser Schritt ist noch offen.",
    finish: "Fertig",
    minimise: "Einklappen",
    expand: "Anleitung öffnen",
    stop: "Anleitung beenden",
    restart: "Neu starten",
    restartHint: "Zurück zu Schritt 1. Deine Änderungen an PICO und Kriterien werden verworfen.",
    jumpTo: (i: number, title: string) => `Schritt ${i}: ${title}`,
    progress: "Fortschritt",
    announce: (i: number, n: number, title: string) => `Schritt ${i} von ${n}: ${title}`,
    noObservations: "Sobald die Frage ausgewertet ist, stehen hier Beobachtungen dazu.",
    privacy:
      "Frage, Angaben und Arbeitsblatt bleiben in deinem Browser. Gemerkt werden nur der aktuelle Schritt und ob die Anleitung an ist.",
    demoNotice:
      "Demo: Der geführte Modus läuft hier mit den Beispielfragen. Mit dem Abo spielst du deine eigene Frage und deinen eigenen String durch.",
    demoLink: "Mit dem Abo freischalten",
  },

  tones: { good: "In Ordnung", warn: "Achtung", info: "Hinweis" },

  /* ── Suchstring-Generator: Schritte ────────────────────────────── */

  suchstring: {
    steps: {
      question: {
        title: "Fragestellung prüfen",
        body: [
          "Eine gute Frage nennt vier Dinge: Population (wer?), Intervention (was wird gemacht?), Vergleich (womit wird verglichen?) und Outcome (was soll sich ändern?). Der Vergleich darf fehlen, die anderen drei nicht.",
          "Das Tool liest deine Frage und zeigt dir hier, was es erkannt hat. Fehlt ein Teil, schreib die Frage um und erstelle den String neu.",
        ],
        actionDemo: "Die Beispielfrage ist geladen. Vergleiche sie mit der Liste: Hat das Tool alle Teile gefunden? Unter «Beispiel» wählst du eine andere Frage.",
        actionFull: "Schreib deine Frage bei «Fragestellung» und klick auf «Suchstring erstellen». Fehlt in der Liste ein Teil, ergänze ihn in der Frage.",
        actionCase: "Dein Text liest sich wie eine Fallbeschreibung. Formuliere daraus im nächsten Schritt eine Frage und erstelle den String damit neu.",
      },
      pico: {
        title: "PICO formulieren",
        body: [
          "PICO zerlegt die Frage in vier Teile: Population (wer?), Intervention (was wird gemacht?), Comparison (womit wird verglichen?) und Outcome (was soll sich ändern?).",
          "Die Tabelle ist aus deiner Frage vorausgefüllt. Das sind Vorschläge: Ändere jede Zelle, bis sie stimmt. Die Fragestellung ist deine eigene Frage in sauberer Form. Änderst du eine Zelle, baut sie sich aus der Tabelle neu auf.",
        ],
        action: "Prüfe jede Zelle und die Fragestellung. Population, Intervention und Outcome müssen ausgefüllt sein.",
      },
      criteria: {
        title: "Ein- und Ausschlusskriterien",
        body: [
          "Kriterien legen vorher fest, welche Studien du behältst und welche nicht. Jedes braucht eine kurze Begründung.",
          "Einige setzt du schon in der Suche als Filter, zum Beispiel Studientyp, Sprache und Zeitraum. Die meisten wendest du erst beim Screening an, wenn du Titel und Abstracts liest. In der Cochrane Library und in CINAHL stellst du die Filter in der Datenbank ein, das Tool listet sie dir auf.",
        ],
        action: "Behalte, ändere oder streiche jedes Kriterium. Die Filter setzt du unter «Anpassen» bei «Filter».",
      },
      components: {
        title: "Suchkomponenten festlegen",
        body: [
          "Eine Suchkomponente ist ein Baustein deiner Frage und wird im String zu einer Klammer. Meist gibt es eine pro PICO-Teil, manchmal mehrere in einem Teil, zum Beispiel Beruf und Beschwerde.",
          "Gleiche die Komponenten mit deiner PICO-Tabelle ab. Entferne, was nicht dazugehört, und ergänze mit «Komponente ergänzen» oder dem MeSH-Wörterbuch, was fehlt.",
        ],
        action: "Gleiche die Komponenten mit deiner PICO-Tabelle ab und passe sie an.",
      },
      terms: {
        title: "Stichworte und Schlagworte",
        body: [
          "Zu jeder Komponente gehören zwei Arten von Begriffen: Stichworte sind freie Wörter, die die Datenbank in Titel und Abstract sucht. Schlagworte sind die Begriffe aus dem Thesaurus der Datenbank, in PubMed MeSH.",
          "Denk auf Deutsch, übersetze ins Englische und prüfe die Schlagworte im MeSH-Wörterbuch. Für CINAHL und Embase sind die Schlagworte Vorschläge aus MeSH, die du im Thesaurus der Datenbank prüfst.",
        ],
        action: "Prüfe pro Komponente: Passen die englischen Stichworte? Gibt es ein Schlagwort? Trunkiere (*) nur, wo der Wortanfang eindeutig ist.",
      },
      string: {
        title: "Suchstring entwickeln",
        body: [
          "Jede Suchkomponente wird zu einer Klammer. Innen stehen alle Begriffe mit OR (ein Treffer reicht), zwischen den Klammern steht AND (alle Komponenten müssen vorkommen).",
          "Phrasen aus mehreren Wörtern stehen in Anführungszeichen, jeder Begriff trägt ein Field Tag, und der * trunkiert.",
        ],
        action: "Lies den String von innen nach aussen und prüfe, ob jede Klammer zu einer Komponente deiner Tabelle passt.",
      },
      check: {
        title: "Prüfen und Treffer",
        body: [
          "Bevor du den String verwendest, prüfst du ihn: Zähl die Treffer pro Komponente und im Ganzen und lies ein paar Titel. Passen sie zu deiner Frage?",
          "Zu wenige Treffer heissen meist: eine Komponente ist zu eng. Zu viele heissen: der String ist zu weit.",
        ],
        actionPubmed: "Klick im Ergebnis auf «Treffer in PubMed zählen». Die Zahlen erscheinen danach hier.",
        actionOther: (db: string) => `Kopiere den String in ${db}, schau die Trefferzahl an und lies die ersten Titel. Eine Zählung gibt es hier nur für PubMed.`,
      },
      worksheet: {
        title: "Arbeitsblatt",
        body: [
          "Hier steht alles aus den Schritten davor auf einem Blatt: PICO, Fragestellung, Kriterien, Suchkomponenten und String.",
          "Das ist ein Entwurf zum Prüfen, keine Musterlösung. Kopiere ihn, lade ihn herunter oder drucke ihn.",
        ],
        action: "Lies das Blatt einmal durch und ändere in den Schritten davor, was nicht stimmt.",
      },
    },

    obs: {
      empty: "Noch keine Auswertung. Starte sie mit «Suchstring erstellen».",
      busy: "Deine Frage wird gerade ausgewertet.",

      // question
      caseLike:
        "Dein Text liest sich wie eine Fallbeschreibung. Das Tool wertet ihn trotzdem aus, aus einer Frage wird der String aber zuverlässiger. Formuliere im nächsten Schritt eine Frage nach PICO und erstelle den String damit neu.",
      allParts: "Population, Intervention und Outcome stehen in der Frage. Das ist die Grundlage für einen brauchbaren String.",
      missingPopulation: "Es fehlt eine Population: Wer ist gemeint? Nenne die Personengruppe oder die Erkrankung, zum Beispiel «Menschen mit Kniearthrose».",
      missingIntervention: "Es fehlt eine Intervention: Was wird gemacht oder untersucht? Zum Beispiel «Krafttraining» oder «Manuelle Therapie».",
      missingOutcome: "Es fehlt ein Outcome: Was soll sich verbessern? Zum Beispiel «auf die Schmerzen» oder «auf die Beweglichkeit».",
      populationLabel: "Population (P)",
      interventionLabel: "Intervention (I)",
      comparisonLabel: "Vergleich (C)",
      outcomeLabel: "Outcome (O)",
      outcomePhrase: (phrase: string) => `In der Frage: «${phrase}»`,
      noAgeStated: "In der Frage steht kein Alter. Das Tool nimmt deshalb keines an und schlägt keinen Altersfilter vor.",
      person:  (parts: string[]) => parts.join(", "),
      personLabel: "Person",
      age: (years: number | null, group: string | null, evidence: string) =>
        years !== null ? `${years} Jahre («${evidence}»), im MeSH die Altersgruppe «${group}»` : `«${evidence}», im MeSH die Altersgruppe «${group}»`,
      ageLabel: "Alter",
      sex: (sex: "Male" | "Female", evidence: string) => `${sex === "Male" ? "männlich" : "weiblich"} (aus «${evidence}»)`,
      sexLabel: "Geschlecht",
      sexNote: "Alter und Geschlecht sind im Tool nur als optionale Filter vorgeschlagen, weil sie die Treffer stark einschränken.",
      groups: (items: Array<{ matched: string; label: string }>) => items.map((i) => (i.matched && i.matched !== i.label ? `«${i.matched}» als ${i.label}` : i.label)).join(", "),
      groupsLabel: "Gruppe",
      conditions: (items: Array<{ matched: string; label: string }>) => items.map((i) => (i.matched && i.matched !== i.label ? `${i.label} (aus «${i.matched}»)` : i.label)).join(", "),
      conditionsLabel: "Erkrankung",
      duration: (d: string, q: string | null) => `«${d}»${q ? `, im Text steht «${q}»` : ""}`,
      durationLabel: "Dauer",
      radiatingLabel: "Ausstrahlung",
      radiating: "Die Schmerzen strahlen aus. Das kann für die Population wichtig sein, das Tool wertet es aber nicht aus.",
      interventions: (items: Array<{ matched: string; label: string }>) => items.map((i) => `${i.label}${i.matched && i.matched !== i.label ? ` (aus «${i.matched}»)` : ""}`).join(", "),
      goals: (items: Array<{ noun: string; verb: string }>) => items.map((g) => `${g.noun} ${g.verb}`).join(", "),
      goalsLabel: "Ziele",
      outcomes: (items: Array<{ matched: string; label: string }>) => items.map((i) => `${i.label}${i.matched ? ` (aus «${i.matched}»)` : ""}`).join(", "),
      comparisons: (items: Array<{ matched: string; label: string }>) => items.map((i) => `${i.label}${i.matched && i.matched !== i.label ? ` (aus «${i.matched}»)` : ""}`).join(", "),
      noComparison: "Kein Vergleich genannt. Das ist erlaubt, die Frage wirkt dann offener. Willst du vergleichen, nenne womit, zum Beispiel «im Vergleich zu üblicher Behandlung».",
      ignored: (items: string[]) => `${items.map((i) => `«${i.length > 70 ? `${i.slice(0, 69)}…` : i}»`).join(", ")}. Aufgabenanweisungen liest das Tool nicht als Teil der Frage.`,
      ignoredLabel: "Überlesen",
      unmapped: (words: string[]) => `${words.join(", ")}. Wenn sie dir wichtig sind, übernimm sie unter «Nicht übernommene Wörter» auf Englisch als Stichwort.`,
      unmappedLabel: "Nicht übernommen",
      nothingFound: "Aus dem Text konnte das Tool keine Komponente erkennen. Schreib die Fragestellung mit Hauptwörtern oder füll die PICO-Felder aus.",

      // pico
      picoCell: (basis: string[], source: "typed" | "question" | "none", edited: boolean) =>
        edited
          ? "Von dir geändert."
          : source === "typed"
            ? "Aus deiner eigenen PICO-Angabe."
            : source === "question" && basis.length
              ? `Aus: ${basis.join("; ")}.`
              : "In der Frage nicht gefunden. Schreib es selbst in die Tabelle.",
      picoEvidence: (sentence: string) => `In der Frage: «${sentence}»`,
      picoCMissing: "Der Vergleich ist leer. In der Frage steht keiner: Entscheide, womit du vergleichst. Die Frage geht auch ohne, dann wirkt sie offener.",
      picoMissing: (keys: string[]) => `Noch leer: ${keys.join(", ")}. Ohne diese Teile ist die Frage nicht vollständig.`,
      picoOk: "Population, Intervention und Outcome sind ausgefüllt.",
      picoQuestionEdited: "Du hast die Fragestellung selbst geschrieben. Sie folgt der Tabelle nicht mehr automatisch.",
      picoGrammar: "Die Grammatik der Fragestellung prüfst du selbst: Das Tool setzt nur die Wörter aus der Tabelle ein.",

      // criteria
      criteriaCount: (inc: number, exc: number) => `${inc} Einschluss- und ${exc} Ausschlusskriterien aus deiner Frage vorgeschlagen.`,
      criteriaScreeningOnly: (n: number) => `${n} Kriterien wendest du erst beim Screening an, weil kein Filter dafür taugt.`,
      criteriaFilterMissing: (items: string[]) => `Als Kriterium behalten, aber im Filter nicht gesetzt: ${items.join(", ")}.`,
      criteriaFilterSet: (items: string[]) => `Im Filter gesetzt: ${items.join(", ")}.`,
      criteriaNone: "Alle Kriterien sind gestrichen. Behalte mindestens eines und begründe es.",
      criteriaNoAge: "In der Frage steht kein Alter, deshalb schlägt das Tool keine Altersgrenze vor. Entscheide selbst, ob du die Altersgruppe einschränkst, und begründe es.",
      criteriaDemographics: (parts: string[]) => `Das Tool schlägt ${parts.join(" und ")} als Filter vor (aus deiner Frage), standardmässig aus. Das schliesst Studien ohne diese Angaben aus.`,
      criteriaDatabases: (labels: string[]) => `Gesucht wird in: ${labels.join(", ")}.`,

      // components
      mappingEmpty: "keine Komponente",
      comparisonOff: (labels: string[]) =>
        `${labels.join(", ")} steht im Block Vergleich, der Block ist aber ausgeschaltet: Ein Vergleich im String schränkt die Treffer meist zu stark ein. Du prüfst ihn später beim Screening. Schalte ihn bei «Im Suchstring» ein, wenn du ihn doch im String willst.`,
      comparisonOn: (labels: string[]) => `${labels.join(", ")} steht im String. Das schränkt die Treffer stark ein: Zähl später nach, ob die Suche noch etwas findet.`,
      noMesh: (labels: string[]) => `Ohne Schlagwort (nur Stichworte): ${labels.join(", ")}. Such im MeSH-Wörterbuch nach einem passenden Schlagwort. Gibt es keines, sind Stichworte in Ordnung.`,
      many: (n: number) => `${n} Komponenten sind mit AND verknüpft. Je mehr Komponenten, desto weniger Treffer: Drei bis vier reichen meist.`,
      fine: (n: number) => `${n} Komponenten: ein vernünftiger Umfang.`,
      picoUncovered: (keys: string[]) => `Zu diesen PICO-Teilen gibt es keine Komponente: ${keys.join(", ")}. Füg eine hinzu, wenn sie in den String sollen.`,
      painInCondition: "«Schmerzen» in deinem Outcome braucht keine eigene Komponente: Die Beschwerde-Komponente enthält die Schmerzen schon. Eine zusätzliche hätte meist nur Treffer-Verlust zur Folge.",
      conceptsLeft: (n: number) => `${n} Komponenten sind im Tool aktiv.`,
      blockNoConcept: (block: string) => `Im Block ${block} gibt es keine Komponente.`,

      // terms
      termsCounts: (mesh: number, text: number) => `Insgesamt ${mesh} Schlagwort${mesh === 1 ? "" : "e"} und ${text} Stichwort${text === 1 ? "" : "e"}.`,
      termsMissingMesh: (labels: string[]) => `Kein Schlagwort bei: ${labels.join(", ")}. Im MeSH-Wörterbuch kannst du eines suchen und mit «Zu Suchkomponente hinzufügen» aufnehmen.`,
      termsBroad: (label: string, n: number) => `«${label}» hat ${n} Begriffe. Je mehr Begriffe mit OR, desto breiter die Komponente: Prüf, ob alle zu deiner Frage passen, und streiche das Überflüssige.`,
      termsTrunc: (hints: string[]) => `Trunkierung prüfen: ${hints.join(", ")}. Der Stern findet alle Wortformen, aber nur, wenn der Wortanfang eindeutig ist.`,
      termsGerman: (matched: string, mesh: string | null, text: string | null) =>
        `«${matched}» wird zu ${[mesh ? `Schlagwort «${mesh}»` : null, text ? `Stichwort «${text}»` : null].filter(Boolean).join(" und ")}`,

      // string
      stringGroups: (n: number) => `Dein String hat ${n} Klammer${n === 1 ? "" : "n"}, eine pro Suchkomponente.`,
      group: (n: number, label: string, mesh: number, text: number) =>
        `${n}. ${label}: ${mesh} Schlagwort${mesh === 1 ? "" : "e"} und ${text} Stichwort${text === 1 ? "" : "e"}, alle mit OR`,
      groupLabel: "Klammern",
      sample: (mesh: string | null, text: string | null) =>
        [mesh ? `Schlagwort: ${mesh}` : null, text ? `Stichwort: ${text}` : null].filter(Boolean).join(" · "),
      sampleLabel: "Field Tags",
      sampleNote: "Der Teil hinter dem Begriff sagt der Datenbank, wo sie suchen soll.",
      phrases: (n: number, example: string) => `${n} Begriff${n === 1 ? "" : "e"} bestehen aus mehreren Wörtern und stehen deshalb in Anführungszeichen, zum Beispiel ${example}.`,
      phrasesLabel: "Anführungszeichen",
      trunc: (terms: string[]) => `Mit Stern: ${terms.join(", ")}`,
      truncLabel: "Trunkierung",
      noTrunc: "Kein Begriff ist trunkiert. Das ist sicher, findet aber nur genau diese Wortformen.",
      filters: (clauses: string[]) => clauses.join(" AND "),
      filtersLabel: "Filter im String",
      noFilters: "Keine Filter im String. Die Kriterien prüfst du beim Screening.",
      lines: (n: number) => `${n} Zeilen im Search Manager, die letzte kombiniert alle Komponenten mit AND.`,
      linesLabel: "Zeilen",
      database: (label: string) => `Der String ist für ${label} geschrieben. Die Schreibweise der Field Tags unterscheidet sich je Datenbank.`,
      databaseLabel: "Datenbank",
      combine: "Zwischen den Klammern steht AND: Ein Treffer muss aus jeder Komponente mindestens einen Begriff enthalten.",

      // check
      checkNone: "Noch keine Zahlen. Die Zählung ist optional und schickt nur den String an PubMed.",
      checkPartial: (done: number) => `${done} Zeilen gezählt. Warte, bis die Zählung fertig ist.`,
      checkError: "Die Zählung wurde unterbrochen. Versuch es später noch einmal oder öffne den String direkt in PubMed.",
      checkTotal: (n: number) => `Der ganze String findet ${n.toLocaleString("de-CH")} Treffer.`,
      checkZero: (narrowest: { label: string; count: number } | null, zeros: string[]) =>
        `Der ganze String findet nichts. ${
          zeros.length
            ? `Schon ${zeros.length === 1 ? "die Komponente" : "die Komponenten"} «${zeros.join("», «")}» ${zeros.length === 1 ? "findet" : "finden"} allein nichts: Prüfe dort die Begriffe auf Tippfehler.`
            : narrowest
              ? `Die engste Komponente ist «${narrowest.label}» mit ${narrowest.count.toLocaleString("de-CH")} Treffern.`
              : ""
        }`,
      checkZeroAdvice: (narrowest: string | null, optional: string[]) =>
        `Lockere zuerst bei «${narrowest ?? "der engsten Komponente"}». ${
          optional.length ? `Meist kannst du ${optional.map((o) => `«${o}»`).join(" oder ")} aus dem String nehmen (Population und Vergleich schränken am stärksten ein) und beim Screening prüfen.` : "Streiche eine Komponente oder wähle ein breiteres Schlagwort."
        }`,
      checkFew: (n: number, narrowest: string | null) => `${n} Treffer sind wenige. Lockere die engste Komponente${narrowest ? ` («${narrowest}»)` : ""}: ein breiteres Schlagwort, «mit Unterbegriffen» oder ein Synonym mehr.`,
      checkMany: (n: number, widest: string | null) =>
        `${n.toLocaleString("de-CH")} Treffer sind sehr viele. Grenze ein: eine engere Population, ein konkretes Outcome oder der Studientyp-Filter${widest ? ` (die weiteste Komponente ist «${widest}»)` : ""}.`,
      checkOk: (n: number) => `${n.toLocaleString("de-CH")} Treffer sind ein Umfang, den du mit Titeln und Abstracts durchgehen kannst. Lies trotzdem die ersten Titel: Passen sie zu deiner Frage?`,
      checkComponents: (rows: Array<{ label: string; count: number }>) => rows.map((r) => `${r.label}: ${r.count.toLocaleString("de-CH")}`).join(" · "),
      checkComponentsLabel: "Je Komponente",
      checkOther: (db: string) => `Für ${db} gibt es hier keine Trefferzählung. Zähl dort selbst: erst den ganzen String, dann jede Komponente allein.`,
      checkOtherSteps: "Passen die ersten Titel zu deiner Frage? Fehlen Studien, die du schon kennst? Findet jede Komponente allein etwas?",
      checkReference: "Tipp: Such eine Studie, die du schon kennst. Findet der String sie nicht, fehlt ein Begriff.",

      // worksheet
      worksheetContents: (criteria: number, components: number) => `Das Blatt enthält PICO, Fragestellung, ${criteria} Kriterien, ${components} Suchkomponenten und den Suchstring.`,
      worksheetOpen: (items: string[]) => `Noch offen: ${items.join(", ")}.`,
      worksheetDraft: "Das Blatt ist ein Entwurf zum Prüfen. Es ist keine Musterlösung und keine Bewertung.",
      worksheetNoComparison: "Vergleich fehlt in der PICO-Tabelle",
      worksheetNoCriteria: "keine Kriterien",
      worksheetNoComponents: "keine Suchkomponente",
      worksheetNoQuestion: "Fragestellung fehlt",
    },

    panels: {
      pico: {
        table: "PICO-Tabelle",
        question: "Fragestellung",
        questionHint: "Wie wirkt … im Vergleich zu … bei … auf …?",
        reset: "Vorschlag wiederherstellen",
        edited: "geändert",
        letters: {
          P: { label: "P, Population", hint: "Wer? Person und Beschwerde." },
          I: { label: "I, Intervention", hint: "Was wird gemacht?" },
          C: { label: "C, Vergleich", hint: "Womit wird verglichen? Darf leer bleiben." },
          O: { label: "O, Outcome", hint: "Was soll sich ändern?" },
        },
        placeholder: "noch leer",
      },
      criteria: {
        include: "Einschluss",
        exclude: "Ausschluss",
        reasonLabel: "Begründung",
        remove: "Streichen",
        restore: "Wiederherstellen",
        removed: "gestrichen",
        where: { filter: "Filter in der Suche", screening: "Beim Screening", both: "Filter oder Screening" },
        addHeading: "Eigenes Kriterium",
        addKind: "Art",
        addText: "Kriterium",
        addReason: "Begründung",
        addButton: "Hinzufügen",
        empty: "Keine.",
        myOwn: "eigenes",
        legendFilter: "Kann ein Filter werden",
      },
      terms: {
        heading: "Suchkomponenten, Stichworte, Schlagworte",
        component: "Suchkomponente",
        keywords: "Stichworte",
        subjectHeadings: "Schlagwort(e)",
        noMesh: "keines",
        none: "–",
        caption: "Die Tabelle im Format der Übung: Suchkomponente, Stichworte, Schlagworte.",
        german: "Deutsch gedacht",
      },
      worksheet: {
        heading: "Arbeitsblatt",
        draft: "Entwurf zum Prüfen, keine Musterlösung.",
        copy: "Kopieren",
        copied: "Kopiert",
        copyFailed: "Kopieren hat nicht geklappt. Markiere den Text von Hand.",
        downloadTxt: "Als .txt",
        downloadMd: "Als .md",
        print: "Drucken",
        preview: "Vorschau",
        empty: "Noch kein Arbeitsblatt: Es fehlen Suchkomponenten.",
        fileBase: "arbeitsblatt-suchstring",
      },
    },
  },

  /* ── Eigenen String prüfen ─────────────────────────────────────── */

  lint: {
    yourData: "Bei deinem String:",
    steps: {
      input: {
        title: "String bereitstellen",
        body: [
          "Hier prüfst du einen Suchstring, den du selbst geschrieben hast, zum Beispiel aus einer Übung. Das Tool erkennt die Syntax (PubMed, Cochrane Library, CINAHL oder Embase) und markiert typische Fehler.",
          "Die Prüfung beurteilt die Schreibweise, nicht ob die Begriffe zu deiner Frage passen.",
        ],
        actionDemo: "In der Demo ist ein Beispielstring mit typischen Fehlern geladen. Überschreiben kannst du ihn nicht, die Korrekturen aber ausprobieren.",
        actionFull: "Füge deinen Suchstring ein und klick auf «Prüfen».",
      },
      findings: {
        title: "Befunde einzeln durchgehen",
        body: [
          "Geh die Befunde nacheinander durch, Fehler zuerst. Zu jedem siehst du, was gemeint ist und was du ändern kannst.",
          "Korrigieren kannst du direkt bei der markierten Stelle im Tool: «Korrigieren» wendet den Vorschlag an, «Zur Stelle» springt in den Text.",
        ],
        action: "Lies einen Befund, korrigiere ihn im Tool und geh zum nächsten.",
      },
      recheck: {
        title: "Nochmals prüfen",
        body: [
          "Nach jeder Korrektur prüft das Tool den String neu. So siehst du sofort, ob ein Fehler weg ist oder ob dadurch ein neuer entstanden ist.",
          "Korrigiere, bis keine Fehler mehr da sind. Warnungen und Hinweise darfst du bewusst stehen lassen, wenn du weisst warum.",
        ],
        action: "Korrigiere weiter und schau, wie die Zahl der Befunde sinkt. «Alles automatisch korrigieren» erledigt die einfachen Fälle auf einmal.",
      },
      checklist: {
        title: "Checkliste für einen sauberen String",
        body: [
          "So sieht ein sauberer String aus. Die Haken setzt das Tool, soweit es das prüfen kann. Den Rest beurteilst du.",
        ],
        action: "Geh die Liste durch. Alles, was offen ist, korrigierst du oben im Tool.",
      },
    },
    obs: {
      empty: "Noch kein String. Füge oben einen Suchstring ein.",
      length: (n: number) => `Dein String hat ${n.toLocaleString("de-CH")} Zeichen.`,
      summary: (errors: number, warnings: number, infos: number) => {
        const parts: string[] = []
        if (errors) parts.push(`${errors} Fehler`)
        if (warnings) parts.push(`${warnings} ${warnings === 1 ? "Warnung" : "Warnungen"}`)
        if (infos) parts.push(`${infos} ${infos === 1 ? "Hinweis" : "Hinweise"}`)
        return parts.join(", ")
      },
      clean: "Nichts gefunden: Die Schreibweise stimmt.",
      errorsFirst: "Fehler zuerst: Sie verhindern, dass die Datenbank den String so versteht, wie du ihn meinst.",
      fixable: (n: number) => `${n} Befund${n === 1 ? "" : "e"} lassen sich automatisch korrigieren.`,
      progress: (now: number, before: number) =>
        now === 0 ? `Von ursprünglich ${before} Befunden ist keiner mehr offen.` : now < before ? `Von ursprünglich ${before} Befunden sind noch ${now} offen.` : `Es sind ${now} Befunde offen (am Anfang ${before}).`,
      progressLabel: "Stand",
      noErrors: "Keine Fehler mehr.",
      errorsLeft: (n: number) => `Noch ${n} Fehler. Warnungen und Hinweise haben Zeit, Fehler nicht.`,
      step3Empty: "Noch kein String.",
    },
    panels: {
      findings: {
        heading: "Befund",
        of: (i: number, n: number) => `Befund ${i} von ${n}`,
        prev: "Vorheriger",
        next: "Nächster",
        meaning: "Was das heisst",
        todo: "Was du tun kannst",
        autoFix: (label: string) => `Im Tool geht das mit einem Klick: «Korrigieren» (${label}).`,
        manual: "Das musst du von Hand ändern: Das Tool kann hier nicht raten, was du meinst.",
        place: "Stelle im String",
        none: "Keine Befunde.",
      },
      checklist: {
        auto: "vom Tool geprüft",
        manual: "prüfst du selbst",
        ok: "erfüllt",
        open: "offen",
      },
    },
    /** Explanation per finding code of the linter. */
    explain: {
      "quotes-typographic": { meaning: "Word und Mail ersetzen gerade Anführungszeichen oft durch typografische („ “). PubMed liest nur gerade Anführungszeichen als Phrase.", todo: "Ersetze alle durch das gerade Zeichen \". Das macht «Korrigieren» für dich." },
      "stray-after-quote": { meaning: "Direkt hinter dem schliessenden Anführungszeichen steht ein Buchstabe oder ein Zeichen. Das ist meist ein Tippfehler.", todo: "Lösche das Zeichen." },
      "stray-char": { meaning: "Ein Zeichen steht ohne Zusammenhang im String und gehört weder zu einem Begriff noch zu einem Operator.", todo: "Lösche das Zeichen oder schreib den Begriff fertig." },
      "no-field-tag": { meaning: "Ohne Field Tag sucht PubMed in allen Feldern und ordnet deine Wörter selbst einem MeSH-Begriff zu (Automatic Term Mapping). Das Ergebnis ist schwer vorhersehbar.", todo: "Hänge an jedes Stichwort [tiab] und an jedes Schlagwort [Mesh]." },
      "trunc-in-phrase": { meaning: "Ein Stern in einer Phrase funktioniert nur mit Anführungszeichen und Field Tag.", todo: "Schreib die Phrase so: \"back exercise*\"[tiab]." },
      "mixed-operators": { meaning: "AND und OR stehen ohne Klammern auf derselben Ebene. PubMed wertet von links nach rechts aus: «A OR B AND C» wird zu «(A OR B) AND C».", todo: "Setz jede OR-Gruppe (eine Suchkomponente) in eine Klammer und verbinde die Klammern mit AND." },
      "generic-term": { meaning: "Ein sehr allgemeines Wort trifft fast jede Studie und macht die Komponente breit und unscharf.", todo: "Ersetze es durch eine genauere Phrase oder entferne es." },
      "operator-lowercase": { meaning: "PubMed erkennt AND, OR und NOT nur in Grossbuchstaben.", todo: "Schreib den Operator gross." },
      "op-missing": { meaning: "Zwischen zwei Begriffen fehlt ein Operator.", todo: "Setz OR (gleiche Komponente) oder AND (andere Komponente) dazwischen." },
      "op-trailing": { meaning: "Am Ende steht ein Operator ohne Begriff dahinter.", todo: "Lösche den Operator oder ergänze den Begriff." },
      "op-leading": { meaning: "Am Anfang steht ein Operator ohne Begriff davor.", todo: "Lösche den Operator." },
      "op-double": { meaning: "Zwei Operatoren stehen direkt hintereinander.", todo: "Lösche einen von beiden." },
      "paren-unclosed": { meaning: "Eine Klammer wird geöffnet, aber nie geschlossen.", todo: "Setz die schliessende Klammer ans Ende der Gruppe." },
      "paren-unmatched-close": { meaning: "Eine Klammer wird geschlossen, die nie geöffnet wurde.", todo: "Lösche sie oder setz die öffnende Klammer an den Anfang der Gruppe." },
      "quote-unclosed": { meaning: "Ein Anführungszeichen wird geöffnet und nie geschlossen. Der Rest des Strings wird dadurch falsch gelesen.", todo: "Schliesse die Phrase mit einem Anführungszeichen." },
      "phrase-empty": { meaning: "Zwischen den Anführungszeichen steht nichts.", todo: "Lösche das Paar oder schreib die Phrase hinein." },
      "tag-unclosed": { meaning: "Ein Field Tag wird mit [ geöffnet, aber nicht mit ] geschlossen.", todo: "Schliesse den Tag mit ]." },
      "tag-orphan": { meaning: "Ein Field Tag steht ohne Begriff davor.", todo: "Lösche den Tag oder setze den Begriff davor." },
      "tag-unknown": { meaning: "PubMed kennt dieses Field Tag nicht.", todo: "Prüfe die Schreibweise: [tiab] für Titel und Abstract, [Mesh] für Schlagworte." },
      "trunc-mesh": { meaning: "Ein Schlagwort lässt sich nicht trunkieren. [Mesh] sucht den genauen Begriff.", todo: "Nimm den Stern weg, oder suche das Wort als Stichwort mit [tiab]." },
      "trunc-short": { meaning: "Vor dem Stern fehlen Buchstaben. PubMed braucht mindestens vier.", todo: "Schreib mindestens vier Buchstaben vor den Stern oder lass ihn weg." },
      "trunc-short-stem": { meaning: "Vor dem Stern stehen weniger als vier Buchstaben. PubMed ignoriert die Trunkierung dann oder meldet einen Fehler.", todo: "Verlängere den Wortanfang auf mindestens vier Buchstaben." },
      "mesh-unquoted": { meaning: "Ein Schlagwort aus mehreren Wörtern steht ohne Anführungszeichen. PubMed zerlegt es.", todo: "Setz es in Anführungszeichen: \"Low Back Pain\"[Mesh]." },
      "group-empty": { meaning: "Eine Klammer ist leer.", todo: "Lösche sie oder schreib Begriffe hinein." },
    } as Record<string, { meaning: string; todo: string }>,
    explainFallback: { meaning: "Das Tool hat hier etwas gefunden, das PubMed vermutlich anders versteht, als du es meinst.", todo: "Lies die Meldung und ändere die markierte Stelle." },
    checklist: [
      { id: "no-errors", label: "Keine Fehler (rote Befunde)", codes: ["*error"] },
      { id: "quotes", label: "Gerade Anführungszeichen, jede Phrase geschlossen", codes: ["quotes-typographic", "stray-after-quote", "stray-char", "quote-unclosed", "phrase-empty"] },
      { id: "parens", label: "Klammern stimmen, jede OR-Gruppe steht in einer Klammer", codes: ["paren-unclosed", "paren-unmatched-close", "mixed-operators", "group-empty"] },
      { id: "operators", label: "AND und OR gross und zwischen jedem Begriff", codes: ["operator-lowercase", "op-missing", "op-trailing", "op-leading", "op-double"] },
      { id: "tags", label: "Jeder Begriff hat sein Field Tag", codes: ["no-field-tag", "tag-unclosed", "tag-orphan", "tag-unknown", "mesh-unquoted"] },
      { id: "trunc", label: "Trunkierung nur mit mindestens vier Buchstaben, nicht bei Schlagworten", codes: ["trunc-in-phrase", "trunc-mesh", "trunc-short", "trunc-short-stem"] },
      { id: "generic", label: "Keine zu allgemeinen Wörter allein", codes: ["generic-term"] },
    ] as Array<{ id: string; label: string; codes: string[] }>,
    checklistManual: [
      "Die Begriffe passen zu deiner Frage (das kann das Tool nicht beurteilen).",
      "Die Schlagworte hast du im MeSH-Wörterbuch geprüft.",
      "Du hast die Trefferzahl angeschaut und ein paar Titel gelesen.",
    ],
  },
} as const

export type GuideCopy = typeof guideCopy
