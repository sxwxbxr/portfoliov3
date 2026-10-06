"use client"

import { handleDeclaration, type HandlerResult, type Locale, type Receipt } from "@sweberdev/inverse"
import { createInverseLink, type MountedFlow, mountWithdrawalForm } from "@sweberdev/inverse/ui"
import { useEffect, useId, useRef, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { inverseDemoCopy } from "@/lib/demo/inverse-copy"
import "./inverse-demo.css"

/*
 * The framework-free build: mountWithdrawalForm() from @sweberdev/inverse/ui
 * renders into a plain <div>, the way the script tag does on WordPress or a
 * Shopify theme. React only hosts the page here; the form itself is no React.
 */

const t = inverseDemoCopy.plain

const COMPANY = {
  name: "Atelier Holzwerk",
  address: "Seestrasse 12, 6020 Innsbruck",
  email: "hallo@holzwerk.example",
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "nl", label: "Nederlands" },
  { value: "es", label: "Español" },
  { value: "pl", label: "Polski" },
]

const SNIPPET = `<!-- e.g. a WordPress "Custom HTML" block -->
<div data-inverse-form="withdrawal"
     data-endpoint="https://example.com/api/inverse"
     data-show-items></div>

<!-- footer -->
<a data-inverse-link="withdrawal" href="/widerruf"></a>

<script src="https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js" defer></script>`

export function PlainHtmlDemo() {
  const langId = useId()
  const formRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLParagraphElement>(null)
  const [locale, setLocale] = useState<Locale>("nl")
  const [run, setRun] = useState(0)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    const host = formRef.current
    const linkHost = linkRef.current
    if (!host || !linkHost) return
    const submit = (body: Record<string, unknown>): Promise<HandlerResult> =>
      handleDeclaration(body, {
        company: COMPANY,
        timeZone: "Europe/Vienna",
        onDeclaration: () => {},
        sendReceipt: (r) => setReceipt(r),
      })
    const mounted: MountedFlow = mountWithdrawalForm(host, {
      endpoint: "/api/inverse",
      locale,
      submit,
      showItems: true,
      defaultValues: { contractRef: "HW-4410" },
    })
    const link = createInverseLink({ kind: "withdrawal", href: "#plain", locale })
    link.addEventListener("click", (e) => e.preventDefault())
    linkHost.replaceChildren(link)
    return () => {
      mounted.destroy()
      linkHost.replaceChildren()
    }
  }, [locale, run])

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
            onChange={(e) => {
              setReceipt(null)
              setLocale(e.target.value as Locale)
            }}
            className="well h-11 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setReceipt(null)
            setRun((n) => n + 1)
          }}
          className={small}
        >
          {t.reset}
        </button>
      </div>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="inv-shop" lang={locale}>
          <div className="inv-shop-bar">
            <strong>Atelier Holzwerk</strong>
            <nav aria-label="Atelier Holzwerk">
              <span>WordPress</span>
            </nav>
          </div>
          <div className="inv-shop-main">
            <div ref={formRef} />
          </div>
          <footer className="inv-shop-footer">
            <span>Impressum</span>
            <p ref={linkRef} className="m-0" />
          </footer>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <CodeBlock title={t.snippetTitle} code={SNIPPET} />
          <div className="flex flex-col gap-3">
            <p className="annotate">{t.inbox}</p>
            {receipt ? (
              <div className="overflow-hidden rounded-xl border border-edge-soft bg-white">
                <p className="border-b border-neutral-200 px-4 py-2 text-xs text-neutral-700">
                  <strong>{receipt.subject}</strong>
                  <br />
                  {COMPANY.email} → {receipt.to}
                </p>
                <iframe title={receipt.subject} srcDoc={receipt.html} sandbox="" className="h-80 w-full bg-white" />
              </div>
            ) : (
              <p className="well px-4 py-3 text-sm text-fg-muted">{t.inboxEmpty}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
