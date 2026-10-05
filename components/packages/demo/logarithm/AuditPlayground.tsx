"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { type AuditActor, type AuditEvent, createAuditLog, memoryStore } from "@/lib/demo/logarithm"
import { logarithmDemo } from "@/lib/demo/logarithm-copy"
import { AuditLog } from "./AuditLog"
import "./audit-log.css"

/*
 * Runs the vendored copy of @sweberdev/logarithm in the browser with an
 * in-memory store. The settings form is a stand-in for a customer's admin
 * area; every action calls audit.record() exactly as an app would.
 */

const t = logarithmDemo.app

const PEOPLE: (AuditActor & { label: string })[] = [
  { id: "u_anna", type: "user", name: "Anna Muster", email: "anna@acme.example", label: "Anna (Owner)" },
  { id: "u_ben", type: "user", name: "Ben Keller", email: "ben@acme.example", label: "Ben (Admin)" },
  { id: "key_deploy", type: "api_key", name: "Deploy bot", label: "Deploy bot (API key)" },
]

const PLANS = ["Free", "Team", "Business"]
const ROLES = ["viewer", "editor", "admin"]

interface Project {
  name: string
  plan: string
  visibility: "private" | "public"
  smtpPassword: string
}

interface Member {
  id: string
  email: string
  role: string
}

const INITIAL_PROJECT: Project = {
  name: "Website relaunch",
  plan: "Team",
  visibility: "private",
  smtpPassword: "hunter2",
}

const INITIAL_MEMBERS: Member[] = [
  { id: "m_ben", email: "ben@acme.example", role: "admin" },
  { id: "m_lea", email: "lea@acme.example", role: "editor" },
]

const CONTEXT = { ip: "203.0.113.24", userAgent: "Firefox 131 on macOS" }
const PROJECT_TARGET = { type: "project", id: "prj_7f3a" }

const NOUNS: Record<string, Record<string, string>> = {
  en: { api_key: "API key" },
  de: { project: "Projekt", member: "Mitglied", api_key: "API-Schlüssel", user: "Benutzer" },
}

const FIELD_LABELS: Record<string, Record<string, string>> = {
  en: { name: "Name", plan: "Plan", visibility: "Visibility", smtpPassword: "SMTP password", role: "Role" },
  de: { name: "Name", plan: "Abo", visibility: "Sichtbarkeit", smtpPassword: "SMTP-Passwort", role: "Rolle" },
}

const ACTIONS: Record<string, { value: string; label: string }[]> = {
  en: [
    { value: "project.*", label: "Project" },
    { value: "member.*", label: "Members" },
    { value: "api_key.*", label: "API keys" },
    { value: "user.*", label: "Sign-ins" },
  ],
  de: [
    { value: "project.*", label: "Projekt" },
    { value: "member.*", label: "Mitglieder" },
    { value: "api_key.*", label: "API-Schlüssel" },
    { value: "user.*", label: "Anmeldungen" },
  ],
}

/** Builds a fresh log with a short, plausible history. */
async function seededLog() {
  const store = memoryStore()
  const audit = createAuditLog({ store })
  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000)
  const anna = PEOPLE[0] as AuditActor
  const ben = PEOPLE[1] as AuditActor
  const acme = audit.with({ tenantId: "acme", context: CONTEXT })
  await acme.record({ action: "user.signed_in", actor: anna, occurredAt: ago(60 * 26) })
  await acme.record({
    action: "project.created",
    actor: anna,
    targets: [{ ...PROJECT_TARGET, name: "Website" }],
    occurredAt: ago(60 * 26 - 3),
  })
  await acme.record({
    action: "member.invited",
    actor: anna,
    targets: [{ type: "member", id: "m_ben", name: "ben@acme.example" }],
    after: { role: "admin" },
    occurredAt: ago(60 * 25),
  })
  await acme.record({ action: "user.signed_in", actor: ben, occurredAt: ago(42) })
  await acme.record({
    action: "project.updated",
    actor: ben,
    targets: [{ ...PROJECT_TARGET, name: "Website relaunch" }],
    before: { name: "Website", plan: "Free" },
    after: { name: "Website relaunch", plan: "Team" },
    occurredAt: ago(40),
  })
  return acme
}

