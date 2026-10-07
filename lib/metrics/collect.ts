// Live numbers for /admin/kennzahlen: dev.to, npm and Polar. Each source is optional. A missing
// token or a failing API is returned as `error` instead of breaking the page.
// Mirrors scripts/metrics.mjs in Weber-Development/wekrbank, which writes the daily history.

const NPM_SCOPES = ["sweberdev", "permitojs"]

export type Source<T> = ({ error?: undefined } & T) | { error: string }

export type DevtoArticle = { title: string; url: string; views: number; reactions: number; comments: number }
export type Devto = { articles: number; views: number; reactions: number; comments: number; top: DevtoArticle[] }
export type NpmPackage = { name: string; week: number; month: number }
export type Npm = { week: number; month: number; list: NpmPackage[] }
export type Polar = {
  orders: number
  ordersLast30d: number
  revenue: number
  revenueLast30d: number
  currency: string | null
  activeSubscriptions: number | null
}

async function getJson(url: string, init: RequestInit & { next?: { revalidate: number } } = {}) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${new URL(url).host} antwortete ${res.status}`)
  return res.json()
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

export async function getDevto(): Promise<Source<Devto>> {
  const key = process.env.DEVTO_API_KEY
  if (!key) return { error: "DEVTO_API_KEY fehlt in den Vercel-Variablen" }
  try {
    const headers = { "api-key": key, Accept: "application/vnd.forem.api-v1+json" }
    const all: Array<Record<string, any>> = []
    for (let page = 1; page <= 10; page++) {
      const batch = await getJson(`https://dev.to/api/articles/me/published?per_page=100&page=${page}`, {
        headers,
        next: { revalidate: 60 },
      })
      all.push(...batch)
      if (batch.length < 100) break
    }
    const list: DevtoArticle[] = all.map((a) => ({
      title: a.title,
      url: a.url,
      views: a.page_views_count ?? 0,
      reactions: a.public_reactions_count ?? 0,
      comments: a.comments_count ?? 0,
    }))
    const sum = (k: "views" | "reactions" | "comments") => list.reduce((s, a) => s + a[k], 0)
    return {
      articles: list.length,
      views: sum("views"),
      reactions: sum("reactions"),
      comments: sum("comments"),
      top: [...list].sort((a, b) => b.views - a.views).slice(0, 10),
    }
  } catch (e) {
    return { error: message(e) }
  }
}

async function npmPoint(range: string, name: string): Promise<number> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.npmjs.org/downloads/point/${range}/${name}`, { next: { revalidate: 3600 } })
    if (res.ok) return (await res.json()).downloads ?? 0
    // 404: npm has no statistics yet for a brand-new package.
    if (res.status === 404) return 0
    if (res.status !== 429 || attempt >= 4) throw new Error(`api.npmjs.org antwortete ${res.status}`)
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
  }
}

export async function getNpm(): Promise<Source<Npm>> {
  try {
    const names: string[] = []
    for (const scope of NPM_SCOPES) {
      const r = await getJson(`https://registry.npmjs.org/-/v1/search?text=%40${scope}&size=250`, {
        next: { revalidate: 3600 },
      })
      names.push(...r.objects.map((o: any) => o.package.name).filter((n: string) => n.startsWith(`@${scope}/`)))
    }
    const list: NpmPackage[] = []
    for (const name of names) {
      list.push({ name, week: await npmPoint("last-week", name), month: await npmPoint("last-month", name) })
    }
    list.sort((a, b) => b.week - a.week || b.month - a.month)
    return {
      week: list.reduce((s, p) => s + p.week, 0),
      month: list.reduce((s, p) => s + p.month, 0),
      list,
    }
  } catch (e) {
    return { error: message(e) }
  }
}

export async function getPolar(): Promise<Source<Polar>> {
  const token = process.env.POLAR_TOKEN
  if (!token) return { error: "POLAR_TOKEN fehlt in den Vercel-Variablen" }
  try {
    const headers = { authorization: `Bearer ${token}` }
    const all = async (path: string) => {
      const items: Array<Record<string, any>> = []
      for (let page = 1; page <= 50; page++) {
        const r = await getJson(`https://api.polar.sh/v1/${path}${path.includes("?") ? "&" : "?"}limit=100&page=${page}`, {
          headers,
          next: { revalidate: 60 },
        })
        items.push(...r.items)
        if (page >= (r.pagination?.max_page ?? 1)) break
      }
      return items
    }
    const orders = (await all("orders/")).filter((o) => o.paid !== false)
    const cents = (o: Record<string, any>) => o.net_amount ?? o.amount ?? 0
    const since = Date.now() - 30 * 864e5
    const recent = orders.filter((o) => Date.parse(o.created_at) >= since)
    const subs = await all("subscriptions/?active=true").catch(() => null)
    return {
      orders: orders.length,
      ordersLast30d: recent.length,
      revenue: orders.reduce((s, o) => s + cents(o), 0) / 100,
      revenueLast30d: recent.reduce((s, o) => s + cents(o), 0) / 100,
      currency: orders[0]?.currency ?? null,
      activeSubscriptions: subs ? subs.length : null,
    }
  } catch (e) {
    return { error: message(e) }
  }
}
