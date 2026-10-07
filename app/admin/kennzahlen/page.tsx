export const dynamic = "force-dynamic"

import AutoRefresh from "@/components/admin/AutoRefresh"
import { getDevto, getNpm, getPolar } from "@/lib/metrics/collect"

const nf = new Intl.NumberFormat("de-CH")

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-semibold mt-1">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </div>
  )
}

function Unavailable({ error }: { error: string }) {
  return <p className="text-sm text-muted-foreground">Nicht verfügbar: {error}</p>
}

const links = [
  { href: "https://dev.to/dashboard/analytics", label: "dev.to Analytics" },
  { href: "https://publish.buffer.com/analytics", label: "Buffer Insights" },
  { href: "https://polar.sh/dashboard/sweberdev", label: "Polar Dashboard" },
]

export default async function KennzahlenPage() {
  const [devto, npm, polar] = await Promise.all([getDevto(), getNpm(), getPolar()])
  const stand = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich" })

  return (
    <div className="space-y-10">
      <AutoRefresh seconds={60} />
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Kennzahlen</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Live abgefragt, Stand {stand}, aktualisiert sich jede Minute. npm-Zahlen kommen mit ca. 1 Tag Verzögerung von
          npm selbst. Buffer-Insights liefert Buffer nicht per API, dafür der Link unten.
        </p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">Polar-Verkäufe</h3>
        {polar.error ? (
          <Unavailable error={polar.error} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile label="Bestellungen" value={nf.format(polar.orders)} hint={`${polar.ordersLast30d} in 30 Tagen`} />
            <Tile
              label="Umsatz"
              value={`${nf.format(polar.revenue)} ${polar.currency?.toUpperCase() ?? ""}`}
              hint={`${nf.format(polar.revenueLast30d)} in 30 Tagen`}
            />
            <Tile
              label="Aktive Abos"
              value={polar.activeSubscriptions === null ? "?" : nf.format(polar.activeSubscriptions)}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">dev.to</h3>
        {devto.error ? (
          <Unavailable error={devto.error} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile label="Artikel" value={nf.format(devto.articles)} />
              <Tile label="Aufrufe" value={nf.format(devto.views)} />
              <Tile label="Reaktionen" value={nf.format(devto.reactions)} />
              <Tile label="Kommentare" value={nf.format(devto.comments)} />
            </div>
            {devto.top.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1 pr-4 font-normal">Artikel</th>
                    <th className="py-1 pr-4 font-normal text-right">Aufrufe</th>
                    <th className="py-1 pr-4 font-normal text-right">Reaktionen</th>
                    <th className="py-1 font-normal text-right">Kommentare</th>
                  </tr>
                </thead>
                <tbody>
                  {devto.top.map((a) => (
                    <tr key={a.url} className="border-t border-border">
                      <td className="py-1 pr-4">
                        <a href={a.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                          {a.title}
                        </a>
                      </td>
                      <td className="py-1 pr-4 text-right">{nf.format(a.views)}</td>
                      <td className="py-1 pr-4 text-right">{nf.format(a.reactions)}</td>
                      <td className="py-1 text-right">{nf.format(a.comments)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">npm-Downloads</h3>
        {npm.error ? (
          <Unavailable error={npm.error} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile label="Pakete" value={nf.format(npm.list.length)} />
              <Tile label="Letzte Woche" value={nf.format(npm.week)} />
              <Tile label="Letzter Monat" value={nf.format(npm.month)} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-4 font-normal">Paket</th>
                  <th className="py-1 pr-4 font-normal text-right">Woche</th>
                  <th className="py-1 font-normal text-right">Monat</th>
                </tr>
              </thead>
              <tbody>
                {npm.list.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="py-1 pr-4 font-mono">{p.name}</td>
                    <td className="py-1 pr-4 text-right">{nf.format(p.week)}</td>
                    <td className="py-1 text-right">{nf.format(p.month)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  )
}
