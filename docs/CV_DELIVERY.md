# CV delivery — specification, not yet built

**Status:** specified, deliberately not implemented.
**Written:** 2026-08-13

## What changed already

Two things are done and live:

1. **The CV download on `/about` is gone.** It had been dead anyway — it pointed
   at `/documents/CV_SeyaWeber.pdf` and `public/documents/` does not exist, so
   the button never rendered. Verified against production: `sweber.dev/about`
   returned 200 with no `.pdf` link. The removal makes that a decision rather
   than an accident.
2. **`applicationDocuments/` is untracked and gitignored.** It held five personal
   PDFs — Arbeitszeugnis, Resume, two Fähigkeitsausweise, Lehrzeugnis — and this
   repository is **public**, so they were anonymously downloadable over
   `raw.githubusercontent.com` (confirmed HTTP 200, no auth). They were never
   referenced by any code and sat outside `public/`, so they served no feature.
   The files are still on disk locally; only Git has stopped following them.

   > **Still open:** removing them from `HEAD` does not remove them from
   > history. The blobs stay reachable by their old commit SHA. Only a history
   > rewrite (`git filter-repo`) plus a force-push removes them from the public
   > repo, and even then forks and crawler caches cannot be recalled. Making the
   > repository private is the alternative that closes anonymous access
   > immediately, including history, without rewriting anything.

## The idea to build

Replace the download with an **opt-in request**: a checkbox on the contact form,
along the lines of "Send me your CV by email". Someone who ticks it gets the CV
attached to the confirmation email for their enquiry.

The reasoning is worth keeping: a CV on a public URL is scraped, indexed and
mirrored, and it carries more personal data than a portfolio page needs to. A CV
that has to be asked for is handed to a person who identified themselves.

## What has to exist first

**There is no confirmation email.** This is the part that makes the feature
bigger than it sounds. `app/api/contact/route.ts` sends exactly one message — to
`CONTACT_RECIPIENT`, with `replyTo` set to the submitter. The submitter receives
nothing at all. So the feature needs a *new outbound email to a third party*,
which is a new behaviour rather than a new attachment on an existing one.

**The file cannot live in this repository.** It is public. Two workable homes:

- **`CV_URL` environment variable** pointing at a Vercel Blob object (the project
  already uses `@vercel/blob` for admin image uploads). The route fetches and
  attaches it. No schema change, no admin surface, and it matches how the SMTP
  configuration is already handled. If the variable is unset the checkbox is not
  rendered at all, so the feature is self-disabling. **This is the lighter option
  and the recommended one.**
- **A `cvUrl` column on `site_settings` plus an upload field in the admin.**
  Nicer to operate, but it means a schema change, `npm run db:push`, and new
  admin UI for a single string.

## Touchpoints when it is built

| File | Change |
|---|---|
| `app/contact/page.tsx` | read `process.env.CV_URL` server-side, pass a boolean prop — do not use `NEXT_PUBLIC_*`, the URL itself should not reach the client |
| `components/ContactForm.tsx` | the checkbox, rendered only when enabled |
| `app/api/contact/route.ts` | `sendCv: z.boolean().optional()` on the zod schema; a second `sendMail` to `data.email` with the fetched PDF attached |
| `lib/copy.ts` | label and confirmation strings under `contact.form` |
| `site_settings.privacyContent` | a line about the confirmation email — admin content, not code |

## Two things to decide before writing it

**The recipient address is unverified.** Anyone can type any address and cause
Seya's CV to be mailed to it. The existing rate limit (3 per 24h per IP and
browser cookie, `app/api/contact/route.ts:21`) bounds the volume, so this is a
nuisance rather than a hole — but it is a real property of the design, not an
oversight to discover later. If that is unacceptable, the alternative is to mail
a short-lived signed link instead of an attachment, which costs a token store.

**Attachment failure must not fail the enquiry.** If fetching the PDF or sending
the confirmation throws, the contact message itself has already been delivered
and the visitor must still see success. Wrap the confirmation independently of
`sendContactEmail` and log rather than propagate.

## Why it is not built yet

Scope: it needs a new outbound email path, a decision on where the file lives,
and a privacy-notice update. Seya asked to record it rather than build it.
