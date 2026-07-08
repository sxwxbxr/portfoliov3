# AI Features Spec — sweber.dev Portfolio

**Stack:** Next.js (App Router), TypeScript, Vercel deployment  
**AI Provider:** Anthropic API (`claude-haiku-4-5` for all features unless noted)  
**Scope:** 5 eigenständige Features, einzeln implementierbar, keine gegenseitigen Abhängigkeiten

---

## Allgemeine Konventionen

- Alle API-Calls laufen serverseitig via Next.js Route Handlers (`app/api/*/route.ts`)
- Anthropic API Key: Umgebungsvariable `ANTHROPIC_API_KEY`
- Rate-Limiting: Jeder Route Handler prüft IP-basiert (via `x-forwarded-for`), max. 10 Requests/Minute pro IP. Bei Überschreitung: HTTP 429 mit JSON `{ error: "Too many requests" }`
- Alle AI-Antworten streamen via `ReadableStream` (Server-Sent Events), kein Batch-Response
- Fehlerbehandlung: Bei Anthropic-API-Fehler immer HTTP 500 + `{ error: "AI service unavailable" }`, nie rohe Fehlermeldungen an den Client weitergeben
- Kein persistenter Speicher nötig (kein DB-Schema, kein Auth), ausser wo explizit angegeben

---

## Feature 1: Portfolio Chat Widget

### Ziel
Ein schwebendes Chat-Widget auf jeder Seite, das Besucher über Seya Weber, seine Projekte, Skills und Verfügbarkeit befragen können, ohne manuell durch die Seite zu navigieren.

### UI/UX
- **Trigger:** Floating Button rechts unten, Icon: Chat-Bubble oder Sparkles-Icon (Lucide), Label: "Ask me anything"
- **Widget:** Öffnet sich als Card (nicht Fullscreen), Grösse ca. 380×520px, mobile: fullscreen Modal
- **Design:** Passt sich dem bestehenden Dark-Theme (`#0d0d14` Hintergrund) an, gleiche Schriftart wie Site
- **Nachrichten:** User-Nachrichten rechts ausgerichtet, AI-Antworten links, Markdown-Rendering (fett, Links, Listen)
- **Zustand:** Chat-Verlauf bleibt erhalten solange Widget geöffnet ist; bei Schliessen und Wiederöffnen wird History **nicht** persistiert (kein localStorage)
- **Initiale Nachricht:** Widget zeigt beim ersten Öffnen automatisch folgende Nachricht an (kein API-Call):
  > "Hi! I'm Seya's AI assistant. Ask me anything about his work, projects, or availability."
- **Input:** Textarea (max. 500 Zeichen), Enter zum Senden, Shift+Enter für Zeilenumbruch, Send-Button

### Route Handler
**Pfad:** `app/api/chat/route.ts`  
**Methode:** POST  
**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "string" },
    { "role": "assistant", "content": "string" }
  ]
}
```
**Response:** Streaming (`text/event-stream`)

**System Prompt (exakt so verwenden):**
```
You are a helpful assistant for Seya Weber's portfolio website (sweber.dev). 
Answer questions about Seya concisely and professionally. Always respond in the same language the user writes in (German or English).

About Seya Weber:
- Project Manager & Software Developer based in St. Gallen, Switzerland
- Currently: Software & Digitalization PM at Telsonic Ultrasonics AG (industrial automation, OPC-UA, PLC scripting)
- Starting Sep 2026: BSc Data Science at ZHAW Winterthur (full-time)
- Background: Electrical planning (Elektroplaner EFZ), Software development apprenticeship (Informatiker EFZ, INNOFORCE)
- Skills: C#, .NET, TypeScript, React, Next.js, Python, SQL, REST APIs, Cloudflare Workers, Docker
- PM Skills: Agile/Scrum, Requirements Engineering, Stakeholder Management
- Tools: Azure DevOps, Jira, Git, Vercel, Supabase, Docker
- Languages: German (native), English (fluent), French (basic)

