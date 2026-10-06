import { accountCopy } from "@/lib/physio/copy/account"

/** Client-side helpers for the account forms. The API answers with error codes, the wording lives in accountCopy.errors. */

export type ApiResult<T = Record<string, unknown>> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

export async function postJson<T = Record<string, unknown>>(url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body ?? {}),
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (res.ok) return { ok: true, data }
    return { ok: false, status: res.status, message: accountCopy.errors[data.error ?? ""] ?? accountCopy.errors.generic }
  } catch {
    return { ok: false, status: 0, message: accountCopy.errors.network }
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
