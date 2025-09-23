const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Education", href: "/education" },
  { name: "Skills", href: "/skills" },
  { name: "Contact", href: "/contact" },
]

const projects = [
  {
    title: "Medical Database Migration — France & Belgium",
    description: "Led the end-to-end migration of a large medical database in France and Belgium with strict GDPR compliance and zero downtime.",
    image: "/medical-data-dashboard.png",
    tags: ["C#", ".NET", "MSSQL", "Data Migration", "GDPR"],
    slug: "medical-db-migration-fr-be",
    github: "#",
    demo: "#",
  },
  {
    title: "Patient Questionnaire Automation",
    description: "Implemented comprehensive questionnaire automation for a patient management system to reduce manual admin and standardize data collection.",
    image: "/testing-automation-interface.png",
    tags: [".NET", "Automation", "Templates"],
    slug: "questionnaire-automation",
    github: "#",
    demo: "#",
  },
  {
    title: "Energy Optimization Portfolio — Swiss Bank",
    description: "Managed and optimized energy usage across 150+ properties, achieving about 10–20% efficiency improvements and measurable cost savings.",
    image: "/energy-optimization.png",
    tags: ["Energy", "Monitoring", "Reporting", "Facility Management"],
    slug: "energy-optimization-cs",
    github: "#",
    demo: "#",
  },
  {
    title: "Luxury Villa Electrical Planning",
    description: "End-to-end electrical planning and implementation for a complex villa project in Switzerland, coordinating multiple subsystems.",
    image: "/villa-project.png",
    tags: ["Electrical", "Planning", "Project Management"],
    slug: "villa-project",
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
  {
    slug: "multi-screen-kiosk",
    title: "MultiScreenKiosk Application",
    client: "Private",
    industry: "Fair / Events",
    duration: "Aug 2025 - Sep 2025",
    team: "1 developer",
    challenge:
      "Create an interactive kiosk application to visualize multiple applications or browser instances in a 2x2 Grid for Event display purposes.",
    solution:
      "Developed a relatively simple Python solution using PyQt6 to create a 2x2 grid layout, allowing users to easily switch between different applications or browser instances. As well as Live Logs and integrated Task Manager to force embedding of applications.",
    results: [
      "Easy to use and intuitive interface with minimal training required",
      "Reliable operation and good documentation",
    ],
    technologies: ["Python", "PyQt6", "UI/UX Design"],
    image: "/case-study-villa.jpg", // Placeholder image needs to be changed to multiscreenkiosk image
    testimonial: {
      quote:
        "Easy to setup and use, the application worked flawlessly during our events.",
      author: "Tester",
      company: "Private",
    },
  },
  {
    slug: "cashtrack-application",
    title: "CashTrack Application",
    client: "Private",
    industry: "Private Consumer",
    duration: "Sep 2025",
    team: "1 developer",
    challenge:
      "Create an application to track personal finances, visualize spending habits, improve budget planning and generate reports.",
    solution:
      "Developed a modern Next.js and React application with a clean and intuitive user interface. The application allows users to easily input and categorize their expenses, view visualizations of their spending habits, set budget goals, and generate detailed reports. The whole application runs completely local but can be synchronized via an exposed IP and Port with other devices in the same network.",
    results: [
      "Visually appealing and user-friendly interface",
      "Reliable operation and good documentation",
      "Improved budget planning and spending awareness",
      "Data export and report generation capabilities",
      "Multi-device synchronization within the same network",
      "Secure local data storage with optional network sync",
    ],
    technologies: ["Next.js", "React", "UI/UX Design"],
    image: "/case-study-villa.jpg", // Placeholder image needs to be changed to CashTrack image
    testimonial: {
      quote:
        "Easy to setup and use, the application helped me to get a better overview of my finances.",
      author: "Friend of developer",
      company: "N.a.",
    },
  }
  
]

export {
  navLinks,
  projects,
  blogPosts,
  caseStudies,
}
