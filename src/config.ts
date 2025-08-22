const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Education", href: "/education" },
  { name: "Skills", href: "/skills" },
  { name: "Contact", href: "/contact" },
  { name: "Hub", href: "/hub" },
  { name: "Admin", href: "/admin" },
  { name: "Login", href: "/login" },
]

const toggles = {
  testimonials: true,
  darkMode: true,
}

const testimonials = [
  {
    name: "John Doe",
    role: "Senior Developer",
    company: "Tech Corp",
    content:
      "Seya's technical expertise and project management skills are exceptional. He consistently delivers high-quality solutions on time.",
    avatar: "/professional-headshot.png",
  },
  {
    name: "Jane Smith",
    role: "Product Manager",
    company: "Innovation Labs",
    content:
      "Working with Seya was a pleasure. His ability to bridge technical and business requirements is outstanding.",
    avatar: "/professional-headshot.png",
  },
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
    title: "Medical Data Synchronization",
    description: "Synchronized medical data across multiple locations in France",
    image: "/medical-data-dashboard.png",
    tags: ["Database", "Synchronization", "Healthcare"],
    slug: "medical-sync",
    github: "#",
    demo: "#",
  },
  {
    title: "Test Automation Templates",
    description: "Implemented comprehensive test automation templates for .NET applications",
    image: "/testing-automation-interface.png",
    tags: ["Testing", ".NET", "Automation", "Templates"],
    slug: "test-automation",
    github: "#",
    demo: "#",
  },
]

const blogPosts = [
  {
    id: "digital-transformation-healthcare",
    title: "Digital Transformation in Healthcare: Lessons from the Field",
    excerpt:
      "Exploring the challenges and opportunities of implementing digital solutions in healthcare environments, based on real-world experience.",
    content: `
# Digital Transformation in Healthcare: Lessons from the Field

Digital transformation in healthcare is not just about implementing new technology—it's about fundamentally changing how healthcare organizations operate, deliver care, and engage with patients.

## The Challenge

During my work on medical data synchronization across multiple locations in France, I encountered several key challenges that are common in healthcare digital transformation:

### Data Silos
Healthcare organizations often have data scattered across multiple systems that don't communicate effectively. This creates inefficiencies and potential safety risks.

### Regulatory Compliance
Healthcare data is highly regulated, requiring careful attention to privacy laws like GDPR and HIPAA, depending on the jurisdiction.

### User Adoption
Healthcare professionals are often resistant to change, especially when new systems might initially slow down their workflow.

## The Solution Approach

### 1. Stakeholder Engagement
Early and continuous engagement with healthcare professionals was crucial. We conducted workshops to understand their daily workflows and pain points.

### 2. Phased Implementation
Rather than a big-bang approach, we implemented the system in phases, allowing users to adapt gradually and providing opportunities for feedback and iteration.

### 3. Robust Testing
Given the critical nature of healthcare data, we implemented comprehensive testing protocols, including automated testing templates that could be reused across different modules.

## Key Takeaways

- **People First**: Technology is only as good as the people using it. Invest heavily in training and change management.
- **Security by Design**: Build security and compliance into the system from the ground up, not as an afterthought.
- **Iterative Approach**: Healthcare environments are complex. Be prepared to iterate and adapt based on real-world usage.

The project ultimately improved data accuracy by 95% and reduced manual data entry time by 60%, demonstrating the tangible benefits of thoughtful digital transformation.
    `,
    author: "Seya Weber",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    tags: ["Healthcare", "Digital Transformation", "Data Management"],
    image: "/blog-healthcare-transformation.jpg",
  },
  {
    id: "automation-best-practices",
    title: "Best Practices for Business Process Automation",
    excerpt:
      "A comprehensive guide to implementing automation workflows that actually improve business outcomes, drawn from enterprise experience.",
    content: `
# Best Practices for Business Process Automation

Business process automation can transform organizations, but only when implemented thoughtfully. Here are the key principles I've learned from implementing automation systems in enterprise environments.

## Start with Process Mapping

Before automating anything, you need to understand your current processes thoroughly.

### Document Current State
- Map out every step in the current process
- Identify bottlenecks and pain points
- Measure current performance metrics

### Identify Automation Opportunities
Not every process should be automated. Look for:
- High-volume, repetitive tasks
- Processes with clear rules and decision points
- Tasks prone to human error

## Design for Flexibility

### Configurable Workflows
Build workflows that can be easily modified without code changes. This allows business users to adapt processes as requirements evolve.

### Exception Handling
Always plan for edge cases and exceptions. Your automation should gracefully handle unexpected scenarios.

## Implementation Strategy

### Pilot Programs
Start with a small, well-defined process. This allows you to:
- Prove value quickly
- Learn and iterate
- Build organizational confidence

### Change Management
- Train users thoroughly
- Provide clear documentation
- Establish support channels

## Measuring Success

### Key Metrics
- Process completion time
- Error rates
- User satisfaction
- Cost savings

### Continuous Improvement
Automation is not a "set it and forget it" solution. Regular monitoring and optimization are essential.

## Common Pitfalls to Avoid

1. **Over-automation**: Don't automate everything just because you can
2. **Ignoring user feedback**: Users often have insights that can improve the system
3. **Inadequate testing**: Thoroughly test all scenarios before going live
4. **Poor documentation**: Document processes and system configurations

The automation workflow system I implemented at Telsonic resulted in a 40% reduction in processing time and 85% fewer manual errors, demonstrating the power of well-planned automation.
    `,
    author: "Seya Weber",
    publishedAt: "2024-02-20",
    readTime: "6 min read",
    tags: ["Automation", "Business Process", "Workflow"],
    image: "/blog-automation-best-practices.jpg",
  },
  {
    id: "testing-automation-frameworks",
    title: "Building Robust Testing Automation Frameworks",
    excerpt:
      "How to create testing frameworks that scale with your applications and actually catch bugs before they reach production.",
    content: `
# Building Robust Testing Automation Frameworks

Testing automation is crucial for maintaining software quality at scale. Here's how to build frameworks that provide real value and catch issues before they impact users.

## Framework Architecture

### Layered Approach
Structure your testing framework in layers:
- **Unit Tests**: Fast, isolated tests for individual components
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

### Maintainable Test Code
Treat test code with the same care as production code:
- Use page object patterns for UI tests
- Create reusable test utilities
- Follow consistent naming conventions

## Test Data Management

### Data Independence
Tests should not depend on specific data states:
- Create test data programmatically
- Clean up after tests
- Use factories for complex object creation

### Environment Consistency
Ensure tests run consistently across environments:
- Use containerization for dependencies
- Mock external services appropriately
- Maintain separate test databases

## Continuous Integration Integration

### Fast Feedback Loops
- Run unit tests on every commit
- Use parallel execution for faster results
- Provide clear failure reporting

### Test Categorization
Organize tests by execution time and importance:
- Smoke tests for critical functionality
- Regression tests for comprehensive coverage
- Performance tests for load validation

## Best Practices

### Reliable Tests
- Avoid flaky tests that pass/fail inconsistently
- Use explicit waits instead of sleep statements
- Handle timing issues gracefully

### Clear Reporting
- Provide detailed failure information
- Include screenshots for UI test failures
- Generate comprehensive test reports

## Implementation Results

The testing automation templates I developed resulted in:
- 90% reduction in manual testing time
- 75% faster bug detection
- 95% test reliability rate

This framework approach ensures that testing automation actually improves software quality rather than just creating maintenance overhead.
    `,
    author: "Seya Weber",
    publishedAt: "2024-03-10",
    readTime: "7 min read",
    tags: ["Testing", "Automation", "Software Quality"],
    image: "/blog-testing-frameworks.jpg",
  },
]