Projects:
1. FlowlyChat – Multi-tenant WhatsApp chatbot SaaS for DACH market. Stack: Cloudflare Workers, D1, OpenRouter, TypeScript. Status: In development.
2. JobMatch CH – Desktop job-matching app. Stack: Tauri (Rust), SvelteKit, Cloudflare Workers backend. Status: Specced / early development.
3. Kawasaki Z500 CAN-Bus Display – Custom TFT display via ESP32 and CAN-Bus reverse engineering for a motorcycle.
4. Home Network Observability Dashboard – Self-hosted Grafana dashboard for home network monitoring.

Availability:
- Until Aug 2026: Limited availability (finishing current job)
- From Sep 2026: Focused on ZHAW studies; freelance/part-time projects possible depending on scope
- Contact: info@sweber.dev

Rules:
- Never make up facts. If you don't know something specific, say so and suggest contacting Seya directly.
- Keep answers short (max 3-4 sentences) unless a detailed technical question requires more.
- Do not discuss salary expectations, personal/private matters, or anything unrelated to Seya's professional profile.
- If asked about availability for a project, always end with "Feel free to reach out at info@sweber.dev"
```

### Komponenten-Struktur
```
components/
  chat-widget/
    ChatWidget.tsx        # Haupt-Wrapper, verwaltet open/close state
    ChatMessages.tsx      # Rendert Message-Liste mit Markdown
    ChatInput.tsx         # Textarea + Send Button
    ChatBubble.tsx        # Floating Trigger Button
