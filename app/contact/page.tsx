import { Github, Linkedin, Mail, MapPin, Phone, Clock } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { ContactForm } from "../../components/ContactForm"
import { getSiteSettings } from "@/lib/data"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export default async function Contact() {
  const settings = await getSiteSettings()
  const email = settings.contactEmail || "info@sweber.dev"
  const phone = settings.contactPhone
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : ""
  const location = settings.contactLocation || copy.common.locationFallback
  const privacyAvailable = Boolean(settings.privacyContent.trim())

  return (
    <PageLayout
      label={copy.contact.label}
      title={copy.contact.title}
      subtitle={copy.contact.subtitle}
    >
      <section className="sheet pb-24 md:pb-32">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr]">
          {/* Left — the facts, seated in a channel */}
          <Section>
            <div className="well flex flex-col gap-2 p-3 md:p-4">
              <a
                href={`mailto:${email}`}
                className="cast-sm group flex items-center gap-3.5 px-4 py-3.5"
              >
                <Mail className="h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="annotate">{copy.contact.email}</span>
                  <span className="text-sm font-medium transition-colors duration-150 group-hover:text-signal">
                    {email}
                  </span>
                </span>
              </a>

              {phone && (
                <a
                  href={phoneHref}
                  className="cast-sm group flex items-center gap-3.5 px-4 py-3.5"
                >
                  <Phone className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  <span className="flex flex-col gap-0.5">
                    <span className="annotate">{copy.contact.phone}</span>
                    <span className="text-sm font-medium transition-colors duration-150 group-hover:text-signal">
                      {phone}
                    </span>
                  </span>
                </a>
              )}

              <div className="flex items-center gap-3.5 px-4 py-3.5">
                <MapPin className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="annotate">{copy.contact.location}</span>
                  <span className="text-sm">{location}</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5 px-4 py-3.5">
                <Clock className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="annotate">{copy.contact.responseTime}</span>
                  <span className="text-sm">{copy.contact.responseValue}</span>
                </span>
              </div>

              {(settings.githubUrl || settings.linkedinUrl) && (
                <div className="flex flex-wrap gap-2 px-4 pb-1 pt-2">
                  {settings.githubUrl && (
                    <a
                      href={settings.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
                    >
                      <Github className="h-3.5 w-3.5" aria-hidden="true" />
                      {copy.nav.github}
                    </a>
                  )}
                  {settings.linkedinUrl && (
                    <a
                      href={settings.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
                    >
                      <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                      {copy.nav.linkedin}
                    </a>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Right — the form */}
          <Section delay={0.06}>
            <div className="cast rim p-6 md:p-8">
              <ContactForm privacyAvailable={privacyAvailable} />
            </div>
          </Section>
        </div>
      </section>
    </PageLayout>
  )
}
