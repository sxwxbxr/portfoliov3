# Blog-Anbindung packages.sweber.dev

Für Marco Schulz (Schulz Media). So liefert ein externes Blog-System Beiträge an
packages.sweber.dev/blog.

Es gibt zwei Wege, die sich kombinieren lassen:

1. **Push (empfohlen):** Euer System schickt jeden Beitrag per HTTP an die Ingest-API. Er ist sofort
   online, ohne Deploy.
2. **Revalidierung:** Liegt der Inhalt anderswo und wird von der Seite abgeholt, ruft ihr nach jeder
   Änderung den Webhook `/api/revalidate` auf.

Beiträge, die Seya selbst schreibt, entstehen unter sweber.dev/admin/news und landen in derselben
Liste.

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

## Revalidierungs-Webhook (Pull-Variante)

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
