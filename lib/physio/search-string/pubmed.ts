/**
 * Optional hit counts from PubMed (NCBI E-utilities, called straight from the
 * browser, CORS is open). Only the finished search string is sent, never the
 * question. Without an API key NCBI allows three requests per second; this
 * client keeps at least 400 ms between two requests. E-utilities drop single
 * requests now and then (5xx or a reset connection without CORS headers, which
 * the browser reports as a network error), so a failed request is retried
 * twice with a pause before the count reports an error. Counts are cached per
 * string for the page's lifetime.
 */

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
export const PUBMED_TOOL = "physio-sweber-dev"
export const MIN_SPACING_MS = 400
/** Pauses before the 2nd and 3rd attempt of a request that failed with "network" or "rate". */
export const RETRY_DELAYS_MS = [1500, 4000]

/** Link for "In PubMed öffnen". */
export function pubmedSearchUrl(query: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`
}

export type PubMedErrorCode = "rate" | "network" | "query" | "other"

export class PubMedError extends Error {
  constructor(
    public readonly code: PubMedErrorCode,
    message?: string,
  ) {
    super(message ?? code)
    this.name = "PubMedError"
  }
}

export interface PubMedCounterOptions {
  fetch?: typeof fetch
  spacingMs?: number
  retryDelaysMs?: number[]
  /** Injectable for tests. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  now?: () => number
}

function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"))
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t)
        reject(new DOMException("Aborted", "AbortError"))
      },
      { once: true },
    )
  })
}

export interface PubMedCounter {
  /** Hit count of one search string. Cached. Throws PubMedError, or an AbortError when the signal fires. */
  count(query: string, signal?: AbortSignal): Promise<number>
  cached(query: string): number | undefined
}

export function createPubMedCounter(options: PubMedCounterOptions = {}): PubMedCounter {
  const doFetch = options.fetch ?? ((...a: Parameters<typeof fetch>) => globalThis.fetch(...a))
  const spacing = options.spacingMs ?? MIN_SPACING_MS
  const retryDelays = options.retryDelaysMs ?? RETRY_DELAYS_MS
  const sleep = options.sleep ?? defaultSleep
  const now = options.now ?? (() => Date.now())
  const cache = new Map<string, number>()
  let lastStart = -Infinity
  /** Requests go through one chain so two callers never overlap the spacing. */
  let chain: Promise<unknown> = Promise.resolve()

  async function request(query: string, signal?: AbortSignal): Promise<number> {
    const wait = lastStart + spacing - now()
    if (wait > 0) await sleep(wait, signal)
    lastStart = now()
    const params = new URLSearchParams({ db: "pubmed", term: query, retmode: "json", rettype: "count", tool: PUBMED_TOOL })
    const url = `${EUTILS}?${params.toString()}`
    let res: Response
    try {
      // Long strings go in the body: browsers and proxies cut very long URLs.
      res = url.length > 4000
        ? await doFetch(EUTILS, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
            signal,
          })
        : await doFetch(url, { signal })
    } catch (e) {
      if (signal?.aborted || (e instanceof DOMException && e.name === "AbortError")) throw e
      throw new PubMedError("network")
    }
    if (res.status === 429) throw new PubMedError("rate")
    if (!res.ok) throw new PubMedError(res.status >= 500 ? "network" : "other", `HTTP ${res.status}`)
    let body: { esearchresult?: { count?: string; ERROR?: string; error?: string } }
    try {
      body = await res.json()
    } catch {
      throw new PubMedError("other")
    }
    const r = body.esearchresult
    if (!r) throw new PubMedError("other")
    if (r.ERROR || r.error) throw new PubMedError("query", r.ERROR ?? r.error)
    const n = Number.parseInt(r.count ?? "", 10)
    if (!Number.isFinite(n)) throw new PubMedError("other")
    return n
  }

  async function requestWithRetry(query: string, signal?: AbortSignal): Promise<number> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await request(query, signal)
      } catch (e) {
        const transient = e instanceof PubMedError && (e.code === "network" || e.code === "rate")
        if (!transient || attempt >= retryDelays.length) throw e
        await sleep(retryDelays[attempt], signal)
      }
    }
  }

  return {
    cached: (q) => cache.get(q),
    count(query, signal) {
      const hit = cache.get(query)
      if (hit !== undefined) return Promise.resolve(hit)
      const run = chain.then(async () => {
        const again = cache.get(query)
        if (again !== undefined) return again
        const n = await requestWithRetry(query, signal)
        cache.set(query, n)
        return n
      })
      chain = run.catch(() => undefined)
      return run
    },
  }
}

/** One shared counter, so the cache and the spacing hold across the page. */
let shared: PubMedCounter | null = null
export function getPubMedCounter(): PubMedCounter {
  return (shared ??= createPubMedCounter())
}

export interface CountRow {
  /** Key of the row (concept id, or "total"). */
  id: string
  query: string
  count: number | null
  error: PubMedErrorCode | null
}

/**
 * Counts the components one after the other, then the whole string. Calls
 * `onRow` after each request. Stops at the first error and marks the remaining
 * rows pending (count null, error null).
 */
export async function countRows(
  counter: PubMedCounter,
  rows: Array<{ id: string; query: string }>,
  onRow: (row: CountRow, done: number) => void,
  signal?: AbortSignal,
): Promise<{ stopped: PubMedErrorCode | null }> {
  let done = 0
  for (const r of rows) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
    try {
      const count = await counter.count(r.query, signal)
      onRow({ id: r.id, query: r.query, count, error: null }, ++done)
    } catch (e) {
      if (signal?.aborted || (e instanceof DOMException && e.name === "AbortError")) throw e
      const code = e instanceof PubMedError ? e.code : "other"
      onRow({ id: r.id, query: r.query, count: null, error: code }, done)
      return { stopped: code }
    }
  }
  return { stopped: null }
}