export function AuditPlayground() {
  const ids = { actor: useId(), name: useId(), plan: useId(), smtp: useId(), invite: useId() }
  const [seed, setSeed] = useState(0)
  const { log } = useLogForSeed(seed)
  const [actorId, setActorId] = useState("u_anna")
  const [project, setProject] = useState(INITIAL_PROJECT)
  const [draft, setDraft] = useState(INITIAL_PROJECT)
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState("")
  const [keySuffix, setKeySuffix] = useState("9c1e")
  const [locale, setLocale] = useState<"en" | "de">("en")
  const [last, setLast] = useState<AuditEvent | null>(null)
  const [version, setVersion] = useState(0)
  const [note, setNote] = useState("")

  const actor = PEOPLE.find((p) => p.id === actorId) ?? (PEOPLE[0] as AuditActor)

  const record = useCallback(
    async (input: Parameters<NonNullable<typeof log>["record"]>[0]) => {
      if (!log) return
      const { label: _label, ...who } = actor as AuditActor & { label?: string }
      const event = await log.record({ actor: who, ...input })
      setLast(event)
      setVersion((v) => v + 1)
      setNote("")
    },
    [log, actor],
  )

  const save = async () => {
    const changed = JSON.stringify(project) !== JSON.stringify(draft)
    if (!changed) {
      setNote(t.saved)
      return
    }
    await record({
      action: "project.updated",
      targets: [{ ...PROJECT_TARGET, name: draft.name }],
      before: project,
      after: draft,
    })
    setProject(draft)
  }

  const changeRole = async (member: Member, role: string) => {
    await record({
      action: "member.role_changed",
      targets: [{ type: "member", id: member.id, name: member.email }],
      before: { role: member.role },
      after: { role },
    })
    setMembers((ms) => ms.map((m) => (m.id === member.id ? { ...m, role } : m)))
  }

  const removeMember = async (member: Member) => {
    await record({
      action: "member.removed",
      targets: [{ type: "member", id: member.id, name: member.email }],
      before: { role: member.role },
    })
    setMembers((ms) => ms.filter((m) => m.id !== member.id))
  }

  const invite = async () => {
    const email = inviteEmail.trim()
    if (!email.includes("@")) return
    const member = { id: `m_${Date.now().toString(36)}`, email, role: "viewer" }
    await record({
      action: "member.invited",
      targets: [{ type: "member", id: member.id, name: email }],
      after: { role: member.role },
    })
    setMembers((ms) => [...ms, member])
    setInviteEmail("")
  }

  const rotate = async () => {
    const next = Math.random().toString(16).slice(2, 6)
    await record({
      action: "api_key.rotated",
      targets: [{ type: "api_key", id: "key_live", name: `sk_live_…${next}` }],
      metadata: { previous: `…${keySuffix}`, token: `sk_live_${next}${next}` },
    })
    setKeySuffix(next)
  }

  const reset = () => {
    setProject(INITIAL_PROJECT)
    setDraft(INITIAL_PROJECT)
    setMembers(INITIAL_MEMBERS)
    setLast(null)
    setNote("")
    setSeed((s) => s + 1)
  }

  const input =
    "well h-11 w-full min-w-0 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
  const small = "control px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex min-w-0 flex-col gap-8 rounded-xl border border-edge-soft bg-plate p-5 md:p-6">
        <p className="annotate">{t.panel}</p>

        <div className="flex flex-col gap-2">
          <label htmlFor={ids.actor} className="annotate">
            {t.actingAs}
          </label>
          <select id={ids.actor} value={actorId} onChange={(e) => setActorId(e.target.value)} className={input}>
            {PEOPLE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-base font-medium text-fg">{t.project}</legend>
          <div className="flex flex-col gap-2">
            <label htmlFor={ids.name} className="annotate">
              {t.name}
            </label>
            <input
              id={ids.name}
              className={input}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={ids.plan} className="annotate">
              {t.plan}
            </label>
            <select
              id={ids.plan}
              className={input}
              value={draft.plan}
              onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
            >
              {PLANS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="annotate mb-2">{t.visibility}</legend>
            <div className="flex gap-5 text-sm text-fg">
              {(["private", "public"] as const).map((v) => (
                <label key={v} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    value={v}
                    checked={draft.visibility === v}
                    onChange={() => setDraft({ ...draft, visibility: v })}
                  />
                  {t[v]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2">
            <label htmlFor={ids.smtp} className="annotate">
              {t.smtpPassword}
            </label>
            <input
              id={ids.smtp}
              type="password"
              autoComplete="off"
              className={input}
              value={draft.smtpPassword}
              onChange={(e) => setDraft({ ...draft, smtpPassword: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} className={small + " control-primary"} disabled={!log}>
              {t.save}
            </button>
            <p className="text-sm text-fg-muted" aria-live="polite">
              {note}
            </p>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-base font-medium text-fg">{t.members}</legend>
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm text-fg">{m.email}</span>
                <select
                  aria-label={t.role(m.email)}
                  value={m.role}
                  onChange={(e) => changeRole(m, e.target.value)}
                  className="well h-9 px-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button type="button" aria-label={t.remove(m.email)} onClick={() => removeMember(m)} className={small}>
                  {t.removeLabel}
                </button>
              </li>
            ))}
          </ul>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void invite()
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label htmlFor={ids.invite} className="annotate">
                {t.invite}
              </label>
              <input
                id={ids.invite}
                type="email"
                className={input}
                placeholder={t.invitePlaceholder}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <button type="submit" className={small}>
              {t.inviteButton}
            </button>
          </form>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-fg">
            {t.apiKey}: <code className="font-mono">sk_live_…{keySuffix}</code>
          </p>
          <button type="button" onClick={rotate} className={small}>
            {t.rotate}
          </button>
        </div>

        <button type="button" onClick={reset} className={small + " self-start"}>
          {t.reset}
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-medium text-fg">{t.activity}</h3>
          <div role="group" aria-label={t.language} className="flex gap-2">
            {(["en", "de"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
                className={small}
              >
                {l === "en" ? "English" : "Deutsch"}
              </button>
            ))}
          </div>
        </div>

        <div className="logarithm-demo min-w-0">
          {log && (
            <AuditLog
              key={`${seed}-${locale}`}
              fetchPage={(q) => log.query(q)}
              refreshKey={version}
              locale={locale === "de" ? "de-CH" : "en-GB"}
              nouns={NOUNS[locale]}
              actions={ACTIONS[locale]}
              fieldLabels={FIELD_LABELS[locale]}
              pageSize={8}
              theme="dark"
            />
          )}
        </div>

        {last && (
          <div className="flex min-w-0 flex-col gap-2">
            <CodeBlock title={t.lastEvent} code={JSON.stringify(last, null, 2)} />
            <p className="text-sm text-fg-muted">{t.lastEventHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/** One seeded log per "Start over"; created in the browser only. */
function useLogForSeed(seed: number) {
  const [log, setLog] = useState<{ seed: number; log: Awaited<ReturnType<typeof seededLog>> } | null>(null)
  useEffect(() => {
    let cancelled = false
    void seededLog().then((created) => {
      if (!cancelled) setLog({ seed, log: created })
    })
    return () => {
      cancelled = true
    }
  }, [seed])
  return { log: log?.seed === seed ? log.log : null }
}
