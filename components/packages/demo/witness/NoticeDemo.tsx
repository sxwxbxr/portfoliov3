"use client"

import { useId, useRef, useState } from "react"
import { witnessDemoCopy } from "@/lib/demo/witness-copy"
import { Element } from "./Element"
import { type NoticeElement, useDarkTheme, useWitness, witnessTheme } from "./runtime"

const t = witnessDemoCopy
const LOCALES = ["en", "de", "fr", "it"] as const

interface Logged {
  type: string
  locale: string
  at: string
}

/** A made-up support chat with <witness-notice> at the top. */
export function NoticeDemo() {
  const mod = useWitness()
  const dark = useDarkTheme()
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("en")
  const [events, setEvents] = useState<Logged[]>([])
  const [messages, setMessages] = useState<{ from: "bot" | "me"; text: string }[]>([
    { from: "bot", text: t.notice.greeting },
  ])
  const [draft, setDraft] = useState("")
  const notice = useRef<NoticeElement | null>(null)
  const ids = { locale: useId(), input: useId() }

  if (mod === false) return <p className="text-sm text-fg-muted">{t.failed}</p>

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [...m, { from: "me", text }, { from: "bot", text: t.notice.reply }])
    setDraft("")
  }

  const palette = witnessTheme(dark)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <div
          lang={locale}
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: palette["--witness-border"], background: palette["--witness-bg"], color: palette["--witness-fg"] }}
        >
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm font-semibold"
            style={{ borderColor: palette["--witness-border"] }}
          >
            {t.notice.app}
          </div>
          <div className="flex min-h-[320px] flex-col gap-3 p-4">
            {mod ? (
              <Element<NoticeElement>
                tag="witness-notice"
                attrs={{ kind: "chatbot", locale, "disclosure-id": "demo-support-chat", storage: "memory" }}
                vars={palette}
                elementRef={(el) => {
                  notice.current = el
                }}
                onEvent={(type, detail) => {
                  const d = detail as { locale?: string; at?: string }
                  setEvents((list) => [{ type, locale: d.locale ?? locale, at: d.at ?? new Date().toISOString() }, ...list].slice(0, 8))
                }}
              />
            ) : (
              <p className="text-sm opacity-70">{t.loading}</p>
            )}
            <ul className="flex flex-col gap-2" aria-live="polite">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${m.from === "me" ? "self-end" : "self-start"}`}
                  style={
                    m.from === "me"
                      ? { background: palette["--witness-accent"], color: palette["--witness-accent-text"] }
                      : { border: `1px solid ${palette["--witness-border"]}` }
                  }
                >
                  {m.text}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-3" style={{ borderColor: palette["--witness-border"] }}>
            <label htmlFor={ids.input} className="sr-only">
              {t.notice.placeholder}
            </label>
            <input
              id={ids.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.notice.placeholder}
              className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: palette["--witness-border"] }}
            />
            <button
              type="submit"
              className="rounded-md px-3 py-2 text-sm font-semibold"
              style={{ background: palette["--witness-accent"], color: palette["--witness-accent-text"] }}
            >
              {t.notice.send}
            </button>
          </form>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <label htmlFor={ids.locale} className="flex flex-col gap-1.5">
          <span className="annotate">{t.language}</span>
          <select
            id={ids.locale}
            className="control w-full px-3 py-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t.languages[l]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="control self-start px-4 py-2 text-sm"
          onClick={() => notice.current?.reset()}
          disabled={!mod}
        >
          {t.notice.reset}
        </button>
        <div className="flex flex-col gap-2">
          <p className="annotate">{t.notice.events}</p>
          <div className="well p-4 font-mono text-[13px] leading-relaxed text-fg" aria-live="polite">
            {events.length === 0 ? (
              <p className="text-fg-muted">{t.notice.noEvents}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {events.map((e, i) => (
                  <li key={i} className="break-all">
                    {JSON.stringify({ type: e.type.replace("witness-", ""), id: "demo-support-chat", locale: e.locale, at: e.at })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
