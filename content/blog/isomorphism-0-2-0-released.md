---
title: "Isomorphism 0.2.0 released"
excerpt: "Names, companies, addresses, dates of birth, card and account numbers, and a streaming restore for answers that arrive in pieces. Authorities stay untouched, Presidio is an optional backend, and the README reports hit rate and false alarms per kind."
date: 2026-11-02
author: Seya Weber
type: release
packages: [isomorphism]
tags: [Isomorphism, Python, Privacy, Anonymisation, Switzerland, release]
---

Isomorphism 0.2.0 is out, right after the first version. 0.1.0 covered the kinds with check digits. 0.2.0 adds the rest of what a Swiss text contains: people, companies and places. It is still `pip install isomorphism`, MIT-licensed, Python 3.12 or newer, no dependencies, fully local.

## What is in 0.2.0

- **Persons.** After a title (`Hr. Keller`, `Frau Dr. Müller`, `M. Jean Dupont`, `signora Bianchi`), as first name plus surname from a list of about 440 common first names, as `Muster, Anna`, the same surname again later in the text, and a first name on its own.
- **Companies** by legal form: AG, GmbH, SA, Sàrl, Sagl, KlG, KG, Ltd, Inc, LLC.
- **Addresses:** street with number and postcode with place, in German, French, Italian and English (`Musterstrasse 12, 9000 St. Gallen`, `Rue de Lausanne 12, 1003 Lausanne`, `Via Nassa 8, 6900 Lugano`).
- **Dates of birth,** only after context words such as `geb.`, `Geburtsdatum`, `né le`, `nata il`, `date of birth`. Invoice dates stay untouched.
- **Card numbers** with a Luhn check and **accounts:** PostFinance numbers with their mod-10 check and digits after `Konto`, `compte`, `conto` or `account`.
- **Streaming.** `Restorer` and `restore_stream` restore an answer that arrives in pieces, also when a placeholder such as `[AHV_1]` is split between two pieces.
- **Authorities** such as `Steueramt St. Gallen` or `Handelsregisteramt Zürich` are never replaced. `keep` now accepts compiled patterns as well as exact values.
- **Presidio as an optional backend** for names in running text: `anonymize(text, detectors=[presidio_detector(analyzer)])`. It is not a dependency and nothing is downloaded by Isomorphism.
- **Measurement.** The README has a table with expected, found, missed and false alarms for every kind, on invented Swiss texts in four languages. A test keeps it current.

## How sure is it

Names, companies and addresses come from patterns, titles and word lists. They are less certain than an AHV number with a valid check digit, and they can report too much: a four-digit number followed by a capitalised word after a comma can look like a postcode and a place. Every hit carries a confidence, so you can filter. In the invented test texts no listed value gets through; the two known false alarms are named in the README. That is a small regression set, not a benchmark on real documents, and no tool finds all personal data.

## Install and try

```bash
pip install --upgrade isomorphism
```

```python
from isomorphism import Restorer, anonymize

safe, mapping = anonymize("Hr. Keller, Musterstrasse 12, 9000 St. Gallen, AHV 756.1234.5678.97")
# '[PERSON_1], [ADDRESS_1], AHV [AHV_1]'

r = Restorer(mapping)
for piece in ["Die Nummer [AH", "V_1] von [PER", "SON_1] ist gültig."]:
    print(r.feed(piece), end="")
print(r.flush())
```

The [live demo](https://packages.sweber.dev/isomorphism/demo) runs the real package in your browser and shows the streaming step by step. The reference, the FastAPI guide and the Presidio guide are at [packages.sweber.dev/isomorphism/docs](https://packages.sweber.dev/isomorphism/docs).
