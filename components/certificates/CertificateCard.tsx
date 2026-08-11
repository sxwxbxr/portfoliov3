import { ArrowUpRight } from "lucide-react"
import { certificates } from "@/lib/schema"
import { formatMonth } from "@/lib/utils"
import { copy } from "@/lib/copy"
import type { InferSelectModel } from "drizzle-orm"

export type Certificate = InferSelectModel<typeof certificates>

/**
 * A certificate as a cast tile.
 *
 * Status is a seated chip rather than a coloured pill: the accent is rationed
 * to the one certificate that is actually in motion, so a page full of planned
 * credentials does not read as a page full of alerts. The inlay along the top
 * edge carries the per-certificate colour from the database when one is set.
 */
const STATUS_META: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  completed: {
    label: copy.education.statusCompleted,
    dot: "bg-fg-muted",
    text: "text-fg-muted",
  },
  "in-progress": {
    label: copy.education.statusInProgress,
    dot: "bg-signal-bright",
    text: "text-signal",
  },
  planned: {
    label: copy.education.statusPlanned,
    dot: "bg-edge",
    text: "",
  },
}

export default function CertificateCard({ cert }: { cert: Certificate }) {
  const status = STATUS_META[cert.status] ?? STATUS_META.planned
  const isLifetime =
    cert.status === "completed" && Boolean(cert.issueDate) && !cert.expiryDate

  // The inlay is the only place a certificate's own colour appears. Without
  // one, in-progress gets the accent and everything else gets a hairline.
  const inlay =
    cert.accentColor ||
    (cert.status === "in-progress" ? "var(--signal)" : "var(--edge-soft)")

  const hasStats =
    cert.estimatedHours > 0 ||
    Boolean(cert.estimatedCost) ||
    cert.difficulty > 0 ||
    Boolean(cert.plannedStart)

  const hasFooter = Boolean(cert.credentialUrl || cert.issueDate)

  return (
    <article className="cast rim relative flex h-full flex-col gap-5 overflow-hidden p-6 md:p-7">
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: inlay }}
        aria-hidden="true"
      />

      <header className="flex flex-wrap items-center gap-2">
        <span className="well-sm inline-flex items-center gap-2 px-2.5 py-1">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`}
            aria-hidden="true"
          />
          <span className={`annotate ${status.text}`}>{status.label}</span>
        </span>
        {isLifetime && (
          <span className="well-sm inline-flex items-center px-2.5 py-1">
            <span className="annotate text-signal">
              &#8734; {copy.education.lifetime}
            </span>
          </span>
        )}
      </header>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          {cert.name}
        </h3>
        {cert.fullTitle && (
          <p className="text-sm leading-snug text-fg-muted">{cert.fullTitle}</p>
        )}
        {(cert.provider || cert.category) && (
          <p className="annotate mt-1">
            {copy.education.certMeta(cert.provider, cert.category)}
          </p>
        )}
      </div>

      {/* Four facts, seated in a recess instead of ruled off by borders. */}
      {hasStats && (
        <dl className="well grid grid-cols-2 gap-2 p-2 sm:grid-cols-4">
          {cert.plannedStart && (
            <div className="cast-sm flex flex-col gap-1 px-3 py-2.5">
              <dt className="annotate">{copy.education.certWindow}</dt>
              <dd className="font-display text-sm font-semibold tabular">
                {copy.education.certWindowValue(
                  formatMonth(cert.plannedStart),
                  cert.plannedEnd ? formatMonth(cert.plannedEnd) : ""
                )}
              </dd>
            </div>
          )}
          {cert.estimatedHours > 0 && (
            <div className="cast-sm flex flex-col gap-1 px-3 py-2.5">
              <dt className="annotate">{copy.education.certHours}</dt>
              <dd className="font-display text-sm font-semibold tabular">
                ~{cert.estimatedHours}h
              </dd>
            </div>
          )}
          {cert.estimatedCost && (
            <div className="cast-sm flex flex-col gap-1 px-3 py-2.5">
              <dt className="annotate">{copy.education.certCost}</dt>
              <dd className="font-display text-sm font-semibold tabular">
                {cert.estimatedCost}
              </dd>
            </div>
          )}
          {cert.difficulty > 0 && (
            <div className="cast-sm flex flex-col gap-1 px-3 py-2.5">
              <dt className="annotate">{copy.education.certDifficulty}</dt>
              <dd
                className="font-display text-sm font-semibold"
                aria-label={copy.education.certDifficultyAria(cert.difficulty)}
              >
                <span className="text-signal">
                  {"★".repeat(cert.difficulty)}
                </span>
                <span className="text-fg-subtle/40">
                  {"★".repeat(5 - cert.difficulty)}
                </span>
              </dd>
            </div>
          )}
        </dl>
      )}

      {cert.description && (
        <p className="measure text-sm leading-relaxed text-fg-muted">
          {cert.description}
        </p>
      )}

      {cert.skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {cert.skills.map((skill) => (
            <li key={skill} className="well-sm annotate px-2.5 py-1 text-fg-muted">
              {skill}
            </li>
          ))}
        </ul>
      )}

      {cert.whyPoints.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="annotate">{copy.education.certWhy}</p>
          <ul className="flex flex-col gap-2">
            {cert.whyPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-2 h-px w-3 shrink-0 bg-edge"
                  aria-hidden="true"
                />
                <span className="leading-relaxed text-fg-muted">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasFooter && (
        <div className="mt-auto flex items-center pt-1">
          {cert.credentialUrl ? (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
            >
              {copy.education.certViewCredential}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <p className="annotate">
              {copy.education.certIssued(formatMonth(cert.issueDate))}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
