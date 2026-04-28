import { certificates } from "@/lib/schema"
import { formatMonth } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"

export type Certificate = InferSelectModel<typeof certificates>

const STATUS_META: Record<
  string,
  { label: string; tone: string; dot: string }
> = {
  completed: {
    label: "Completed",
    tone: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary",
  },
  "in-progress": {
    label: "In Progress",
    tone: "bg-foreground/5 text-foreground border-foreground/20",
    dot: "bg-foreground/80",
  },
  planned: {
    label: "Planned",
    tone: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/60",
  },
}

export default function CertificateCard({ cert }: { cert: Certificate }) {
  const status = STATUS_META[cert.status] ?? STATUS_META.planned
  const isLifetime =
    cert.status === "completed" && Boolean(cert.issueDate) && !cert.expiryDate
  const accent = cert.accentColor || undefined

  return (
    <article className="relative glass rounded-xl p-7 flex flex-col h-full overflow-hidden">
      <span
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: accent ?? "var(--primary)" }}
        aria-hidden="true"
      />

      <header className="flex items-start justify-between gap-3 mb-4">
        <span
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-[0.18em] ${status.tone}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
            aria-hidden="true"
          />
          {status.label}
        </span>
        {isLifetime && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-1">
            ∞ Lifetime
          </span>
        )}
      </header>

      <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
        {cert.name}
      </h3>
      {cert.fullTitle && (
        <p className="mt-1 text-sm text-muted-foreground leading-snug">
          {cert.fullTitle}
        </p>
      )}
      {(cert.provider || cert.category) && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {[cert.provider, cert.category].filter(Boolean).join(" · ")}
        </p>
      )}

      {(cert.estimatedHours > 0 ||
        cert.estimatedCost ||
        cert.difficulty > 0 ||
        cert.plannedStart) && (
        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-border">
          {cert.plannedStart && (
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Window
              </dt>
              <dd className="font-display text-sm font-semibold mt-1">
                {formatMonth(cert.plannedStart)}
                {cert.plannedEnd ? ` -- ${formatMonth(cert.plannedEnd)}` : ""}
              </dd>
            </div>
          )}
          {cert.estimatedHours > 0 && (
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Hours
              </dt>
              <dd className="font-display text-sm font-semibold mt-1">
                ~{cert.estimatedHours}h
              </dd>
            </div>
          )}
          {cert.estimatedCost && (
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Cost
              </dt>
              <dd className="font-display text-sm font-semibold mt-1">
                {cert.estimatedCost}
              </dd>
            </div>
          )}
          {cert.difficulty > 0 && (
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Difficulty
              </dt>
              <dd
                className="font-display text-sm font-semibold mt-1"
                aria-label={`${cert.difficulty} out of 5`}
              >
                <span className="text-primary">
                  {"★".repeat(cert.difficulty)}
                </span>
                <span className="text-muted-foreground/40">
                  {"★".repeat(5 - cert.difficulty)}
                </span>
              </dd>
            </div>
          )}
        </dl>
      )}

      {cert.description && (
        <p className="mt-5 text-sm text-foreground/85 leading-relaxed">
          {cert.description}
        </p>
      )}

      {cert.skills.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {cert.skills.map((skill) => (
            <li
              key={skill}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground border border-border rounded-full px-2.5 py-0.5"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {cert.whyPoints.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Why it matters
          </p>
          <ul className="space-y-1.5">
            {cert.whyPoints.map((point) => (
              <li
                key={point}
                className="relative pl-4 text-sm text-foreground/85 leading-relaxed"
              >
                <span
                  className="absolute left-0 top-[0.55rem] w-2 h-px bg-primary"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-6">
        {cert.credentialUrl ? (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-slide text-sm text-primary font-medium"
          >
            View credential &rarr;
          </a>
        ) : cert.issueDate ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Issued {formatMonth(cert.issueDate)}
          </p>
        ) : null}
      </div>
    </article>
  )
}
