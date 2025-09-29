const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Case Studies", href: "/case-studies" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Education", href: "/education" },
  { name: "Skills", href: "/skills" },
  { name: "Contact", href: "/contact" },
]

const projects = [
  {
    title: "Medical Database Migration — France & Belgium",
    shortDescription:
      "Led the end-to-end migration of a large medical database across France and Belgium with GDPR compliance and zero downtime.",
    description:
      "Planned and delivered a phased migration for a multi-country clinical database while coordinating GDPR reviews and stakeholder alignment. Automated validation and rollback steps kept clinicians online the entire time and preserved data fidelity. The engagement produced reusable templates that now guide future migrations across the network.",
    image: "/medical-data-dashboard.png",
    tags: ["C#", ".NET", "MSSQL", "Data Migration", "GDPR"],
    slug: "medical-db-migration-fr-be",
    github: "#",
    demo: "#",
  },
  {
    title: "Patient Questionnaire Automation",
    shortDescription:
      "Implemented questionnaire automation to reduce manual admin and standardize patient data collection.",
    description:
      "Built a rules-driven automation layer that generates digital questionnaires from standardized templates and validates responses in real time. Collaborated with clinical teams to smooth adoption and cut preparation work by more than half. The result delivers consistent intake data to downstream systems and frees staff for higher-value patient interactions.",
    image: "/testing-automation-interface.png",
    tags: [".NET", "Automation", "Templates"],
    slug: "questionnaire-automation",
    github: "#",
    demo: "#",
  },
  {
    title: "Energy Optimization Portfolio — Swiss Bank",
    shortDescription:
      "Managed energy optimization across 150+ properties, unlocking 10–20% efficiency gains and measurable savings.",
    description:
      "Oversaw monitoring and reporting for a Swiss banking property portfolio spanning more than 150 locations to uncover actionable efficiency opportunities. Partnered with facility teams to prioritize quick-win measures that minimized disruption while improving energy performance. Transparent dashboards kept stakeholders aligned and laid the groundwork for ongoing optimization.",
    image: "/energy-optimization.png",
    tags: ["Energy", "Monitoring", "Reporting", "Facility Management"],
    slug: "energy-optimization-cs",
    github: "#",
    demo: "#",
  },
  {
    title: "Luxury Villa Electrical Planning",
    shortDescription:
      "Delivered end-to-end electrical planning for a complex Swiss villa while coordinating multiple subsystems.",
    description:
      "Produced comprehensive electrical schematics that unified lighting, security, HVAC, and specialty systems into a cohesive plan. Coordinated suppliers and subcontractors to keep installations on schedule and ensure seamless handover. On-site validation minimized rework and gave the client confidence in long-term reliability.",
    image: "/villa-project.png",
    tags: ["Electrical", "Planning", "Project Management"],
    slug: "villa-project",
    github: "#",
    demo: "#",
  },
  {
    title: "MultiScreenKiosk Application",
    shortDescription:
      "Created a PyQt6 kiosk app that arranges multiple applications in a customizable 2×2 grid for event displays.",
    description:
      "MultiScreenKiosk makes it easy to pin local applications or browser windows into a configurable 2×2 grid on a single monitor. I built the desktop UI with PyQt6, adding fast shortcuts, layout presets, and logging so operators can react quickly during live events. The project is open source, giving venues a lightweight alternative to complex digital signage suites.",
    image: "/multi-screen-kiosk.png",
    tags: ["Kiosk", "UI/UX", "Web Development", "Python", "PyQt6", "Open Source", "Logging"],
    slug: "multi-screen-kiosk",
    github: "https://github.com/sxwxbxr/MultiScreenKiosk",
    demo: "#",
  },
  {
    title: "CashTrack Application",
    shortDescription:
      "Built an offline-first personal finance tracker with Next.js and SQLite for quick budgeting on any network.",
    description:
      "CashTrack offers an intuitive interface for capturing income, expenses, and budgets without relying on the cloud. I combined Next.js, React, SQLite, and iron-session to store data locally while enabling optional syncing across devices on the same network. Users can categorize transactions, monitor budgets, and explore charts that reveal spending trends—all from an open-source codebase.",
    image: "/cashtrack.png",
    tags: ["Finance", "Next.js", "React", "SQLite", "Open Source"],
    slug: "cashtrack",
    github: "https://github.com/sxwxbxr/CashTrack",
    demo: "#",
  },
  {
    title: "SchulzMedia SaaS Solution",
    shortDescription:
      "Developed a SaaS platform for companies to implement a customizable AI Whatsapp chatbot for customer inquiries.",
    description:
      "SchulzMedia provides businesses with an AI-powered WhatsApp chatbot that can be tailored to handle customer inquiries efficiently. I led the development of the platform using Next.js, React, Clerk for authentication, Stripe for billing, Fastify for the backend, and Supabase for data storage. The solution enables companies to enhance customer engagement and streamline support processes through intelligent automation.",
    image: "/schulzmedia.png",
    tags: ["SaaS", "AI", "Chatbot", "WhatsApp", "Next.js", "React", "Clerk", "Stripe", "Fastify", "Supabase"],
    slug: "schulzmedia",
    github: "#",
    demo: "#",
  },
]

