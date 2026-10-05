"use client"

import {
  contractEndDate,
  type DeclarationRecord,
  type HandlerResult,
  handleDeclaration,
  type Locale,
  type Receipt,
  toIsoDate,
} from "@sweberdev/inverse"
import { CancellationForm, InverseLink, WithdrawalForm } from "@sweberdev/inverse-react"
import { useId, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { inverseDemoCopy } from "@/lib/demo/inverse-copy"
import "./inverse-demo.css"

/*
 * The made-up shop runs the real packages: the React forms post to a `submit`
 * function that calls handleDeclaration() in the browser, which is exactly what
 * createInverseHandler() does on a server. The receipt is shown, not sent.
 */

const t = inverseDemoCopy.shop

const COMPANY = {
  name: "Muster Outdoor GmbH",
  address: "Bergweg 4, 80331 München",
  email: "service@muster-outdoor.example",
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
]

const SHOP_TEXT: Record<Locale, { nav: string[]; hero: string; products: string[]; sub: string }> = {
  de: {
    nav: ["Ausrüstung", "Abo", "Konto"],
    hero: "Bereit für den Herbst",
    products: ["Regenjacke Alpin", "Wanderschuh Grat", "Gear-Box Abo"],
    sub: "Ihre Bestellung A-1001 wurde am Freitag geliefert.",
  },
  en: {
    nav: ["Gear", "Subscription", "Account"],
    hero: "Ready for autumn",
    products: ["Alpine rain jacket", "Ridge hiking boot", "Gear box subscription"],
    sub: "Your order A-1001 was delivered on Friday.",
  },
  fr: {
    nav: ["Équipement", "Abonnement", "Compte"],
    hero: "Prêt pour l'automne",
    products: ["Veste de pluie Alpin", "Chaussure Crête", "Abonnement Gear-Box"],
    sub: "Votre commande A-1001 a été livrée vendredi.",
  },
  it: {
    nav: ["Attrezzatura", "Abbonamento", "Account"],
    hero: "Pronti per l'autunno",
    products: ["Giacca Alpin", "Scarpone Cresta", "Abbonamento Gear-Box"],
    sub: "Il suo ordine A-1001 è stato consegnato venerdì.",
  },
}

type View = "shop" | "withdrawal" | "cancellation"

export function ShopDemo() {
  const langId = useId()
  const [locale, setLocale] = useState<Locale>("de")
  const [view, setView] = useState<View>("shop")
  const [run, setRun] = useState(0)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [record, setRecord] = useState<DeclarationRecord | null>(null)
  const s = SHOP_TEXT[locale]

  const submit = (body: Record<string, unknown>): Promise<HandlerResult> =>
    handleDeclaration(body, {
      company: COMPANY,
      timeZone: "Europe/Berlin",
      onDeclaration: (r) => setRecord(r),
      sendReceipt: (r) => setReceipt(r),
      resolveEndDate: (r) =>
        contractEndDate({
          received: toIsoDate(new Date(r.receivedAt)),
          notice: { months: 1 },
          termEnd: `${new Date().getFullYear()}-12-31`,
          requested: r.data.effectiveDate,
        }),
    })

  const open = (next: View) => (e: React.MouseEvent) => {
    e.preventDefault()
    setView(next)
  }

  const reset = () => {
    setReceipt(null)
    setRecord(null)
    setView("shop")
    setRun((n) => n + 1)
  }

  const small =
    "control px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={langId} className="annotate">
            {t.language}
          </label>
          <select
            id={langId}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="well h-11 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={reset} className={small}>
          {t.reset}
        </button>
      </div>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="inv-shop" lang={locale}>
          <div className="inv-shop-bar">
            <strong>Muster Outdoor</strong>
            <nav aria-label="Muster Outdoor">
              {s.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </nav>
          </div>

          <div className="inv-shop-main">
            {view === "shop" ? (
              <>
                <p className="inv-shop-hero">{s.hero}</p>
                <p className="inv-shop-sub">{s.sub}</p>
                <ul className="inv-shop-grid">
                  {s.products.map((p) => (
                    <li key={p}>
                      <span aria-hidden="true" className="inv-shop-img" />
                      {p}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <button type="button" className="inv-shop-back" onClick={() => setView("shop")}>
                  ← {t.backToShop}
                </button>
                {view === "withdrawal" ? (
                  <WithdrawalForm
                    key={`w-${locale}-${run}`}
                    endpoint="/api/inverse"
                    locale={locale}
                    submit={submit}
                    showItems
                    defaultValues={{ contractRef: "A-1001" }}
                  />
                ) : (
                  <CancellationForm
                    key={`c-${locale}-${run}`}
                    endpoint="/api/inverse"
                    locale={locale}
                    submit={submit}
                    defaultValues={{ contractRef: "ABO-2207" }}
                    contracts={[
                      { value: "ABO-2207", label: "Coffee subscription, ABO-2207" },
                      { value: "ABO-3120", label: "Tea box, ABO-3120" },
                    ]}
                  />
                )}
              </>
            )}
          </div>

          <footer className="inv-shop-footer">
            <span>Impressum</span>
            <span>Datenschutz</span>
            <InverseLink kind="withdrawal" href="#widerruf" locale={locale} onClick={open("withdrawal")} />
            <InverseLink kind="cancellation" href="#kuendigen" locale={locale} onClick={open("cancellation")} />
          </footer>
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="annotate">{t.inbox}</p>
            {receipt ? (
              <div className="overflow-hidden rounded-xl border border-edge-soft bg-white">
                <p className="border-b border-neutral-200 px-4 py-2 text-xs text-neutral-700">
                  <strong>{receipt.subject}</strong>
                  <br />
                  {COMPANY.email} → {receipt.to}
                </p>
                <iframe
                  title={receipt.subject}
                  srcDoc={receipt.html}
                  sandbox=""
                  className="h-96 w-full bg-white"
                />
              </div>
            ) : (
              <p className="well px-4 py-3 text-sm text-fg-muted">{t.inboxEmpty}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <p className="annotate">{t.server}</p>
            {record ? (
              <CodeBlock title="onDeclaration(record)" code={JSON.stringify(record, null, 2)} />
            ) : (
              <p className="well px-4 py-3 text-sm text-fg-muted">{t.serverEmpty}</p>
            )}
            <p className="text-sm text-fg-muted">{t.endsNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
