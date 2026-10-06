/**
 * Copy for "Vorschläge" (physio.sweber.dev/vorschlaege), the suggestion form,
 * the API error messages and the owner mail. German, Swiss orthography
 * (always "ss"), informal "du". The admin screen is English like the rest of
 * /admin.
 */

export const SUGGESTION_LIMITS = {
  titleMin: 4,
  titleMax: 120,
  descriptionMin: 20,
  descriptionMax: 2000,
  emailMax: 254,
} as const

/** `value` is what the database stores, `label` what students and the admin see. */
export const SUGGESTION_CATEGORIES = [
  { value: "recherche", label: "Recherche" },
  { value: "lernen", label: "Lernen und Prüfung" },
  { value: "praxis", label: "Praxis und Befund" },
  { value: "organisation", label: "Organisation" },
  { value: "anderes", label: "Anderes" },
] as const

export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number]["value"]

export const SUGGESTION_CATEGORY_VALUES = SUGGESTION_CATEGORIES.map((c) => c.value) as [
  SuggestionCategory,
  ...SuggestionCategory[],
]

export function suggestionCategoryLabel(value: string): string {
  return SUGGESTION_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export const SUGGESTION_STATUSES = ["new", "planned", "in_progress", "done", "declined"] as const
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number]

export const suggestionsCopy = {
  meta: {
    title: "Vorschläge",
    description:
      "Welches Tool fehlt dir im Physiotherapie-Studium? Schick deine Idee ein. Was oft gewünscht wird, kommt zuerst dran.",
  },

  hero: {
    title: "Vorschläge",
    sub: "Welches Tool fehlt dir im Studium?",
    lede: "Es gibt eine Aufgabe, die dich im Studium jedes Mal Zeit kostet? Beschreib sie hier. Ich lese jeden Vorschlag, und was oft gewünscht wird, nehme ich zuerst dran. Dass jede Idee zu einem Tool wird, kann ich nicht versprechen.",
  },

  process: {
    heading: "Was mit deinem Vorschlag passiert",
    steps: [
      {
        title: "Ich lese jeden Vorschlag",
        text: "Kein Gremium, keine Abstimmung. Die Vorschläge landen direkt bei mir, Seya, und ich baue die Tools selbst.",
      },
      {
        title: "Ich prüfe, ob ein kleines Tool reicht",
        text: "Am besten eignen sich Aufgaben, die du oft wiederholst und die einen klaren Anfang und ein klares Ende haben. Was mehrere von euch vorschlagen, kommt zuerst dran.",
      },
      {
        title: "Du erfährst den Stand",
        text: "Wenn du eine E-Mail-Adresse angibst, melde ich mich bei dir, sobald dein Vorschlag geplant, in Arbeit oder erledigt ist. Ohne Adresse bleibt der Vorschlag anonym.",
      },
    ],
  },

  form: {
    heading: "Deine Idee",
    title: {
      label: "Titel",
      placeholder: "z. B. Literaturliste nach APA formatieren",
    },
    description: {
      label: "Beschreibung",
      hint: "Welches Problem im Studium soll das Tool lösen? Wie würdest du es nutzen?",
      placeholder:
        "Wann tritt das Problem auf, wie löst du es heute und was würde dir Zeit sparen?",
    },
    category: {
      label: "Bereich",
      placeholder: "Bereich wählen",
    },
    email: {
      label: "E-Mail (optional)",
      hint: "Nur, falls du eine Rückmeldung willst. Sonst bleibt der Vorschlag anonym.",
      placeholder: "name@beispiel.ch",
    },
    honeypotLabel: "Lass dieses Feld leer",
    counter: (n: number, max: number) => `${n} von ${max} Zeichen`,
    privacy: {
      lead: "Ich speichere deinen Vorschlag und, falls angegeben, deine E-Mail-Adresse nur, um dir zu antworten. Mehr dazu in der",
      link: "Datenschutzerklärung",
      tail: ".",
    },
    submit: "Vorschlag senden",
    submitting: "Sende …",
  },

  errors: {
    titleRequired: "Gib deiner Idee einen Titel.",
    titleShort: `Der Titel braucht mindestens ${SUGGESTION_LIMITS.titleMin} Zeichen.`,
    titleLong: `Der Titel darf höchstens ${SUGGESTION_LIMITS.titleMax} Zeichen haben.`,
    descriptionRequired: "Beschreib kurz, wofür du das Tool brauchst.",
    descriptionShort: `Die Beschreibung braucht mindestens ${SUGGESTION_LIMITS.descriptionMin} Zeichen, sonst kann ich das Problem nicht einordnen.`,
    descriptionLong: `Die Beschreibung darf höchstens ${SUGGESTION_LIMITS.descriptionMax} Zeichen haben. Kürze sie ein wenig.`,
    categoryRequired: "Wähle einen Bereich.",
    emailInvalid: "Diese E-Mail-Adresse sieht nicht vollständig aus. Prüfe sie oder lass das Feld leer.",
    rateLimited: "Du hast heute schon mehrere Vorschläge geschickt. Morgen geht es weiter.",
    invalid: "Der Vorschlag ist so nicht durchgekommen. Kontrolliere die markierten Felder und schick ihn nochmals.",
    generic: "Das Senden hat nicht geklappt. Deine Eingaben sind noch da, versuch es gleich nochmals.",
    network: "Keine Verbindung zum Server. Prüfe dein Netz und versuch es nochmals.",
  },

  success: {
    heading: "Danke, dein Vorschlag ist angekommen.",
    text: "Ich lese ihn in den nächsten Tagen. Hast du eine E-Mail-Adresse angegeben, hörst du von mir, sobald sich etwas tut.",
    again: "Weiteren Vorschlag senden",
    back: "Zurück zu den Tools",
  },

  mail: {
    subject: (title: string) => `Neuer Tool-Vorschlag: ${title}`,
  },
}

/** Admin screen (English, like the rest of /admin). */
export const suggestionsAdminCopy = {
  title: "Physio suggestions",
  statusLabels: {
    new: "New",
    planned: "Planned",
    in_progress: "In progress",
    done: "Done",
    declined: "Declined",
  } satisfies Record<SuggestionStatus, string>,
  filterAll: "All",
}