const blogPosts = [
  {
    id: "healthcare-transformation-lessons",
    title: "Digital Transformation in Healthcare: Lessons from the Field",
    excerpt:
      "Migrating sensitive clinical data at scale taught me what truly matters: people, process, and privacy.",
    publishedAt: "2024-01-15",
    readTime: "6 min read",
    author: "Seya Weber",
    tags: ["Healthcare", "Data Migration", "GDPR"],
    image: "/abstract-geometric-shapes.png",
    content: `
# Digital Transformation in Healthcare: Lessons from the Field

When you move mission-critical clinical data across borders, technology is only half the story. The other half is trust, workflow fit, and governance.

## The Challenge
- Highly regulated data (GDPR) with zero tolerance for loss or downtime
- Heterogeneous legacy systems and fragmented data ownership
- Clinical staff under time pressure and skeptical of change

## What Worked
1. **Stakeholder workshops** to map real workflows before writing code.
2. **Phased cutovers** with parallel runs and rollback plans.
3. **Auditability by default** with clear logs and access trails.
4. **Test data parity** checks before, during, and after migration.
5. **On-site champions** who could translate clinical needs into actionable tickets.

## Outcomes
- Successful large-scale migration in France and Belgium
- Standardized templates and automation to reduce manual entry
- A roadmap for continuous improvements beyond go-live
`,
  },
  {
    id: "from-electrical-to-software",
    title: "From Electrical Planner to Software Developer: What Helped Most",
    excerpt:
      "Switching fields is less about starting over and more about transferring habits.",
    publishedAt: "2024-02-10",
    readTime: "4 min read",
    author: "Seya Weber",
    tags: ["Career", "Software Development", "Learning"],
    image: "/abstract-geometric-shapes.png",
    content: `
# From Electrical Planner to Software Developer: What Helped Most

## Transferable Skills
- **Systems thinking** from electrical planning translated well to architecture and integration.
- **Documentation discipline** improved code reviews and onboarding.
- **Project pragmatism** kept scope realistic and delivery predictable.

## Practical Tips
- Pair learning with a real project (migration, automation, or an internal tool).
- Use code templates and checklists to standardize repetitive tasks.
- Track measurable outcomes (downtime avoided, minutes saved per workflow).

## Closing Thought
The tools change. The habits scale.
`,
  },
]

