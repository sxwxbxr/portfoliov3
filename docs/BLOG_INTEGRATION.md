# Blog-Anbindung packages.sweber.dev

Für Marco Schulz (Schulz Media). So kommen Beiträge auf packages.sweber.dev/blog.

## Standardweg: Content-API von Schulz Media (Pull)

Die Beiträge werden bei Schulz Media geschrieben und freigegeben. packages.sweber.dev holt sie
serverseitig über die Content-API ab (`lib/blog/schulz-media.ts`) und rendert sie als eigene
Seiten. Es gibt kein iframe, nichts wird im Browser nachgeladen, und der Schlüssel bleibt auf dem
Server.

**Einstellungen bei Schulz Media**

| Feld | Wert |
|---|---|
| Adressmuster | `https://packages.sweber.dev/blog/{slug}` (**ohne** Schrägstrich am Ende, so wie die Seite ihre URLs schreibt) |
| Build-Hook | `https://packages.sweber.dev/api/revalidate?token=<BLOG_REVALIDATE_TOKEN>` (POST) |

**Was die Seite mit einem Beitrag macht**

- `content_html` wird bereinigt gerendert: kein `<script>`, keine Event-Handler, keine iframes.
  Überschriften ab `<h2>` erhalten Anker und ergeben das Inhaltsverzeichnis.
- Die Seite setzt:
  - `<title>`: `seo.title` oder `title`
  - Meta-Beschreibung: `seo.meta_description` oder `excerpt`
  - `canonical` und `og:url`: `url`
  - `og:image`: das Beitragsbild, sonst eine generierte Grafik
  - Strukturierte Daten `BlogPosting` mit `inLanguage: "de-CH"` und Weber Development als
    `author` und `publisher`
- Zeigt `url` auf packages.sweber.dev, nimmt die Seite ihre eigene Schreibweise als `canonical`.
  Ein abweichender Schrägstrich führt also nicht zu einer Umleitung. Zeigt `url` auf eine andere
  Domain, bleibt sie als `canonical` stehen, und der Beitrag kommt nicht in die Sitemap.
- Nennt ein Beitrag im Titel oder Anriss ein Package, zum Beispiel „Permito“, erscheint er
  zusätzlich auf dessen Seite.
- Antworten der API werden 5 Minuten zwischengespeichert. Der Build-Hook leert den Cache sofort:
  Blog, Feeds, Sitemap und Package-Seiten.
- Ist die API nicht erreichbar, bleiben die zuletzt ausgelieferten Seiten stehen. Ein Build bricht
  deswegen nicht ab.

**Einrichtung (Seya, in Vercel → Production):** `SCHULZ_MEDIA_API_KEY` mit dem `sm_live_…`-Schlüssel und
`BLOG_REVALIDATE_TOKEN` für den Build-Hook.

## Alternative: Push über die Ingest-API

Für Systeme, die Beiträge aktiv senden statt sie bereitzustellen. Für Schulz Media ist sie nicht
nötig, bleibt aber verfügbar.

## Zugang

- **Basis-URL:** `https://packages.sweber.dev`. Alternativ funktioniert `https://sweber.dev`, beide
  zeigen auf dieselbe App.
- **Authentifizierung:** `Authorization: Bearer <BLOG_INGEST_TOKEN>`. Den Token gibt Seya euch auf
  sicherem Weg, nicht per E-Mail im Klartext.
- **Format:** JSON (`Content-Type: application/json`), UTF-8.

## Beitrag anlegen oder aktualisieren

```
POST /api/packages/posts
```

Der Beitrag wird über eure eigene `externalId` erkannt. Schickt ihr dieselbe `externalId` noch einmal,
wird der Beitrag aktualisiert, sonst neu angelegt. Ihr könnt also bei jeder Änderung einfach den
ganzen Beitrag erneut senden.

