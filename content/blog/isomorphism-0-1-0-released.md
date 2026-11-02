---
title: "Isomorphism 0.1.0 released"
excerpt: "Reversible anonymisation of Swiss personal data for Python. AHV numbers, IBANs, UID numbers, phone numbers and emails become placeholders before a model call and come back in the answer. Fully local, MIT-licensed."
date: 2026-11-02
author: Seya Weber
type: release
packages: [isomorphism]
tags: [Isomorphism, Python, Privacy, Anonymisation, Switzerland, release]
---

Isomorphism 0.1.0 is out. It is the first Python package in this series: `isomorphism` on PyPI, MIT-licensed, Python 3.12 or newer, no dependencies.

## Why it exists

A language model does not need a client's AHV number or IBAN to summarise a letter. Isomorphism replaces such values with placeholders like `[AHV_1]` before the text leaves your system, and `restore()` puts the real values back into the answer. The same value always gets the same placeholder, so the model can still follow who is meant.

Everything runs locally: no network calls, no telemetry, no model download. The mapping with the real values is never logged or stored by the package.

## What is in 0.1.0

- AHV numbers (prefix 756, EAN-13 check digit), IBANs of Switzerland and Liechtenstein (mod 97), UID numbers (mod 11), Swiss phone numbers in their usual spellings, and email addresses.
- Numbers with a wrong check digit are still found, with lower confidence. A typo in a document is still personal data.
- `anonymize(text, lang=None, keep=())`, `restore(text, mapping)` and `detect(text)`.
- An audit record per hit with kind, position, confidence, recogniser and check result, never the value.
- `keep=[…]` for values that must stay, such as an authority's address.
- Hit rate and false alarms per kind, measured on invented Swiss texts in German, French, Italian and English, in the README.

## Not in 0.1.0

Names, postal addresses, company names, dates of birth, account and card numbers, and restoring a streamed answer come in the next version. Until then names and addresses stay in the text. No tool finds all personal data, so treat Isomorphism as one protective layer.

## Install

```bash
pip install isomorphism
```

```python
from isomorphism import anonymize, restore

text = "AHV 756.1234.5678.97, IBAN CH93 0076 2011 6238 5295 7, Tel. 071 123 45 67"
safe, mapping = anonymize(text, lang="de")
# 'AHV [AHV_1], IBAN [IBAN_1], Tel. [PHONE_1]'

answer = call_your_model(safe)
print(restore(answer, mapping))
```

Try it in the [live demo](https://packages.sweber.dev/isomorphism/demo): the real package runs in your browser. The reference is at [packages.sweber.dev/isomorphism/docs](https://packages.sweber.dev/isomorphism/docs).
