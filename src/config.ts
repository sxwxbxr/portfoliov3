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
export {
  navLinks,
  projects,
  blogPosts,
  caseStudies,
}