```

### Sonstiges
- Widget als `'use client'` Component in `app/layout.tsx` einbinden (erscheint auf allen Seiten)
- Während AI antwortet: Typing-Indicator (drei animierte Punkte) anzeigen
- Fehlerfall: Inline-Fehlermeldung in der Chat-UI, kein Alert

---

## Feature 2: Smart Contact Form Enhancement

### Ziel
Das bestehende Kontaktformular auf `/contact` wird um einen AI-Analyse-Schritt erweitert: Nachdem der User seine Nachricht eingegeben hat (on-blur des Message-Felds), analysiert Claude die Anfrage und gibt eine kurze Einschätzung zurück. Das erhöht Conversion und vorqualifiziert Anfragen.

### UI/UX
- **Trigger:** on-blur des Message-Textareas (nicht on-change, um unnötige Calls zu vermeiden). Nur auslösen wenn Message-Feld mindestens 30 Zeichen hat.
- **Ausgabe:** Direkt unter dem Message-Feld erscheint eine dezente Card mit:
  - Kleines Sparkles-Icon links
  - Titel: "AI Match Analysis"
  - 2-3 Sätze Einschätzung (wie gut der Bedarf zu Seya's Profil passt, was sie beisteuern könnte)
  - Optional: ein konkreter Hinweis ("Based on your message, this sounds like a TypeScript/automation project — right up Seya's alley.")
- **Loading State:** Skeleton-Loader / Pulsing-Placeholder während AI antwortet (kein Spinner)
- **Design:** Card mit leicht erhöhter Transparenz / Border, subtil, nicht aufdringlich. Soll dem User das Gefühl geben, die richtige Person kontaktiert zu haben.
- **Fehlerfall:** Card einfach nicht anzeigen (silent fail), Formular bleibt voll funktional

### Route Handler
**Pfad:** `app/api/contact-analysis/route.ts`  
**Methode:** POST  
**Request Body:**
```json
{
  "message": "string",
  "projectType": "string | null",
  "company": "string | null"
}
```
**Response:** JSON (kein Streaming für dieses Feature)
```json
{
  "analysis": "string"
}
```
**Max Tokens:** 150 (kurze Antwort reicht)

**System Prompt (exakt so verwenden):**
```
You are a helpful assistant on Seya Weber's portfolio website. 
A potential client has filled in a contact form. Analyze their message and write a short, encouraging 2-3 sentence response that:
1. Acknowledges what kind of project/need they seem to have
2. Briefly explains why Seya would be a good fit (reference her relevant skills: C#/.NET, TypeScript, Cloudflare, automation, PM experience)
3. Ends with a positive, warm note

Always respond in the same language as the user's message (German or English).
Be warm but professional. Never promise anything on Seya's behalf.
Keep it under 60 words. No bullet points, just flowing text.
```

### Wichtig
- Das bestehende Formular und dessen Submit-Logik darf **nicht** verändert werden
- Die AI-Analyse ist rein informativ und wird **nicht** mit der Formular-Submission mitgeschickt
- Kein Rate-Limit nötig (on-blur triggert maximal einmal pro User-Session sinnvoll)

---

## Feature 3: Project Deep Dive (On-Demand)

### Ziel
Jede Projektkarte auf `/projects` und den einzelnen Projektseiten erhält einen "Technical Deep Dive" Button. Per Klick wird on-demand eine ausführlichere technische Beschreibung des Projekts geladen, ohne dass statischer Content gepflegt werden muss.

### UI/UX
- **Button:** Klein, sekundärer Style, Label: "Technical Deep Dive →" oder "Expand" mit einem Code/Terminal-Icon
- **Platzierung:** Unterhalb der bestehenden Projektbeschreibung / Card
- **Ausgabe:** Klappt direkt unterhalb des Buttons auf (Accordion-Style, animiert), kein Modal
- **Inhalt der AI-Antwort** (Markdown, mit Abschnitten):
  - **Tech Stack & Architecture** – Was wurde wie eingebaut, warum diese Entscheidungen
  - **Key Challenges** – Welche technischen Herausforderungen traten auf
  - **Learnings** – Was hat Seya dabei gelernt / was würde sie anders machen
- **Caching:** Das Ergebnis wird im React State gespeichert (pro Projektkarte). Zweiter Klick zeigt gecachten Content, macht keinen neuen API-Call.
- **Loading State:** Skeleton-Loader mit 3 Absatz-Platzhaltern
- **Fehlerfall:** Inline-Fehlermeldung "Could not load details. Try again."

### Route Handler
**Pfad:** `app/api/project-deepdive/route.ts`  
**Methode:** POST  
**Request Body:**
```json
{
  "projectSlug": "string",
  "projectTitle": "string",
  "projectDescription": "string",
  "techStack": ["string"]
}
```
**Response:** Streaming (`text/event-stream`)

**System Prompt (exakt so verwenden):**
```
You are writing a technical deep dive section for Seya Weber's portfolio website.
Seya is a Project Manager & Software Developer based in Switzerland with a background in C#/.NET, TypeScript, Cloudflare Workers, automation, and industrial systems.

Given a project title, description, and tech stack, write a detailed but concise technical breakdown in Markdown.
Structure your response with exactly these three H3 headings:
### Tech Stack & Architecture
### Key Challenges  
### Learnings

Each section: 2-4 sentences. Be specific and technical. Write from Seya's perspective ("I chose...", "We encountered...").
Always respond in English regardless of input language.
Total length: max 250 words.
```

### Projektdaten-Mapping
Die Projektdaten werden aus den bestehenden Content-Quellen (MDX/JSON/CMS — je nach aktuellem Setup) extrahiert und als Props an die Komponente übergeben. Die Komponente selbst fragt die Daten nicht selbst ab.

### Komponenten-Struktur
```
components/
  project-deepdive/
    DeepDiveButton.tsx    # Button + Accordion wrapper
    DeepDiveContent.tsx   # Rendert Streaming-Markdown
```

---

## Feature 4: Pitch Generator (`/pitch`)

### Ziel
Eine neue, eigenständige Seite `/pitch` (nicht im Haupt-Navigation, aber verlinkbar). Ein potenzieller Auftraggeber oder Recruiter kann dort einen personalisierten "Pitch-Text" über Seya generieren lassen, den er direkt weiterleiten kann.

### UI/UX
**Schritt 1: Input-Form**
- Feld 1: "Your Role / Context" — Dropdown mit Optionen: `Recruiter`, `Startup Founder`, `Agency`, `Enterprise PM`, `Other`
- Feld 2: "What are you looking for?" — Checkboxes (multi-select):
  - Full-Stack Development
  - Project Management
  - Automation & OPC-UA
  - SaaS / Cloud Architecture
  - Short-term Freelance
  - Long-term Collaboration
- Feld 3: "Any specific requirements?" — Textarea, optional, max 300 Zeichen
- Button: "Generate Pitch →"

**Schritt 2: Ergebnis**
- Animiertes Streaming-Rendering des generierten Texts (wie bei ChatGPT)
- Zwei Buttons: "Copy to Clipboard" und "Start over"
- Hinweis-Text unter den Buttons: "This pitch was generated by AI based on Seya's actual profile. For direct contact: info@sweber.dev"

**Design:** Eigene, cleane Page. Kein Header-Navigation nötig ausser Back-Link zur Hauptsite. Kann minimal/landing-page-artig sein.

### Route Handler
**Pfad:** `app/api/generate-pitch/route.ts`  
**Methode:** POST  
**Request Body:**
```json
{
  "role": "string",
  "needs": ["string"],
  "requirements": "string | null"
}
```
**Response:** Streaming (`text/event-stream`)  
**Modell:** `claude-haiku-4-5` (reicht für diese Aufgabe)

**System Prompt (exakt so verwenden):**
```
You are writing a personalized pitch text about Seya Weber for her portfolio website.
The pitch is addressed TO the person reading it (recruiter, founder, etc.), written about Seya in third person.

About Seya Weber (use only these facts):
- Project Manager & Software Developer, St. Gallen, Switzerland
- 4+ years experience across electrical engineering, healthcare tech, industrial automation, and SaaS development
- Current role: Digitalization PM at Telsonic Ultrasonics AG (industrial ultrasonic welding automation, OPC-UA, C#, PLC scripting)
- Starting Sep 2026: BSc Data Science at ZHAW Winterthur
- Key skills: C#/.NET, TypeScript, React/Next.js, Cloudflare Workers, Docker, Python, SQL
- PM skills: Agile, Requirements Engineering, Stakeholder Management, cross-functional teams
- Side projects: FlowlyChat (WhatsApp SaaS, Cloudflare/D1/OpenRouter), JobMatch CH (Tauri desktop app)
- Available for: part-time/freelance projects from Sep 2026 onwards
- Contact: info@sweber.dev

Write a pitch of 120-160 words.
Tailor it specifically to the role and needs provided.
Professional, warm, confident tone. No bullet points — flowing paragraphs only.
End with a clear call-to-action to reach out at info@sweber.dev.
Always write in English.
```

### Seitenstruktur
```
app/
  pitch/
    page.tsx          # Client component, verwaltet Form-State und Streaming
```

---

## Feature 5: Interactive Skill Explorer

### Ziel
Die Skills-Seite (`/skills`) wird von einer statischen Liste zu einer interaktiven Übersicht. Klick auf einen Skill-Tag öffnet ein kleines Popover/Panel mit einer AI-generierten Erklärung, wie Seya diesen Skill konkret eingesetzt hat, mit Verweis auf relevante Projekte.

### UI/UX
- **Skill-Tags:** Bleiben optisch wie bisher (oder werden zu klickbaren Chips/Badges aufgewertet, falls sie es noch nicht sind)
- **Interaktion:** Klick auf Tag öffnet ein Popover (kein Routing, kein Modal) direkt beim Tag, mit kleinem Pfeil/Caret
- **Popover-Inhalt:**
  - Skill-Name als Titel
  - AI-generierter Text: 2-3 Sätze wie Seya diesen Skill genutzt hat
  - Optional: 1-2 verlinkte Projekt-Tags (Pill-Style) die den Skill genutzt haben
  - Kleiner "×" Close-Button
- **Caching:** Ergebnisse werden für die gesamte Session im `Map<skillName, content>` State gecacht (kein zweiter API-Call für denselben Skill)
- **Loading:** Skeleton im Popover, 2 Zeilen
- **Fehlerfall:** Fallback-Text: "Used in various projects — see the Projects page for details."
- **Nur ein Popover gleichzeitig offen**

### Route Handler
**Pfad:** `app/api/skill-detail/route.ts`  
**Methode:** POST  
**Request Body:**
```json
{
  "skill": "string"
}
```
**Response:** JSON (kein Streaming, kurz genug)
```json
{
  "description": "string",
  "relatedProjects": ["string"]
}
```
**Max Tokens:** 120

**System Prompt (exakt so verwenden):**
```
You are generating a short skill description for Seya Weber's portfolio website.
Given a skill name, write 2-3 sentences explaining how Seya has specifically used this skill in her work.
Be concrete, mention real contexts (industrial automation, SaaS development, web apps, PM work).
Also return 1-2 relevant project names from this list (only if genuinely relevant): 
FlowlyChat, JobMatch CH, Kawasaki Z500 CAN-Bus Display, Home Network Observability Dashboard, Telsonic (internal tools), INNOFORCE (healthcare data migration)

Respond in JSON only, no markdown, no explanation:
{
  "description": "...",
  "relatedProjects": ["..."]
}

Seya's skills context:
- C#/.NET: Used at INNOFORCE for healthcare database migrations; internal tools at Telsonic
- TypeScript: FlowlyChat (Cloudflare Workers), JobMatch CH (SvelteKit frontend), sweber.dev
- React/Next.js: sweber.dev portfolio, various web apps
- Cloudflare Workers/D1: FlowlyChat backend architecture, JobMatch CH API
- Docker: Homelab self-hosting, development environments
- Python: Data analysis scripts, automation tasks
- SQL: INNOFORCE healthcare DB migrations, Supabase projects
- OPC-UA: Telsonic MES interface integration
- Agile/Scrum: PM role at Telsonic, project delivery
- Git/Azure DevOps: Daily use across all projects
- Grafana: Home Network Observability Dashboard
- ESP32/CAN-Bus: Kawasaki Z500 custom display project
```

### Komponenten-Struktur
```
components/
  skill-explorer/
    SkillTag.tsx          # Einzelner klickbarer Tag + Popover-Trigger
    SkillPopover.tsx      # Popover-Content mit Loading/Error states
    SkillsGrid.tsx        # Wrapper der alle Tags rendert (ersetzt bestehende Liste)
```

---

## Implementierungsreihenfolge (Empfehlung)

| Priorität | Feature | Aufwand | Impact |
|-----------|---------|---------|--------|
| 1 | Feature 1: Chat Widget | Mittel (3-4h) | Sehr hoch |
| 2 | Feature 2: Contact Form Enhancement | Niedrig (1-2h) | Hoch |
| 3 | Feature 5: Skill Explorer | Niedrig (2h) | Mittel |
| 4 | Feature 3: Project Deep Dive | Mittel (2-3h) | Mittel |
| 5 | Feature 4: Pitch Generator `/pitch` | Mittel (3h) | Hoch (B2B) |

---

## Environment Variables

Folgende Variablen müssen in `.env.local` (lokal) und im Vercel-Dashboard gesetzt werden:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Kein weiterer Secret nötig. Kein DB-Schema. Kein Auth.

---

## Nicht im Scope

- Persistierung von Chat-Verläufen (kein DB, kein localStorage)
- Analytics der AI-Nutzung (ausser was Vercel/Anthropic nativ anbietet)
- Mehrsprachige UI (Site bleibt Englisch; AI antwortet aber dynamisch auf DE/EN je nach User-Input)
- Admin-Interface zum Anpassen der System-Prompts (Prompts sind hardcoded im Route Handler)
