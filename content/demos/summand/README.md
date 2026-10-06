# Summand demo files

Generated with the real Summand Pro packages (summand-view, summand-inbox 0.1.0; `watch-en.txt` and `datev-en.txt` with summand-inbox 0.2.0) from the sample
invoices in `public/demos/summand/samples`:

- `xrechnung-ubl.xml`, `xrechnung-cii.xml`: KoSIT XRechnung test suite, business case 01.21a
  (Apache License 2.0, https://github.com/itplr-kosit/xrechnung-testsuite).
- `broken.xml`: the same UBL invoice with a wrong amount due and a mistyped Leitweg-ID.
- `zugferd-en16931.pdf`: Mustangproject sample `EN16931_Einfach.pdf` (Apache License 2.0,
  https://github.com/ZUGFeRD/mustangproject).
- The batch run also used a plain PDF without embedded XML and test case 01.04a.

`view-*.html`: `viewInvoice(bytes, { lang })`. `inbox-*`: `summand-inbox incoming --html … --audit-log …`.
`watch-en.txt`: `summand-inbox watch incoming --move --audit-log audit.jsonl`. `datev-en.txt`: `--datev` export (SKR03), converted to UTF-8 and cut to the first 14 columns for display.
