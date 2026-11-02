// Copy of the Isomorphism live demo (/isomorphism/demo). Kept next to the demo
// instead of lib/copy.ts so package pages stay independent of each other.
export const isomorphismDemo = {
  seoTitle: "Isomorphism live demo: anonymise Swiss personal data with Python, in your browser",
  description:
    "Paste a text with AHV numbers, IBANs, UID numbers, phone numbers and email addresses and see what Isomorphism replaces, which checks it ran, and how the answer is restored. The real Python package runs in this page.",
  title: "Isomorphism",
  titleSub: "Live demo.",
  intro:
    "Pick a text or write your own. The real Python package runs in your browser (through Pyodide) and replaces Swiss personal data with placeholders, lists what it found for an audit log, and puts the values back into an answer.",
  isolation:
    "Everything runs in this page. Nothing you enter is sent anywhere. Starting the demo downloads the Python runtime (about 10 MB) from jsDelivr once.",
  overview: "Isomorphism overview",
  docs: "Read the docs",
  start: {
    label: "Runtime",
    title: "Start the demo",
    sub: "Python 3.12 in your browser.",
    lede:
      "The package is pure Python without dependencies, so it runs unchanged in Pyodide, a Python build for WebAssembly. The page loads the runtime from jsDelivr and installs the published wheel from this site.",
    button: "Start the demo (about 10 MB)",
    loading: "Loading Python and the package …",
    failed: "The Python runtime could not be loaded. Check your connection or try again.",
    version: (v: string) => `isomorphism ${v} is running in this page.`,
  },
  anonymize: {
    label: "Anonymise",
    title: "Text in, placeholders out",
    sub: "Same value, same placeholder.",
    lede:
      "Every AHV number, IBAN, UID number, phone number and email address becomes a placeholder such as [AHV_1]. A value that appears twice gets the same placeholder, so a model can follow who is meant. Names and postal addresses are not recognised yet and stay in the text.",
    samples: "Examples",
    input: "Text",
    keep: "Keep these values (one per line)",
    keepHint: "Exact values, upper or lower case, that must stay in the text, for example an authority's address.",
    output: "Text for the model",
    findings: "Audit log",
    findingsHint: "What the package reports per hit. It contains no values, so it is safe to log.",
    columns: { kind: "Kind", position: "Position", confidence: "Confidence", detector: "Recogniser", checksum: "Check digit" },
    checks: { true: "valid", false: "wrong", none: "none" },
    none: "Nothing found.",
    mapping: "Mapping",
    mappingHint: "The real values behind the placeholders. The package never logs or stores them; keeping the mapping is up to you.",
    sampleList: [
      {
        id: "payslip",
        label: "Payslip extract",
        text:
          "Lohnausweis 2025 (Auszug)\nArbeitnehmerin: Anna Muster, Musterstrasse 12, 9000 St. Gallen\nAHV-Nr.: 756.5260.1815.91\nArbeitgeberin: Beispiel Treuhand AG, CHE-937.865.795 MWST\nAuszahlung auf CH10 7971 1471 0497 4650 7.\nRückfragen: Lohnbuchhaltung, 071 123 45 67, lohn@beispiel-treuhand.example",
      },
      {
        id: "mail",
        label: "Client email",
        text:
          "Grüezi Frau Keller\n\nMeine Mobilnummer ist +41 79 123 45 67, erreichbar bin ich auch unter 079 123 45 67.\nDie Rückzahlung bitte auf CH21 5291 7034 2366 7127 6 überweisen.\nMeine AHV-Nummer: 756.0830.1661.38 (die Nummer meines Mannes: 756.1860.9139.07).\nFreundliche Grüsse\nHans Muster, hans.muster@mail.example",
      },
      {
        id: "typo",
        label: "Typo in a number",
        text:
          "Bitte prüfen: AHV 756.1234.5678.98 und IBAN CH93 0076 2011 6238 5295 8.\nDie korrekten Werte sind 756.1234.5678.97 und CH93 0076 2011 6238 5295 7.",
      },
    ],
  },
  restore: {
    label: "Restore",
    title: "Answer in, real values back",
    sub: "In one pass.",
    lede:
      "The model works with placeholders and returns them in its answer. restore() puts the real values back. Models sometimes change the case or add spaces inside the brackets; those still match. Placeholders that are not in the mapping stay as they are.",
    input: "Answer from the model",
    output: "Restored answer",
    sample: "Die AHV-Nummer [AHV_1] ist gültig. Bitte überweisen Sie auf [IBAN_1] und melden Sie sich unter [PHONE_1] oder [ email_1 ]. [PERSON_1] steht nicht im Mapping.",
  },
  closing: {
    label: "Next",
    title: "Use it in your code",
    sub: "pip install isomorphism.",
    lede: "The demo calls the same functions you use in Python. The docs cover the API, the formats and the confidence values.",
    cta: "Read the docs",
  },
}

export const ISOMORPHISM_SNIPPET = `from isomorphism import anonymize, restore

text = "AHV 756.1234.5678.97, IBAN CH93 0076 2011 6238 5295 7, Tel. 071 123 45 67"
safe, mapping = anonymize(text, lang="de")
# 'AHV [AHV_1], IBAN [IBAN_1], Tel. [PHONE_1]'

answer = call_your_model(safe)
print(restore(answer, mapping))

for f in mapping.findings:  # audit log, no values
    print(f.kind, f.start, f.end, f.confidence, f.detector, f.checksum_ok)`
