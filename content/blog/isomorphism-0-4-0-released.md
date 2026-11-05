---
title: "Isomorphism 0.4.0 released"
excerpt: "Names you already know are now always replaced. An office passes its clients once, and every spelling of them, in capitals, surname first or with ue for ü as on a bank statement, gets one placeholder. On the last blind test set this lifts names without a title from 51 % to 76 % and companies to 100 %, with no new false alarms."
date: 2026-11-05
author: Seya Weber
type: release
packages: [isomorphism]
tags: [Isomorphism, Python, Privacy, Anonymisation, Switzerland, release]
---

Isomorphism 0.4.0 is out. 0.3.0 measured the pattern recognisers on blind test sets and was honest about the result: a name without a title, whose first name is not on the list, was found only about half the time. 0.4.0 closes much of that gap with something an application usually has anyway: the names it already knows. It is still `pip install isomorphism`, MIT-licensed, Python 3.12 or newer, no dependencies, fully local, and the placeholders keep their format. The release also contains the 0.3.1 fix: a chart of accounts (`1000 Kasse`, `6570 Informatikaufwand`) is no longer taken for postcode and place.

## Known names

A fiduciary office knows its clients. Pass them to `known_detector`, and they are always replaced:

```python
from isomorphism import anonymize
from isomorphism.known import known_detector

clients = known_detector(["Krasniqi, Arben", "Ueli Rüegg", "Reinigung Blitzblank GmbH"])
safe, mapping = anonymize(
    "Gutschrift KRASNIQI ARBEN 300.00\n"
    "RUEEGG UELI zahlt die Rechnung von Reinigung Blitzblank. Arben Krasniqi ruft an.",
    detectors=[clients],
)
# 'Gutschrift [PERSON_1] 300.00\n[PERSON_2] zahlt die Rechnung von [ORG_1]. [PERSON_1] ruft an.'
```

- **Every spelling, one placeholder:** any case and order (`KRASNIQI ARBEN`, `Krasniqi, Arben`), particles (`da Silva Maria`), umlauts as bank statements write them (`RUEEGG`, `Ruegg`) and names without accents. The model sees one person, and `restore()` gives back the first spelling seen in the text.
- **Entries as offices export them:** `Nachname, Vorname`, titles and group words (`Familie Muster`, `Erben Muster`), companies with or without their legal form, in capitals too.
- **Single words** of a name (`Krasniqi`) are found when capitalised. Surnames that are also ordinary words or places (`Keller`, `Koch`, `Zug`) are not replaced alone, so `im Keller` stays.
- **Fast with long lists:** up to 5,000 names; a text of 20,000 characters takes about a tenth of a second. Build the detector once and keep it while the names do not change. The package keeps nothing between calls.

## Measured

The README now has a second table: the same blind sets, once with the patterns alone and once with every full name of a text passed as a client. On set C, written blind by a fresh reviewer, names without a title go from 51 % to 76 % and companies from 54 % to 100 %. A third run passes 500 invented names that appear in no text: neither the clients nor the strangers add a single false alarm.

Known names only help with the names you know. A stranger without a title is still found only by the patterns, so treat Isomorphism as one protective layer.

## For recogniser authors

A recogniser can now give a hit a `key`, the spelling it stands for. Hits of one kind with the same key share a placeholder although their text differs. `known_detector` uses it; your own detectors can too.

## Install and try

```bash
pip install --upgrade isomorphism
```

The [live demo](https://packages.sweber.dev/isomorphism/demo) runs the real 0.4.0 package in your browser. The guide to known names and the reference are at [packages.sweber.dev/isomorphism/docs](https://packages.sweber.dev/isomorphism/docs), both acceptance tables are in the [README](https://github.com/Weber-Development/isomorphism#acceptance).
