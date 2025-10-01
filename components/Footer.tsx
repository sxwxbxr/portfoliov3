import Link from "next/link"
import { Mail, MapPin, Linkedin, Github } from "lucide-react"
import { SiGithub, SiLinkedin } from "react-icons/si"

const quickLinks = [
  { name: "Projects", href: "/projects" },
  { name: "Case Studies", href: "/case-studies" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
]

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "info@sweber.dev",
    href: "mailto:info@sweber.dev",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "St. Gallen, Switzerland",
  },
]

const socialLinks = [
  {
    icon: SiLinkedin,
    label: "LinkedIn",
    href: "https://ch.linkedin.com/in/seya-weber-06a592256",
  },
  {
    icon: SiGithub,
    label: "GitHub",
    href: "https://github.com/sxwxbxr",
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link
              href="/contact"
              className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              Let&apos;s build your next project
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md">
              From clinical software migrations to automation and energy optimisation programs, I partner with teams to deliver
              measurable outcomes. Reach out and let&apos;s scope what success looks like for you.
            </p>
            <div className="mt-6 flex flex-col gap-4">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <item.icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.href ? (
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.value}
                  </Link>
                    ) : (
                      <p>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Social</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Seya Weber. Built with care in Switzerland.
          </p>
        </div>
      </div>
    </footer>
  )
}
