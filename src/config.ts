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
    title: "Automation Workflow System",
    description: "Custom automation workflows for business-critical systems at Telsonic",
    image: "/automation-dashboard.png",
    tags: ["C#", ".NET", "Automation", "Workflow"],
    slug: "automation-workflow",
    github: "#",
    demo: "#",
  },
  {
    title: "Medical Data Management",
    description: "Switched the Patient Management System to a new platform",
    image: "/medical-data-dashboard.png",
    tags: ["Database", "Management", "Healthcare"],
    slug: "medical-system",
    github: "#",
    demo: "#",
  },
  {
    title: "Questionnaire Automation",
    description: "Implemented comprehensive questionnaire automation for a patient management system",
    image: "/testing-automation-interface.png",
    tags: [".NET", "Automation", "Templates"],
    slug: "questionnaire-automation",
    github: "#",
    demo: "#",
  },
]

const blogPosts = [
  {
    id: "template-blog-post",
    title: "Template Blog Post #1",
    excerpt:
      "Template Excerpt for a blog post about challenges I faced and conquered",
    content: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel urna vitae erat aliquet varius. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.

Curabitur at sapien ac massa gravida posuere. Nulla facilisi. Sed euismod, velit sed imperdiet sollicitudin, velit dui fermentum elit, vitae pretium lorem velit id nisi. Phasellus eget diam sit amet velit congue viverra.

Praesent id dolor in metus dictum luctus. Quisque euismod felis a massa porttitor, at dapibus erat tincidunt. Aliquam erat volutpat. Donec at nunc in arcu vehicula convallis sit amet ut velit.
    `,
    author: "Seya Weber",
    publishedAt: "2025-08-25",
    readTime: "8 min read",
    tags: ["Template", "Digital Transformation", "Data Management"],
    image: "/blog-healthcare-transformation.jpg",
  }
]

const caseStudies = [
  {
    id: "motocom-app",
    title: "Motocom App Development",
    client: "Motocom",
    industry: "Transportation",
    duration: "6 months",
    team: "2 developers, 1 PM",
    challenge:
      "Developing a community oriented app for motorcycle enthusiasts",
    solution:
      "Creating a mobile app with social features, event management, and ride tracking.",
    results: [
      "In early stages of development"
    ],
    technologies: ["Python", "Typescript", "Docker", "Kubernetes", "JavaScript"],
    image: "/case-study-telsonic.jpg",
    testimonial: {
      quote:
        "The app has brought together a community of motorcycle enthusiasts like never before.",
      author: "An Enthusiast",
      company: "Motocom",
    },
  },
  {
    id: "healthcare-data-sync",
    title: "Medical Data Synchronization Platform",
    client: "Healthcare Network France",
    industry: "Healthcare",
    duration: "8 months",
    team: "4 developers, 2 PMs, 1 compliance officer",
    challenge:
      "A healthcare network needed to synchronize patient data across multiple locations in France while maintaining strict GDPR compliance and ensuring data integrity.",
    solution:
      "Developed a secure, real-time data synchronization platform with automated conflict resolution, audit trails, and comprehensive security measures.",
    results: [
      "95% improvement in data accuracy",
      "60% reduction in manual data entry",
      "100% GDPR compliance maintained",
      "Zero data security incidents",
    ],
    technologies: ["C#", "PostgreSQL", "Redis", "Docker", "Azure Service Bus"],
    image: "/case-study-healthcare.jpg",
    testimonial: {
      quote:
        "This system revolutionized how we manage patient data across our network. The synchronization is seamless and secure.",
      author: "IT Director",
      company: "Healthcare Network France",
    },
  },
]
export {
  navLinks,
  projects,
  blogPosts,
  caseStudies,
}