```json
{
  "externalId": "sm-2026-1042",
  "slug": "permito-pro-released",
  "title": "Permito Pro is available",
  "excerpt": "Service catalog, cookie table, consent log, scanner and themes for Permito.",
  "body": "## What's new\n\nMarkdown, GitHub-flavoured (tables, lists, code blocks) …",
  "type": "release",
  "status": "published",
  "publishedAt": "2026-10-05",
  "author": "Marco Schulz",
  "coverImage": "https://example.com/cover.png",
  "tags": ["consent", "nextjs"],
  "packages": ["permito"],
  "videos": ["dQw4w9WgXcQ"],
  "canonicalUrl": "https://schulz-media.example/blog/permito-pro"
}
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `externalId` | ja | Eure ID für den Beitrag, max. 200 Zeichen |
| `slug` | ja | URL-Teil: `packages.sweber.dev/blog/<slug>`. Nur Kleinbuchstaben, Ziffern und Bindestriche |
| `title` | ja | Titel, max. 200 Zeichen |
| `publishedAt` | ja | `YYYY-MM-DD`. Liegt das Datum in der Zukunft, erscheint der Beitrag erst an diesem Tag |
| `excerpt` | nein | Kurzfassung für Liste, Feed und Vorschau, max. 500 Zeichen |
| `body` | nein | Inhalt als **Markdown** (GFM). HTML bitte vorher nach Markdown wandeln |
| `type` | nein | `news` (Standard), `tutorial` oder `release` |
| `status` | nein | `published` (Standard bei der API) oder `draft` |
| `author` | nein | Standard: `Seya Weber` |
| `coverImage` | nein | Absolute Bild-URL |
| `tags` | nein | Liste von Schlagworten |
| `packages` | nein | Package-Slugs, zu denen der Beitrag gehört, z. B. `["permito"]`. Er erscheint dann auch auf der Package-Seite. Gültige Slugs stehen in `https://packages.sweber.dev/packages.json` |
| `videos` | nein | YouTube-Video-IDs (nicht die ganze URL). Sie werden erst nach Einwilligung der Besucher geladen |
| `canonicalUrl` | nein | Erscheint der Artikel zuerst bei euch, hier die Original-URL eintragen. Die Seite verweist dann kanonisch dorthin (kein Duplicate Content) |

**Antworten**
- `201`: neu angelegt.
- `200`: aktualisiert.
- In beiden Fällen kommt `{ "post": { …, "url": "https://packages.sweber.dev/blog/<slug>" }, "created": true|false }` zurück. `url` ist `null`, solange der Beitrag ein Entwurf ist.
- `400`: Eingabe ungültig. `error` nennt das Feld.
- `401`: Token falsch.
- `409`: Der Slug gehört schon einem anderen Beitrag.
- `503`: Die Ingest-API ist nicht eingeschaltet.

## Weitere Aufrufe

| Methode und Pfad | Zweck |
|---|---|
| `GET /api/packages/posts` | Alle Beiträge, die euer System geliefert hat, inklusive Entwürfe |
| `GET /api/packages/posts/<externalId>` | Einen Beitrag lesen |
| `PATCH /api/packages/posts/<externalId>` | Teil-Update, z. B. `{ "status": "draft" }` zum Zurückziehen |
| `DELETE /api/packages/posts/<externalId>` | Beitrag löschen (`204`) |

Euer System sieht und ändert nur die eigenen Beiträge, nie die aus dem Admin.

## Beispiel (curl)

```sh
curl -X POST https://packages.sweber.dev/api/packages/posts \
  -H "Authorization: Bearer $BLOG_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"externalId":"sm-1","slug":"hello-packages","title":"Hello","publishedAt":"2026-10-05","body":"First post."}'
```

## Revalidierungs-Webhook (Build-Hook)

```
POST /api/revalidate
Authorization: Bearer <BLOG_REVALIDATE_TOKEN>
{ "slug": "permito-pro-released" }
```

Leert den Cache von Blog, Feeds, Sitemap und Package-Seiten. Bei Push über die Ingest-API ist das
nicht nötig, das passiert dort automatisch.

## Was die Seite mit einem Beitrag macht

- Er erscheint unter `/blog`, filterbar nach Package und Typ, und als Seite `/blog/<slug>` mit
  Inhaltsverzeichnis, Box „Verwendetes Package“ und verwandten Beiträgen.
- Er erscheint im RSS-Feed `/blog/feed.xml` und in `/blog/posts.json`.
- Er erscheint in der Sitemap, ausser wenn `canonicalUrl` auf eine fremde Seite zeigt.
- Die zugehörige Package-Seite zeigt die neuesten drei Beiträge.
- Er bekommt ein automatisch erzeugtes Open-Graph-Bild und `Article`-Strukturdaten.

## Einrichtung (Seya)

1. In Vercel unter Production die Variable `BLOG_INGEST_TOKEN` setzen, ein langer Zufallswert,
   z. B. aus `openssl rand -hex 32`. Optional `BLOG_INGEST_SOURCE`, Standard ist `schulz-media`.
2. Neu deployen.
3. Den Token an Marco übergeben.
