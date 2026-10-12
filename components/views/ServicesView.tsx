import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { FaqList } from "@/components/site/FaqList"
import { JsonLd } from "@/components/JsonLd"
import { getCopy, localizePath, type Locale } from "@/lib/i18n"
import { pkgUrl } from "@/lib/packages/urls"
import {
  FURTHER_READING,
  getService,
  servicePath,
  servicesLabels,
  servicesOverview,
  type ServiceKey,
} from "@/lib/services"
import { breadcrumbList, faqPage, itemList, serviceSchema } from "@/lib/structured-data"

const num = (n: number) => String(n).padStart(2, "0")

function UpdatedAt({ date, label, locale }: { date: string; label: string; locale: Locale }) {
  const shown = new Date(`${date}T12:00:00Z`).toLocaleDateString(getCopy(locale).common.dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  return (
    <p className="annotate">
      {label}: <time dateTime={date}>{shown}</time>
    </p>
  )
}

function ContactLink({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <Link
      href={localizePath("/contact", locale)}
      className="control control-primary inline-flex items-center gap-1 self-start py-2.5 pr-4 pl-5 text-sm"
    >
      {children}
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  )
}

/** /services and /de/leistungen: the three services and how a project starts. */
export function ServicesView({ locale = "en" }: { locale?: Locale }) {
  const copy = getCopy(locale)
  const page = servicesOverview(locale)
  const labels = servicesLabels(locale)
  return (
    <PageLayout label={copy.services.label} title={page.h1}>
      <JsonLd
        data={breadcrumbList(
          [{ name: labels.overviewCrumb, path: localizePath("/services", locale) }],
          locale
        )}
      />
      <JsonLd
        data={itemList(
          page.services.map((s) => ({ name: s.title, path: servicePath(s.key, locale) }))
        )}
      />
      <Section className="sheet flex flex-col gap-6 pb-18 md:pb-24">
        <p className="measure lede">{page.lead}</p>
        <UpdatedAt date={page.updatedAt} label={labels.updated} locale={locale} />
      </Section>

      <Block label={num(1)} title={page.servicesHeading}>
        <div className="grid gap-3 lg:grid-cols-3">
          {page.services.map((service, i) => (
            <Section key={service.key} delay={i * 0.05} className="h-full">
              <article className="cast flex h-full flex-col gap-5 p-6 md:p-7">
                <div className="flex flex-col gap-2">
                  <span className="annotate">{copy.services.packageEyebrow(i + 1)}</span>
                  <h3 className="text-lg tracking-tight">{service.title}</h3>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-fg-muted">{service.text}</p>
                <Link
                  href={servicePath(service.key, locale)}
                  className="control inline-flex items-center gap-1 self-start py-2 pr-3 pl-4 text-sm"
                >
                  {service.linkLabel}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            </Section>
          ))}
        </div>
      </Block>

      <Block label={num(2)} title={page.startHeading} lede={<p>{page.serviceArea}</p>}>
        <ol className="border-t border-edge-soft">
          {page.start.map((step, i) => (
            <li key={step.step} className="flex items-start gap-4 border-b border-edge-soft py-5">
              <span className="annotate mt-0.5 shrink-0">{num(i + 1)}</span>
              <span className="leading-relaxed text-fg-muted">
                <strong className="font-medium text-fg">{step.step}</strong> {step.text}
              </span>
            </li>
          ))}
        </ol>
      </Block>

      <Block
        label={copy.services.startConversation}
        title={page.cta.lead}
        sub={page.cta.text}
        aside={<ContactLink locale={locale}>{copy.services.startConversation}</ContactLink>}
      />
    </PageLayout>
  )
}

/** One service page: /services/<key> and /de/leistungen/<slug>. */
export function ServiceDetailView({ serviceKey, locale = "en" }: { serviceKey: ServiceKey; locale?: Locale }) {
  const copy = getCopy(locale)
  const service = getService(serviceKey, locale)
  const overview = servicesOverview(locale)
  const labels = servicesLabels(locale)
  const path = servicePath(serviceKey, locale)
  const crumbName = overview.services.find((s) => s.key === serviceKey)?.linkLabel ?? service.metaTitle
  const reading = FURTHER_READING[serviceKey]
  const pricing = service.pricing

  let n = 0
  const next = () => num(++n)

  return (
    <PageLayout label={copy.services.label} title={service.h1}>
      <JsonLd
        data={breadcrumbList(
          [
            { name: labels.overviewCrumb, path: localizePath("/services", locale) },
            { name: crumbName, path },
          ],
          locale
        )}
      />
      <JsonLd
        data={serviceSchema(
          { serviceType: crumbName, name: service.h1, description: service.metaDescription, path },
          locale
        )}
      />
      {service.faq.length > 0 && <JsonLd data={faqPage(service.faq, path, locale)} />}

      <Section className="sheet flex flex-col gap-6 pb-18 md:pb-24">
        <p className="measure lede">{service.lead}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ContactLink locale={locale}>{copy.services.startConversation}</ContactLink>
          <UpdatedAt date={service.updatedAt} label={labels.updated} locale={locale} />
        </div>
      </Section>

      <Block label={next()} title={labels.forWhom} lede={<p>{service.forWhomIntro}</p>}>
        <ul className="border-t border-edge-soft">
          {service.forWhom.map((item) => (
            <li key={item} className="border-b border-edge-soft py-4 leading-relaxed text-fg-muted">
              {item}
            </li>
          ))}
        </ul>
        {service.forWhomNote && (
          <p className="measure mt-6 text-sm leading-relaxed text-fg-muted">{service.forWhomNote}</p>
        )}
      </Block>

      <Block label={next()} title={labels.deliverables}>
        <ul className="border-t border-edge-soft">
          {service.deliverables.map((item) => (
            <li key={item} className="border-b border-edge-soft py-4 leading-relaxed text-fg-muted">
              {item}
            </li>
          ))}
        </ul>
      </Block>

      <Block label={next()} title={labels.process}>
        <ol className="border-t border-edge-soft">
          {service.process.map((step, i) => (
            <li key={step.step ?? i} className="flex items-start gap-4 border-b border-edge-soft py-5">
              <span className="annotate mt-0.5 shrink-0">{num(i + 1)}</span>
              <span className="leading-relaxed text-fg-muted">
                {step.step && <strong className="font-medium text-fg">{step.step}</strong>}{" "}
                {step.text}
              </span>
            </li>
          ))}
        </ol>
        {service.processNote && (
          <p className="measure mt-6 text-sm leading-relaxed text-fg-muted">{service.processNote}</p>
        )}
      </Block>

      <Block label={next()} title={labels.pricing} lede={pricing.intro ? <p>{pricing.intro}</p> : undefined}>
        <div className="border-t border-edge-soft">
          {pricing.items.map((item, i) => (
            <p key={i} className="border-b border-edge-soft py-4 leading-relaxed text-fg-muted">
              {item.title && <strong className="font-medium text-fg">{item.title}</strong>}
              {item.title && item.text && !/^[,.;:]/.test(item.text) && " "}
              {item.text}
            </p>
          ))}
        </div>
        {pricing.note && (
          <p className="measure mt-6 text-sm leading-relaxed text-fg-muted">{pricing.note}</p>
        )}
      </Block>

      {service.references.length > 0 && (
        <Block
          label={next()}
          title={labels.references}
          lede={service.referencesNote ? <p>{service.referencesNote}</p> : undefined}
        >
          <ul className="border-t border-edge-soft">
            {service.references.map((ref) => (
              <li key={ref.slug} className="def-grid border-b border-edge-soft py-5">
                <h3 className="text-lg tracking-tight">
                  <Link
                    href={localizePath(`/projects/${ref.slug}`, locale)}
                    className="link-underline hover:text-fg-muted"
                  >
                    {ref.name}
                  </Link>
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">{ref.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {reading.length > 0 && (
        <Block label={next()} title={labels.furtherReading}>
          <ul className="border-t border-edge-soft">
            {reading.map((article) => (
              <li key={article.slug} className="border-b border-edge-soft">
                <a
                  href={pkgUrl(`/blog/${article.slug}`)}
                  lang="de-CH"
                  className="link-underline block py-4 leading-relaxed hover:text-fg-muted"
                >
                  {article.title}
                  {labels.inGerman && <span className="text-fg-muted"> {labels.inGerman}</span>}
                </a>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {service.faq.length > 0 && (
        <Block label={next()} title={labels.faq}>
          <FaqList items={service.faq} />
        </Block>
      )}

      <Block
        label={copy.services.startConversation}
        title={service.cta.lead}
        sub={service.cta.text}
        aside={<ContactLink locale={locale}>{copy.services.startConversation}</ContactLink>}
      />
    </PageLayout>
  )
}
