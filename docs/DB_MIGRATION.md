# Datenbank-Migration auf einen neuen Account

Ziel: alle Inhalte (Projekte, Erfahrung, Blog, Education, Zertifikate, Case
Studies, Skills, Site-Settings, Admin-User) von der aktuellen Neon-DB in eine
neue DB auf einem anderen Account übernehmen.

Die Migration besteht aus drei Schritten: **Schema anlegen → exportieren →
importieren**. Geschieht über zwei `tsx`-Skripte (`scripts/export-db.ts`,
`scripts/import-db.ts`) und das vorhandene `drizzle-kit push`.

> Hinweis: Beispiele in PowerShell (Windows). `$env:DATABASE_URL` überschreibt
> einen Wert aus `.env.local` für den jeweiligen Befehl.

## 1. Daten aus der ALTEN DB exportieren

`DATABASE_URL` muss auf die **Quell-DB** zeigen (aus `.env.local` oder gesetzt):

```powershell
$env:DATABASE_URL = "<alte-neon-connection-url>"
npm run db:export
```

Ergebnis: `scripts/db-snapshot.json` mit allen Tabellen (inkl. Primärschlüssel).

## 2. Schema auf der NEUEN DB anlegen

`DATABASE_URL` auf die **Ziel-DB** des neuen Accounts setzen und das Schema
pushen:

```powershell
$env:DATABASE_URL = "<neue-neon-connection-url>"
npm run db:push
```

## 3. Daten in die NEUE DB importieren

`DATABASE_URL` zeigt weiterhin auf die Ziel-DB. Der Import leert die Zieltabellen
zuerst und verlangt `CONFIRM_IMPORT=1` als Sicherheitsbestätigung:

```powershell
$env:DATABASE_URL = "<neue-neon-connection-url>"
$env:CONFIRM_IMPORT = "1"
npm run db:import
```

Der Import übernimmt die ursprünglichen IDs und setzt anschließend die
Serial-Sequenzen zurück, damit neue Inserts (z. B. über das Admin-UI) keine
kollidierenden IDs erzeugen.

## 4. App umstellen

In Vercel (bzw. `.env.local`) `DATABASE_URL` auf die neue DB setzen und neu
deployen. Fertig.

## Hinweise

- Es gibt keine Foreign Keys zwischen den Inhaltstabellen; Reihenfolge spielt
  daher keine Rolle.
- `db-snapshot.json` enthält den Admin-User inkl. `password_hash`. Datei nicht
  ins Repo committen — sie liegt unter `scripts/` und sollte in `.gitignore`.
- Der Import ist idempotent: erneutes Ausführen leert und befüllt die Tabellen
  erneut aus dem Snapshot.
