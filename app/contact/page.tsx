import PageLayout, { Section } from "../../components/PageLayout"
import { ContactForm } from "../../components/ContactForm"
import { getSiteSettings } from "@/lib/data"

export const revalidate = 60

export default async function Contact() {
  const settings = await getSiteSettings()
  const email = settings.contactEmail || "info@sweber.dev"
  const phone = settings.contactPhone
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : ""
  const location = settings.contactLocation || "St. Gallen, Switzerland"

  return (
    <PageLayout
      title="Get in touch"
      subtitle="Have a project in mind or want to discuss an opportunity? I'd love to hear from you."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16">
            {/* Left -- contact info */}
            <Section>
              <div className="space-y-8">
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="link-underline text-primary font-medium"
                  >
                    {email}
                  </a>
                </div>
                {phone && (
                  <div>
                    <p className="font-mono text-xs text-muted-foreground mb-2">Phone</p>
                    <a
                      href={phoneHref}
                      className="link-underline text-foreground"
                    >
                      {phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Location</p>
                  <p>{location}</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Response time</p>
                  <p className="text-muted-foreground">Within 24 hours</p>
                </div>

                {(settings.githubUrl || settings.linkedinUrl) && (
                  <div className="pt-4 border-t border-border">
                    <p className="font-mono text-xs text-muted-foreground mb-3">Connect</p>
                    <div className="flex items-center gap-4">
                      {settings.githubUrl && (
                        <a
                          href={settings.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                        >
                          GitHub
                        </a>
                      )}
                      {settings.linkedinUrl && (
                        <a
                          href={settings.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Right -- form */}
            <Section delay={0.1}>
              <div className="glass rounded-xl p-6 md:p-8">
                <ContactForm />
              </div>
            </Section>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