const caseStudies = [
  {
    id: "telsonic-automation",
    title: "Telsonic Automation Workflow System",
    client: "Telsonic AG",
    industry: "Manufacturing",
    duration: "6 months",
    team: "3 developers, 1 PM",
    challenge:
      "Telsonic needed to automate their complex business-critical workflows to improve efficiency and reduce manual errors in their manufacturing processes.",
    solution:
      "Designed and implemented a comprehensive automation workflow system using C# and .NET, featuring configurable workflows, real-time monitoring, and integration with existing systems.",
    results: [
      "40% reduction in process completion time",
      "85% decrease in manual errors",
      "60% improvement in workflow visibility",
      "ROI achieved within 4 months",
    ],
    technologies: ["C#", ".NET Core", "SQL Server", "Azure", "REST APIs"],
    image: "/case-study-telsonic.jpg",
    testimonial: {
      quote:
        "The automation system transformed our operations. What used to take hours now happens in minutes, with far fewer errors.",
      author: "Manufacturing Director",
      company: "Telsonic AG",
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

const ideas = []

const users = [
  {
    id: "1",
    email: "admin@seyaweber.com",
    password: "admin123", // In production, this would be hashed
    role: "admin",
    name: "Seya Weber",
    avatar: "/professional-headshot.png",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    role: "user",
    name: "Demo User",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const newsFeeds = [
  {
    id: "1",
    title: "New Minecraft Server is Live! 🎮",
    content:
      "Just set up our new modded Minecraft server with Create mod and some tech mods. Server IP and modpack details in the files section. Let's build something epic together!",
    author: "Seya Weber",
    timestamp: "2024-01-20T10:30:00Z",
    likes: 8,
    comments: 12,
    image: "/minecraft-server-spawn.jpg",
  },
  {
    id: "2",
    title: "LAN Party Planning - February 3rd Weekend",
    content:
      "Planning our next LAN party for February 3rd weekend at my place. Thinking CS2, Age of Empires 2, and maybe some co-op games. Who's in? Drop a comment below!",
    author: "Seya Weber",
    timestamp: "2024-01-18T14:15:00Z",
    likes: 15,
    comments: 8,
  },
  {
    id: "3",
    title: "Game Night Results: Among Us Tournament",
    content:
      "What a night! Congrats to Alex for winning our Among Us tournament. The final round was intense - 3 impostors vs 4 crewmates. Next week: Jackbox Games!",
    author: "Seya Weber",
    timestamp: "2024-01-15T09:45:00Z",
    likes: 12,
    comments: 6,
    image: "/among-us-tournament.jpg",
  },
  {
    id: "4",
    title: "Discord Bot Update - New Features",
    content:
      "Updated our Discord bot with music commands and game server status. You can now check if the Minecraft server is online with !mcstatus. More features coming soon!",
    author: "Seya Weber",
    timestamp: "2024-01-12T16:20:00Z",
    likes: 6,
    comments: 4,
  },
]

const sharedFiles = [
  {
    id: "1",
    name: "Minecraft_Modpack_v2.3.zip",
    size: "145 MB",
    type: "archive",
    uploadedBy: "Seya Weber",
    uploadedAt: "2024-01-20T08:30:00Z",
    downloads: 8,
    url: "#",
  },
  {
    id: "2",
    name: "LAN_Party_Game_List.pdf",
    size: "2.1 MB",
    type: "pdf",
    uploadedBy: "Seya Weber",
    uploadedAt: "2024-01-18T16:20:00Z",
    downloads: 12,
    url: "#",
  },
  {
    id: "3",
    name: "Server_Setup_Guide.md",
    size: "25 KB",
    type: "document",
    uploadedBy: "Seya Weber",
    uploadedAt: "2024-01-15T11:10:00Z",
    downloads: 6,
    url: "#",
  },
  {
    id: "4",
    name: "Discord_Bot_Commands.txt",
    size: "8 KB",
    type: "document",
    uploadedBy: "Seya Weber",
    uploadedAt: "2024-01-12T14:45:00Z",
    downloads: 15,
    url: "#",
  },
  {
    id: "5",
    name: "Tournament_Bracket_Template.xlsx",
    size: "156 KB",
    type: "document",
    uploadedBy: "Alex",
    uploadedAt: "2024-01-10T19:30:00Z",
    downloads: 9,
    url: "#",
  },
]

const votingPolls = [
  {
    id: "1",
    question: "What game should we play at the next LAN party?",
    options: [
      { id: "a", text: "Counter-Strike 2", votes: 12 },
      { id: "b", text: "Age of Empires 2", votes: 8 },
      { id: "c", text: "Rocket League", votes: 15 },
      { id: "d", text: "Valheim Co-op", votes: 6 },
    ],
    createdBy: "Seya Weber",
    createdAt: "2024-01-20T12:00:00Z",
    endsAt: "2024-01-27T12:00:00Z",
    totalVotes: 41,
    isActive: true,
  },
  {
    id: "2",
    question: "Best day for weekly game nights?",
    options: [
      { id: "a", text: "Friday Evening", votes: 18 },
      { id: "b", text: "Saturday Evening", votes: 22 },
      { id: "c", text: "Sunday Afternoon", votes: 5 },
    ],
    createdBy: "Seya Weber",
    createdAt: "2024-01-15T10:00:00Z",
    endsAt: "2024-01-22T10:00:00Z",
    totalVotes: 45,
    isActive: false,
  },
  {
    id: "3",
    question: "Should we add more mods to the Minecraft server?",
    options: [
      { id: "a", text: "Yes, more tech mods!", votes: 14 },
      { id: "b", text: "Add some magic mods", votes: 7 },
      { id: "c", text: "Keep it simple", votes: 4 },
      { id: "d", text: "Add exploration mods", votes: 9 },
    ],
    createdBy: "Mike",
    createdAt: "2024-01-18T15:30:00Z",
    endsAt: "2024-01-25T15:30:00Z",
    totalVotes: 34,
    isActive: true,
  },
]

export {
  navLinks,
  toggles,
  testimonials,
  projects,
  blogPosts,
  caseStudies,
  ideas,
  users,
  newsFeeds,
  sharedFiles,
  votingPolls,
}
