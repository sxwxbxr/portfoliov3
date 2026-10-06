---
title: "The withdrawal button (§ 356a BGB): what the law asks for, and how to build it"
excerpt: "Since 19 June 2026 every online shop selling to consumers in Germany needs a two-step withdrawal function. The requirements in plain language, the mistakes that make a button non-compliant, and a working implementation."
date: 2026-10-06
author: Seya Weber
type: tutorial
packages: [inverse]
tags: [Widerrufsbutton, § 356a BGB, Kündigungsbutton, Consumer law, Compliance, Next.js, Tutorial]
---

If you run an online shop, a SaaS product or a booking app for consumers in Germany, you have had a new item on your list since 19 June 2026: a **withdrawal button**. It comes from EU directive 2023/2673 (a new Article 11a in the Consumer Rights Directive) and Germany implemented it as § 356a BGB.

Most articles about it are written for shop owners. This one is written for the person who has to build it. It lists what the law asks for, where implementations usually go wrong, and ends with working code. It is not legal advice: for your own case, ask a lawyer or your trade association.

## What the law asks for

The statute is short. Reduced to what affects the implementation:

1. **A function labelled "Vertrag widerrufen"** or an equivalent, unambiguous wording, for every contract concluded through an online interface (a website or an app).
2. **Available for the whole withdrawal period** and, in the wording of the directive, prominent and easy to access. In practice: a link in the footer of every page, not buried in the terms.
3. **No login required.** The consumer may not have an account, or may have lost the password.
4. **Two steps.** The first step collects the declaration: who is withdrawing, from which contract, and an electronic address for the acknowledgement. The second step is a button labelled **"Widerruf bestätigen"** (or equivalent) that actually submits it.
5. **An acknowledgement of receipt without delay on a durable medium** (in practice: e-mail), containing the content of the declaration and the **date and time** it was received.
6. **In time if used in time.** A withdrawal submitted through the function before the period ends is in time, whatever happens afterwards.

The 14-day withdrawal period itself did not change. Neither did the way it is calculated, which matters more than it seems (see below).

## The mistakes that make a button non-compliant

We went through the requirements and the first generation of shop pages, and the same problems come up again and again.

**The label is creative.** "Widerrufen", "Retoure starten" or "Rückgabe" are not the same as "Vertrag widerrufen". A returns portal is a different function: returning goods and withdrawing from a contract are legally different things. The two button labels are the one place where you should not be clever.

**The link leads to a login page.** If the consumer has to sign in to the customer area first, the function is not accessible without login. Guest checkouts are the obvious case. Offer a login-free form and, if you like, prefill the order number from the link in your order e-mail.

**One click withdraws, or three clicks are needed.** The directive describes exactly two steps. A single click without a review step risks accidental withdrawals; a wizard with extra pages makes the function harder to use than the statute allows.

**The time of receipt comes from the browser.** The date and time in the acknowledgement are the trader's evidence. If you copy them from the client, they can be wrong or manipulated. Set `receivedAt` on the server, in one place, and nowhere else.

**The acknowledgement is just "thanks".** It has to contain the content of the declaration (who, which contract, what was declared) and the date and time of receipt. Consumers should be able to keep it as proof.

**Rejecting declarations with an unknown order number.** A withdrawal with a typo in the order number is still a declaration you received. Validate the format of the fields, not whether the number exists, and sort out the assignment yourself afterwards.

**Wrong deadline arithmetic.** The period starts the day after the event (§ 187 BGB), and when it ends on a Saturday, Sunday or public holiday it moves to the next working day (§ 193 BGB). If you were not properly informed about the right of withdrawal, the period is extended by up to 12 months. If you show "withdraw by …" in the customer area, calculate it the same way.

## A related rule: the cancellation button

German subscription businesses have had to offer a cancellation button ("Verträge hier kündigen", § 312k BGB) since 1 July 2022. In July 2026 the Federal Court of Justice (BGH, I ZR 200/25) made one point very clear: the confirmation page of the cancellation flow must be focused on submitting the cancellation. Offers to keep the customer, such as a discount or a pause, do not belong on that page. Win-back is allowed, but outside the cancellation flow, for example in the follow-up e-mail.

If you implement one function, it is worth implementing both with the same building blocks.

## Implementation: the minimum that works

You need three things: a form with two steps, an endpoint, and an acknowledgement e-mail. This is the core of the endpoint in plain TypeScript with the Fetch API, which runs in Next.js route handlers, Remix, Hono and SvelteKit:

```ts
// POST /api/withdrawal
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const contractRef = String(body?.contractRef ?? "").trim();
  const email = String(body?.email ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Name is required";
  if (contractRef.length < 1) errors.contractRef = "Contract or order number is required";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "A valid e-mail address is required";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  // The server sets the time of receipt. Never trust the client.
  const receivedAt = new Date();

  await db.withdrawal.create({ data: { name, contractRef, email, receivedAt } });

  await mailer.send({
    to: email,
    subject: "Eingangsbestätigung Ihres Widerrufs",
    text: [
      `Wir haben Ihren Widerruf erhalten.`,
      ``,
      `Name: ${name}`,
      `Vertrag / Bestellung: ${contractRef}`,
      `Eingegangen am: ${receivedAt.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
    ].join("\n"),
  });

  return Response.json({ ok: true, receivedAt: receivedAt.toISOString() });
}
```

Three details are easy to get wrong in this sketch, so decide on them deliberately:

- **Store first, mail second.** If the e-mail provider is down, you still have the declaration and can send the acknowledgement later. If you send first and the database write fails, the consumer holds a confirmation for a declaration you do not have.
- **Time zone.** Show the receipt time in the time zone of your customers, but store it in UTC.
- **Rate limiting and double submits.** A public, login-free endpoint will be hit by bots and by people who double-click. Add a rate limit and treat two identical submissions within a few seconds as one, otherwise you send two acknowledgements.

On the page, build the two steps as one form with a review state: step one collects the fields and has a button "Weiter" (or similar); step two shows the entered data and a single button, **"Widerruf bestätigen"**. Link to the page from the footer with the text **"Vertrag widerrufen"**, on every page where a contract can be concluded.

And the deadline, as a pure function you can test:

```ts
function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function withdrawalDeadline(start: string, isHoliday: (iso: string) => boolean = () => false): string {
  let end = addDays(start, 14); // the day of the event does not count (§ 187 BGB)
  for (;;) {
    const weekday = new Date(`${end}T12:00:00Z`).getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (weekday !== 0 && weekday !== 6 && !isHoliday(end)) return end; // § 193 BGB
    end = addDays(end, 1);
  }
}

withdrawalDeadline("2026-10-03"); // "2026-10-19": 17 October is a Saturday, so it moves to Monday
```

Pass a holiday function that knows the public holidays of the state your business is in.

## Testing it like a visitor

The most common failure is not in the endpoint but on the page: the link is missing on the checkout page, hidden behind a login, or labelled differently on mobile. Check the rendered HTML of your live pages the way a logged-out visitor sees them:

```sh
npx @sweberdev/inverse check https://shop.example.com --kind both
```

The command loads each page without cookies, looks at every link, button and `role="button"` element, and reports missing or mislabelled controls. It exits with a non-zero code when something fails, so you can add it to CI and block a deployment that removes the footer link. A button that is only rendered in the browser after hydration is not seen, because the check reads the HTML the server sends.

## Or use a package for the boring parts

If you would rather not maintain validation, receipts in several languages and deadline arithmetic yourself, [Inverse](https://packages.sweber.dev/inverse) packages exactly what is described above. It is MIT-licensed, has no backend and no tracking, and you keep your own database and e-mail provider:

```ts
// app/api/inverse/route.ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company: { name: "Acme GmbH", email: "hallo@acme.de" },
  onDeclaration: (record) => db.declaration.create({ data: record }),
  sendReceipt: (receipt) => mailer.send(receipt),
});
```

```tsx
<InverseLink kind="withdrawal" href="/widerruf" />     {/* Vertrag widerrufen */}
<WithdrawalForm endpoint="/api/inverse" />
```

The handler validates the fields the law asks for, sets the time of receipt on the server, stores the record through your callback and sends the acknowledgement in German, English, French, Italian, Dutch, Spanish or Polish. For sites without React there is a framework-free form and a single `<script>` tag for WordPress, Shopify or static pages. Try the [live demo](https://packages.sweber.dev/inverse/demo) or read the [docs](https://packages.sweber.dev/inverse/docs).

A paid add-on, Inverse Pro, covers what agencies and larger operators need on top: a tamper-evident log of declarations, a site-wide audit with a report for clients and a weekly digest of open cases.

## A checklist to take away

- The footer link on every page reads "Vertrag widerrufen" (and "Verträge hier kündigen" if you sell subscriptions).
- The form works without login and has exactly two steps; the second button reads "Widerruf bestätigen".
- The server sets the time of receipt; the declaration is stored before the e-mail is sent.
- The acknowledgement contains the content of the declaration, the date and the time.
- The deadline follows §§ 187, 188 and 193 BGB.
- The cancellation confirmation page contains nothing but the cancellation.
- A CI check fails when the link disappears.
- Your withdrawal information (Widerrufsbelehrung) mentions the new function.

*This article is software documentation, not legal advice. Check your case with a lawyer.*