const caseStudies = [
  {
    slug: "medical-db-migration-fr-be",
    title: "Healthcare Data Migration Platform",
    client: "INNOFORCE Est.",
    industry: "Healthcare",
    duration: "Nov 2023 – Mar 2024",
    team: "1 developer (project lead) with cross-team support",
    challenge:
      "Migrate a large clinical database while maintaining full GDPR compliance, data integrity, and uninterrupted access for clinicians.",
    solution:
      "Designed and executed a phased migration plan with automated validation, audit logging, and contingency rollbacks. Coordinated with clinical stakeholders to minimize disruption.",
    results: [
      "Successful migration in France and Belgium",
      "Zero unplanned downtime during cutover windows",
      "Data integrity verified with automated parity checks",
      "GDPR compliance maintained with audit trails and access controls",
    ],
    technologies: ["C#", ".NET", "MSSQL", "ETL", "Docker"],
    image: "/case-study-healthcare.jpg",
    testimonial: {
      quote:
        "The migration was seamless for our staff and improved the consistency of our data. We could trust the system at every step.",
      author: "IT Director",
      company: "Healthcare Network",
    },
  },
  {
    slug: "questionnaire-automation",
    title: "Patient Questionnaire Automation",
    client: "INNOFORCE Est.",
    industry: "Healthcare",
    duration: "Apr 2024 – Jul 2024",
    team: "1 developer working with clinical operations",
    challenge:
      "Manual patient intake questionnaires varied by location, produced inconsistent data, and required significant administrative follow-up.",
    solution:
      "Implemented a rules-driven automation layer that generated questionnaires from standardized templates, integrated validation, and synchronized responses with downstream systems.",
    results: [
      "Consistent digital questionnaires across all supported clinics",
      "Administrative preparation time reduced by more than half",
      "Structured data available immediately for downstream workflows",
    ],
    technologies: [".NET", "Automation", "Templates"],
    image: "/testing-automation-interface.png",
    testimonial: {
      quote:
        "Automation freed our team from repetitive paperwork and gave physicians better information before each visit.",
      author: "Clinical Operations Lead",
      company: "Healthcare Network",
    },
  },
  {
    slug: "energy-optimization-cs",
    title: "Energy Efficiency Program for Swiss Bank Portfolio",
    client: "Credit Suisse (portfolio management)",
    industry: "Real Estate / Facility Management",
    duration: "Jun 2021 – Dec 2021",
    team: "1 planner, cross-functional partners",
    challenge:
      "Reduce energy consumption across a diverse portfolio without major capex and with minimal operational disruption.",
    solution:
      "Introduced monitoring, reporting, and targeted optimizations; coordinated with facility teams to implement quick-win measures first.",
    results: [
      "Approx. 10–20% efficiency gains across managed properties",
      "Transparent reporting to stakeholders with actionable insights",
      "Foundation for continuous improvement beyond the initial phase",
    ],
    technologies: ["Energy Monitoring", "Reporting", "Process Optimization"],
    image: "/case-study-energy.jpg",
    testimonial: {
      quote:
        "Clear reporting and practical measures delivered tangible savings without slowing operations.",
      author: "Facility Program Lead",
      company: "Credit Suisse",
    },
  },
  {
    slug: "villa-project",
    title: "Luxury Villa Electrical Planning and Delivery",
    client: "Private",
    industry: "Residential Construction",
    duration: "Jan 2022 – Apr 2022",
    team: "1 planner coordinating subcontractors",
    challenge:
      "Integrate complex subsystems (lighting, security, HVAC) into a cohesive and reliable electrical plan on a tight schedule.",
    solution:
      "Produced a detailed plan set, coordinated suppliers, and validated on-site installations to de-risk handover.",
    results: [
      "On-time delivery with high client satisfaction",
      "Reliable operation and reduced rework",
    ],
    technologies: ["Electrical Planning", "Documentation", "On-site QA"],
    image: "/case-study-villa.jpg",
    testimonial: {
      quote:
        "The project ran smoothly from planning to handover thanks to clear coordination and documentation.",
      author: "Project Owner",
      company: "Private",
    },
  },
]

export {
  navLinks,
  projects,
  blogPosts,
  caseStudies,
}
