"use client"

import { useEffect, useState } from "react"

/*
 * The demo loads the published build of @sweberdev/vector from /public, so this
 * site does not depend on the package. Same code as on npm, bundled into one
 * file. Vector has no dependencies and signs with Web Crypto, so the sender,
 * the verifier, the memory store and the SSRF guard all run in the browser.
 */

export const VECTOR_URL = "/demos/vector/vector-0.1.0.min.js"

export type DeliveryStatus = "pending" | "succeeded" | "failed" | "cancelled"

export type VerificationErrorCode =
  | "missing_headers"
  | "invalid_timestamp"
  | "timestamp_too_old"
  | "timestamp_too_new"
  | "no_matching_signature"
  | "invalid_payload"

export interface Endpoint {
  id: string
  tenant: string | null
  url: string
  description: string | null
  secret: string
  eventTypes: string[] | null
  enabled: boolean
  disabledReason: string | null
  failureStreak: number
}

export interface Message {
  id: string
  tenant: string | null
  eventType: string
  payload: unknown
  createdAt: Date
}

export interface Delivery {
  id: string
  messageId: string
  endpointId: string
  eventType: string
  status: DeliveryStatus
  attempts: number
  nextAttemptAt: Date | null
  lastAttemptAt: Date | null
  lastStatusCode: number | null
  lastError: string | null
}

export interface Attempt {
  id: string
  deliveryId: string
  at: Date
  durationMs: number
  statusCode: number | null
  success: boolean
  error: string | null
}

export interface ProcessResult {
  claimed: number
  succeeded: number
  retrying: number
  failed: number
  cancelled: number
}

export interface UrlPolicy {
  allowPrivateNetworks?: boolean
  allowHttp?: boolean
  resolveHost?: (hostname: string) => Promise<string[]>
}

export interface VectorOptions {
  store?: unknown
  retrySchedule?: readonly number[]
  timeoutMs?: number
  urlPolicy?: UrlPolicy
  disableEndpointAfter?: number
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  now?: () => Date
  onError?: (error: unknown) => void
}

export interface VectorInstance {
  endpoints: {
    create(input: { url: string; tenant?: string; description?: string; eventTypes?: string[] | null }): Promise<Endpoint>
    get(id: string): Promise<Endpoint | undefined>
    update(id: string, input: { enabled?: boolean }): Promise<Endpoint | undefined>
  }
  send(input: { tenant?: string; eventType: string; payload: unknown; idempotencyKey?: string }): Promise<{
    message: Message
    deliveries: Delivery[]
    duplicate: boolean
  }>
  sendTest(endpointId: string): Promise<Delivery | undefined>
  process(): Promise<ProcessResult>
  retry(deliveryId: string): Promise<Delivery | undefined>
  resend(messageId: string): Promise<Delivery[]>
  messages: { get(id: string): Promise<Message | undefined> }
  deliveries: { list(query: { messageId?: string; limit?: number }): Promise<Delivery[]> }
  attempts: { list(query: { deliveryId?: string; limit?: number }): Promise<Attempt[]> }
  on(event: "endpoint.disabled", listener: (event: { endpoint: Endpoint; reason: string }) => void): () => void
}

export interface WebhookVerificationError extends Error {
  code: VerificationErrorCode
}

export interface VectorModule {
  DEFAULT_RETRY_SCHEDULE: readonly number[]
  MemoryStore: new () => unknown
  createVector(options?: VectorOptions): VectorInstance
  generateSecret(byteLength?: number): string
  signHeaders(input: { id: string; timestamp: number; payload: string; secret: string }): Promise<{
    "webhook-id": string
    "webhook-timestamp": string
    "webhook-signature": string
  }>
  verify<T = unknown>(
    payload: string,
    headers: Record<string, string>,
    secret: string | string[],
    options?: { now?: Date; toleranceSeconds?: number },
  ): Promise<{ id: string; timestamp: Date; payload: T; raw: string }>
  WebhookVerificationError: new (...args: never[]) => WebhookVerificationError
  assertDeliverableUrl(url: string, policy?: UrlPolicy): Promise<URL>
  isPrivateAddress(ip: string): boolean
  UrlNotAllowedError: new (...args: never[]) => Error
}

let loading: Promise<VectorModule> | undefined

function load(): Promise<VectorModule> {
  loading ??= import(/* webpackIgnore: true */ VECTOR_URL) as Promise<VectorModule>
  return loading
}

/** The loaded module, `null` while loading, `false` when it failed. */
export function useVector(): VectorModule | null | false {
  const [mod, setMod] = useState<VectorModule | null | false>(null)
  useEffect(() => {
    let alive = true
    load().then(
      (m) => alive && setMod(m),
      () => {
        loading = undefined
        if (alive) setMod(false)
      },
    )
    return () => {
      alive = false
    }
  }, [])
  return mod
}

/** "12 s", "4 min 10 s", "2 h 5 min": durations in the delivery log. */
export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.round(total))
  if (s < 60) return `${s} s`
  if (s < 3600) {
    const m = Math.floor(s / 60)
    const rest = s % 60
    return rest ? `${m} min ${rest} s` : `${m} min`
  }
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return m ? `${h} h ${m} min` : `${h} h`
}
