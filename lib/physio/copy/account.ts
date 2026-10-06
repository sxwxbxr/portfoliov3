/**
 * Strings of the account area: sign-in, registration, password flows, /konto,
 * /abo and the transactional mails. German (Swiss orthography), informal "du".
 * A copywriter pass happens later; keep every user-visible string here.
 *
 * API routes answer with error codes (see `errors`), never with prose, so the
 * wording lives only in this file.
 */

const MIN = 10

export const accountCopy = {
  errors: {
    generic: "Das hat nicht geklappt. Versuch es gleich nochmals.",
    network: "Keine Verbindung zum Server. Prüfe dein Netz und versuch es nochmals.",
    invalid_input: "Etwas an den Eingaben passt nicht. Prüfe die markierten Felder und versuch es nochmals.",
    rate_limited: "Zu viele Versuche in kurzer Zeit. Warte ein paar Minuten und versuch es dann nochmals.",
    invalid_credentials: "E-Mail oder Passwort stimmt nicht. Prüfe beides oder setz das Passwort zurück.",
    unauthorized: "Du bist nicht mehr angemeldet. Melde dich an und versuch es nochmals.",
    email_not_verified: "Bestätige zuerst deine E-Mail-Adresse. Den Link dazu haben wir dir gemailt. Im Konto kannst du eine neue Mail anfordern.",
    wrong_password: "Das aktuelle Passwort stimmt nicht.",
    invalid_token: "Der Link ist abgelaufen oder wurde schon benutzt. Fordere einen neuen an.",
    subscription_active:
      "Dein Abo läuft noch. Kündige es zuerst im Kundenportal, danach kannst du das Konto löschen.",
    no_plan: "Diesen Tarif gibt es gerade nicht. Wähle den anderen oder versuch es später nochmals.",
    unavailable: "Der Dienst ist gerade nicht erreichbar. Versuch es in ein paar Minuten nochmals.",
  } as Record<string, string>,

  fields: {
    email: "E-Mail",
    password: "Passwort",
    newPassword: "Neues Passwort",
    currentPassword: "Aktuelles Passwort",
    passwordRepeat: "Passwort wiederholen",
    passwordHint: `Mindestens ${MIN} Zeichen.`,
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
    mismatch: "Die beiden Passwörter sind nicht gleich.",
    tooShort: `Das Passwort braucht mindestens ${MIN} Zeichen.`,
    emailInvalid: "Das sieht nicht nach einer E-Mail-Adresse aus. Prüfe die Schreibweise.",
    required: "Bitte ausfüllen.",
  },

  login: {
    metaTitle: "Anmelden",
    title: "Anmelden",
    lede: "Mit der E-Mail-Adresse und dem Passwort von deinem Konto.",
    submit: "Anmelden",
    submitting: "Melde an …",
    forgot: "Passwort vergessen?",
    noAccount: "Noch kein Konto?",
    toRegister: "Konto erstellen",
  },

  register: {
    metaTitle: "Konto erstellen",
    title: "Konto erstellen",
    lede: "Ein Konto brauchst du nur für das Abo. Die Demos kannst du auch ohne ausprobieren.",
    privacyBefore: "Ich habe die ",
    privacyLink: "Datenschutzerklärung",
    privacyAfter: " gelesen.",
    privacyRequired: "Bestätige die Datenschutzerklärung, dann können wir dein Konto erstellen.",
    submit: "Konto erstellen",
    submitting: "Erstelle Konto …",
    haveAccount: "Schon ein Konto?",
    toLogin: "Anmelden",
    done: {
      title: "Schau in dein Postfach",
      text: (email: string) =>
        `Wir haben dir eine Mail an ${email} geschickt. Klick auf den Link darin, dann ist deine Adresse bestätigt und du kannst dich anmelden. Der Link gilt 48 Stunden. Falls es mit dieser Adresse schon ein Konto gibt, steht in der Mail, wie du reinkommst.`,
      spam: "Nichts angekommen? Schau im Spam-Ordner nach.",
      toLogin: "Zur Anmeldung",
    },
  },

  forgot: {
    metaTitle: "Passwort vergessen",
    title: "Passwort vergessen",
    lede: "Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, über den du ein neues Passwort setzt.",
    submit: "Link anfordern",
    submitting: "Sende …",
    back: "Zurück zur Anmeldung",
    done: {
      title: "Mail unterwegs",
      text: "Falls es ein Konto mit dieser Adresse gibt, ist jetzt ein Link an dich unterwegs. Er gilt eine Stunde.",
    },
  },

  reset: {
    metaTitle: "Neues Passwort setzen",
    title: "Neues Passwort setzen",
    lede: "Wähle ein neues Passwort. Alle anderen Geräte melden wir danach ab.",
    submit: "Passwort speichern",
    submitting: "Speichere …",
    missingToken: {
      title: "Link unvollständig",
      text: "In der Adresse fehlt der Code aus der Mail. Öffne den Link aus der Mail nochmals, am besten per Klick statt abgetippt, oder fordere einen neuen an.",
      action: "Neuen Link anfordern",
    },
  },

  verify: {
    metaTitle: "E-Mail bestätigen",
    title: "E-Mail bestätigen",
    working: "Prüfe den Link …",
    okTitle: "E-Mail bestätigt",
    okText: "Deine Adresse ist bestätigt. Jetzt kannst du das Abo abschliessen.",
    okAction: "Zum Konto",
    missingToken: "In der Adresse fehlt der Code aus der Mail. Öffne den Link aus der Mail nochmals, am besten per Klick statt abgetippt.",
    failTitle: "Link ungültig",
    failText:
      "Der Link ist abgelaufen oder wurde schon benutzt. Melde dich an und fordere im Konto eine neue Bestätigungsmail an.",
    failAction: "Anmelden",
  },

  account: {
    metaTitle: "Konto",
    title: "Dein Konto",
    checkoutSuccess:
      "Danke für dein Abo. Bis die Zahlung bei uns ankommt, dauert es manchmal einen Moment. Steht unten noch kein aktives Abo, lade die Seite in einer Minute neu.",
    email: {
      heading: "E-Mail",
      verified: "Bestätigt",
      unverified: "Noch nicht bestätigt",
      unverifiedHint: "Bevor du ein Abo abschliessen kannst, musst du deine Adresse bestätigen.",
      resend: "Bestätigungsmail erneut senden",
      resending: "Sende …",
      resent: "Mail ist unterwegs. Schau auch im Spam-Ordner nach.",
    },
    subscription: {
      heading: "Abo",
      status: {
        none: "Kein Abo",
        incomplete: "Zahlung offen",
        incomplete_expired: "Zahlung abgelaufen",
        trialing: "Testphase",
        active: "Aktiv",
        past_due: "Zahlung fehlgeschlagen",
        canceled: "Beendet",
        unpaid: "Unbezahlt",
      } as Record<string, string>,
      statusUnknown: "Unbekannt",
      renews: (date: string) => `Verlängert sich am ${date}.`,
      endsOn: (date: string) => `Gekündigt, läuft noch bis ${date}. Bis dahin kannst du alle Tools nutzen.`,
      pastDue: "Die letzte Zahlung hat nicht geklappt. Prüfe im Kundenportal dein Zahlungsmittel, damit das Abo weiterläuft.",
      noneText: "Mit dem Abo nutzt du alle Tools mit eigenen Eingaben, nicht nur die Demos.",
      subscribe: "Abo abschliessen",
      manage: "Abo verwalten",
      managing: "Öffne Portal …",
      manageHint: "Im Kundenportal von Polar kündigst du, wechselst das Zahlungsmittel und lädst Rechnungen herunter.",
    },
    password: {
      heading: "Passwort ändern",
      submit: "Passwort ändern",
      submitting: "Speichere …",
      done: "Passwort geändert. Auf allen anderen Geräten bist du jetzt abgemeldet.",
    },
    session: {
      heading: "Abmelden",
      text: "Nur auf diesem Gerät. Andere Geräte bleiben angemeldet.",
      submit: "Abmelden",
      submitting: "Melde ab …",
    },
    delete: {
      heading: "Konto löschen",
      text: "Löscht dein Konto endgültig: E-Mail-Adresse, Passwort und die Verknüpfung zu deinen Vorschlägen. Die Vorschläge selbst bleiben anonym erhalten. Rechnungsdaten muss Polar als Händler von Gesetzes wegen länger aufbewahren.",
      activeSubscription:
        "Dein Abo läuft noch. Kündige es zuerst im Kundenportal, danach kannst du das Konto löschen.",
      confirmLabel: "Zur Bestätigung dein Passwort eingeben",
      open: "Konto löschen",
      submit: "Konto endgültig löschen",
      submitting: "Lösche …",
      cancel: "Abbrechen",
    },
  },

  plans: {
    metaTitle: "Abo",
    title: "Abo",
    lede: "Ein Abo, alle Tools. Du zahlst monatlich oder jährlich und kündigst, wann du willst.",
    includes: {
      heading: "Das bekommst du",
      items: [
        "Alle Tools mit eigenen Eingaben, auch die, die später dazukommen.",
        "Die Demos bleiben für alle offen, mit und ohne Konto.",
      ],
    },
    billing: {
      heading: "So läuft die Zahlung",
      items: [
        "Du zahlst über Polar.sh. Polar ist der Händler und stellt dir die Rechnung aus.",
        "Kündigen kannst du jederzeit im Kundenportal. Dein Zugang bleibt bis zum Ende der bezahlten Periode.",
        "Zahlungsmittel und Rechnungen verwaltest du ebenfalls im Portal.",
      ],
    },
    monthly: { title: "Monatlich", cta: "Monatlich abonnieren", note: "Monatlich kündbar." },
    yearly: { title: "Jährlich", cta: "Jährlich abonnieren", note: "Ein Jahr im Voraus bezahlt." },
    working: "Öffne Kasse …",
    soon: {
      title: "Das Abo startet bald",
      text: "Der Verkauf ist noch nicht freigeschaltet. Bis dahin kannst du die Demos ausprobieren und mir sagen, welches Tool dir fehlt.",
      demo: "Demo ausprobieren",
      suggest: "Tool vorschlagen",
    },
    needAccount: {
      text: "Für das Abo brauchst du ein Konto. Das dauert eine Minute: E-Mail, Passwort, Bestätigungslink.",
      register: "Konto erstellen",
      login: "Ich habe schon ein Konto",
    },
    needVerify: {
      text: "Bestätige zuerst deine E-Mail-Adresse, dann geht es weiter zur Kasse.",
      action: "Zum Konto",
    },
    already: {
      text: "Du hast schon ein aktives Abo.",
      action: "Abo verwalten",
    },
    toAccount: "Zum Konto",
  },

  mails: {
    footer: "Physio Tools by sweber.dev",
    verify: (link: string) => ({
      subject: "Bestätige deine E-Mail-Adresse",
      lines: [
        "Hallo,",
        "",
        "du hast bei Physio Tools ein Konto erstellt. Bestätige deine E-Mail-Adresse über diesen Link (gilt 48 Stunden):",
        link,
        "",
        "Falls du kein Konto erstellt hast, kannst du diese Mail ignorieren.",
      ],
    }),
    reset: (link: string) => ({
      subject: "Neues Passwort setzen",
      lines: [
        "Hallo,",
        "",
        "jemand hat für dein Konto bei Physio Tools ein neues Passwort angefordert. Falls du das warst, setz es über diesen Link (gilt eine Stunde):",
        link,
        "",
        "Falls du das nicht warst, kannst du diese Mail ignorieren. Dein Passwort bleibt dann, wie es ist.",
      ],
    }),
    existing: (loginLink: string, resetLink: string) => ({
      subject: "Du hast schon ein Konto",
      lines: [
        "Hallo,",
        "",
        "jemand hat mit dieser E-Mail-Adresse ein Konto bei Physio Tools erstellen wollen. Es gibt aber schon eines, deines.",
        "",
        "Anmelden:",
        loginLink,
        "",
        "Passwort vergessen?",
        resetLink,
        "",
        "Falls du das nicht warst, kannst du diese Mail ignorieren.",
      ],
    }),
  },
}
