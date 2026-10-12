import { notFound } from "next/navigation"

/**
 * With several root layouts and no top-level one, Next cannot render a custom
 * not-found for URLs that match no route. This catch-all matches them and
 * hands over to the not-found boundary of this edition (404 status).
 */
export default function CatchAll() {
  notFound()
}
