---
title: "Isomorphism 0.3.0 released"
excerpt: "Names, companies and addresses are now measured on test texts written blind. Every name with a title, every company with a legal form and every full address is protected; names, companies and addresses without those clues are found only about half the time, and the README says so."
date: 2026-11-04
author: Seya Weber
type: release
packages: [isomorphism]
tags: [Isomorphism, Python, Privacy, Anonymisation, Switzerland, release]
---

Isomorphism 0.3.0 is out. 0.2.0 added names, companies and addresses with patterns and word lists. 0.3.0 asks how well that actually works, on text the recognisers have never seen, and improves them until the part that must never leak no longer does. It is still `pip install isomorphism`, MIT-licensed, Python 3.12 or newer, no dependencies, fully local, and the placeholders keep their format (`[PERSON_1]`, `[ORG_1]`, `[ADDRESS_1]`).

## Measured on blind test sets

Before any recogniser was changed, an acceptance was agreed and written into `tests/acceptance.py`:

- **Protected** means every letter and digit of a value lies inside a placeholder. A partial hit that leaves a surname visible counts as missed.
- **Tier 1, never missed:** a name with a salutation or title, a company with its legal form, street and number with postcode and place.
- **Tier 2, everything else:** at least 80 % of names, 80 % of companies and 90 % of addresses.
- **Precision:** at least 80 % of the hits of each kind are real. **Authorities** such as `Steueramt Zürich` are never replaced.

The test texts are written by a reviewer who has not read the code, the word lists or the earlier sets, the way a fiduciary office writes: emails, payslips, bank bookings in capitals, chats in lower case, notes and signatures. Everything is invented. Set A drove the first round of changes, set B (written blind) showed what did not generalise, and set C, written blind by a fresh reviewer, decided.

## The honest result

0.3.0 does not pass the whole acceptance. On all three sets every tier-1 value is protected, where 0.2.0 protected between 27 % and 50 % of the names with a title. Tier 2 stays below the minimum on set C for all three kinds: 51 % of the names, 54 % of the companies and 63 % of the addresses (0.2.0: 4 %, 0 % and 47 %). What still gets through is a name without any clue whose first name is not on the list, a surname alone, a company without legal form or known trade word, and foreign address formats. The README lists every class and keeps the table current with a test.

So: use 0.3.0 as one protective layer, not as the only protection for real documents.

## What is in 0.3.0

- **Persons:** any first name after a title (`Frau Dr. Patrizia Caflisch`), more titles (`Me`, `Familie`, `Notar`, `avv.`, `Dr. med. dent.`), initials (`J.-P. Chappuis`), particles (`van der Meer`, `Dos Santos`), names after context words (`Mieter:`, `Gutschrift`, `my wife`, `Lieber`, `CC:`) and under a closing formula, surname first, double first names, and every name word found again later in the text. More first names of many origins and Swiss short forms.
- **Companies:** `& Cie` and legal forms in capitals, `Verein …` and `…genossenschaft …`, a trade with its name (`Bäckerei Lüthi`, `Notariat Zumstein & Partner`).
- **Addresses:** any street words when postcode and place follow (`Im Grund 11, 8952 Schlieren`), elided articles (`Rue d'Italie 5`, `Via dell'Ospedale 3`), `Postfach`, a canton after the place, house number ranges, `|`, `/`, `;` or a tab as separator, two-line addresses.
- **Capitals and lowercase chats** are read as if written normally, without changing positions.
- **Authorities:** `Gemeinde X`, `Kanton X`, `Commune de X` stay, and their words are never reused as a name elsewhere.
- **Speed:** 200,000 characters take up to about 2 seconds, also for adversarial input.

## Install and try

```bash
pip install --upgrade isomorphism
```

```python
from isomorphism import anonymize

safe, mapping = anonymize(
    "Frau Dr. Patrizia Caflisch, Reinigung Blitzblank GmbH, Im Grund 11, 8952 Schlieren. "
    "Kopie an das Steueramt Zürich."
)
# '[PERSON_1], [ORG_1], [ADDRESS_1]. Kopie an das Steueramt Zürich.'
```

The [live demo](https://packages.sweber.dev/isomorphism/demo) runs the real 0.3.0 package in your browser. The reference and the guides are at [packages.sweber.dev/isomorphism/docs](https://packages.sweber.dev/isomorphism/docs), the full acceptance table is in the [README](https://github.com/Weber-Development/isomorphism#acceptance).
