// SkillBridge Career Intelligence Database
// Rich, role-specific data for generating personalized roadmaps

export interface CareerProfile {
  aliases: string[]; // fuzzy match targets
  category: "engineering" | "design" | "data" | "product" | "management" | "devops" | "security" | "marketing" | "ai";
  foundation: {
    skills: string[];
    resources: { name: string; type: "course" | "book" | "practice" | "community" }[];
    milestone: string;
    baseDurationMonths: number;
  };
  execution: {
    skills: string[];
    resources: { name: string; type: "course" | "book" | "practice" | "community" }[];
    milestone: string;
    baseDurationMonths: number;
  };
  authority: {
    skills: string[];
    resources: { name: string; type: "course" | "book" | "practice" | "community" }[];
    milestone: string;
    baseDurationMonths: number;
  };
  seniorityModifiers: {
    junior: { durationMult: number; extraFoundationSkills: string[] };
    mid: { durationMult: number; extraFoundationSkills: string[] };
    senior: { durationMult: number; extraFoundationSkills: string[] };
  };
}

export const CAREER_PROFILES: Record<string, CareerProfile> = {
  "senior-frontend-engineer": {
    aliases: ["senior frontend", "senior front-end", "sr frontend", "senior fe", "frontend lead", "senior react developer", "senior ui engineer"],
    category: "engineering",
    foundation: {
      skills: ["Advanced TypeScript & type-level programming", "React performance patterns (memo, Suspense, transitions)", "Core Web Vitals optimization", "Accessibility (WCAG 2.1 AA)", "CSS architecture (CSS Modules, Tailwind, CSS-in-JS trade-offs)"],
      resources: [
        { name: "Total TypeScript by Matt Pocock", type: "course" },
        { name: "web.dev Performance guides", type: "practice" },
        { name: "Testing Library + Playwright E2E setup", type: "practice" },
        { name: "Deque University (accessibility)", type: "course" },
      ],
      milestone: "Ship a performance audit that improves LCP by 30%+ on a production app",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Design system architecture", "Micro-frontend patterns", "State management at scale (Zustand, Jotai, or server state)", "CI/CD pipeline optimization for frontend", "Monorepo tooling (Turborepo, Nx)"],
      resources: [
        { name: "Build a component library with Storybook + Chromatic", type: "practice" },
        { name: "Patterns.dev by Lydia Hallie & Addy Osmani", type: "book" },
        { name: "Contribute to a major open-source UI library", type: "practice" },
        { name: "Frontend Masters — Enterprise Architecture", type: "course" },
      ],
      milestone: "Own and ship a design system or major frontend platform initiative used by 3+ teams",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Technical RFC writing", "Cross-team architecture decisions", "Performance budgeting & monitoring strategy", "Mentoring junior & mid engineers", "Interviewing & hiring bar-raising"],
      resources: [
        { name: "Write a technical blog series (3+ posts)", type: "practice" },
        { name: "Give a talk at a local meetup or conference", type: "community" },
        { name: "Staff Engineer by Will Larson", type: "book" },
        { name: "Lead an architecture review for a cross-team project", type: "practice" },
      ],
      milestone: "Recognized as the frontend authority — teams consult you on architecture decisions",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["JavaScript fundamentals deep-dive", "Git workflow & code review etiquette", "Browser DevTools mastery"] },
      mid: { durationMult: 1.0, extraFoundationSkills: ["Advanced debugging techniques"] },
      senior: { durationMult: 0.6, extraFoundationSkills: [] },
    },
  },

  "staff-engineer": {
    aliases: ["staff eng", "staff software engineer", "principal engineer", "senior staff", "l6 engineer", "ic6"],
    category: "engineering",
    foundation: {
      skills: ["Distributed systems fundamentals", "System design (load balancers, caching, queues, DBs)", "Cross-service API design (gRPC, GraphQL federation)", "Observability & reliability engineering", "Cost modeling & infrastructure economics"],
      resources: [
        { name: "Designing Data-Intensive Applications by Martin Kleppmann", type: "book" },
        { name: "System Design Interview by Alex Xu (Vol 1 & 2)", type: "book" },
        { name: "MIT 6.824 Distributed Systems (free lectures)", type: "course" },
        { name: "Build a distributed KV store from scratch", type: "practice" },
      ],
      milestone: "Design and document a system handling 10K+ RPS with clear trade-off analysis",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["Technical strategy & roadmap creation", "Cross-team project leadership", "Legacy system migration planning", "Organizational influence without authority", "Production incident leadership & postmortems"],
      resources: [
        { name: "Write 3+ technical RFCs that get approved and implemented", type: "practice" },
        { name: "Lead a cross-team migration or platform initiative", type: "practice" },
        { name: "The Staff Engineer's Path by Tanya Reilly", type: "book" },
        { name: "An Elegant Puzzle by Will Larson", type: "book" },
      ],
      milestone: "Successfully lead a multi-quarter, multi-team technical initiative from proposal to delivery",
      baseDurationMonths: 6,
    },
    authority: {
      skills: ["Engineering-wide standards & best practices", "Technical vision documents", "Executive communication & stakeholder management", "Hiring pipeline & interview design", "Open-source or public technical presence"],
      resources: [
        { name: "Publish on the company engineering blog", type: "practice" },
        { name: "Present at a major tech conference", type: "community" },
        { name: "Mentor 2-3 senior engineers toward staff trajectory", type: "practice" },
        { name: "Build relationships with engineering leadership across orgs", type: "community" },
      ],
      milestone: "Your technical decisions shape the engineering org's direction — you're a force multiplier",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 2.0, extraFoundationSkills: ["Data structures & algorithms mastery", "Learn 2+ programming languages deeply", "Contribute to large codebases"] },
      mid: { durationMult: 1.4, extraFoundationSkills: ["Advanced system design patterns", "Read 20+ engineering blog posts from FAANG companies"] },
      senior: { durationMult: 1.0, extraFoundationSkills: [] },
    },
  },

  "engineering-manager": {
    aliases: ["eng manager", "em", "engineering lead", "dev manager", "software development manager", "team lead", "tech lead manager"],
    category: "management",
    foundation: {
      skills: ["1:1 meeting frameworks & coaching techniques", "Agile/Scrum facilitation (beyond ceremonies)", "Hiring & structured interviewing", "Performance management & feedback delivery", "Basic people ops (PIP, promotions, leveling)"],
      resources: [
        { name: "The Manager's Path by Camille Fournier", type: "book" },
        { name: "Radical Candor by Kim Scott", type: "book" },
        { name: "Shadow an experienced EM for 2+ weeks", type: "practice" },
        { name: "Practice structured behavioral interviews", type: "practice" },
      ],
      milestone: "Run effective 1:1s with direct reports and deliver one difficult feedback conversation well",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Roadmap planning & cross-team coordination", "Team health metrics & engagement", "Technical debt negotiation with product", "Conflict resolution & mediation", "Budget & resource allocation"],
      resources: [
        { name: "An Elegant Puzzle by Will Larson", type: "book" },
        { name: "Lead a team through a full planning cycle (quarter/half)", type: "practice" },
        { name: "High Output Management by Andy Grove", type: "book" },
        { name: "Rands Leadership Slack community", type: "community" },
      ],
      milestone: "Ship a major project on time while maintaining team health scores above baseline",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Organizational design & team topology", "Executive presence & stakeholder management", "Engineering culture & values definition", "Cross-functional leadership (PM, Design, Data)", "Strategic hiring & employer branding"],
      resources: [
        { name: "Team Topologies by Skelton & Pais", type: "book" },
        { name: "Write about engineering management publicly", type: "practice" },
        { name: "Mentor aspiring engineering managers", type: "community" },
        { name: "LeadDev conference talks & community", type: "community" },
      ],
      milestone: "Your team is a talent magnet — people request to join, attrition is low, output is high",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.8, extraFoundationSkills: ["Build credibility through IC excellence first", "Learn to delegate effectively", "Understand your company's management expectations"] },
      mid: { durationMult: 1.2, extraFoundationSkills: ["Transition from IC mindset to multiplier mindset"] },
      senior: { durationMult: 0.8, extraFoundationSkills: [] },
    },
  },

  "data-scientist": {
    aliases: ["data science", "ml engineer", "machine learning engineer", "applied scientist", "research scientist", "senior data scientist"],
    category: "data",
    foundation: {
      skills: ["Statistics & probability (hypothesis testing, Bayesian thinking)", "Python data stack (pandas, NumPy, scikit-learn)", "SQL at scale (window functions, CTEs, query optimization)", "Experiment design & A/B testing", "Data visualization & storytelling"],
      resources: [
        { name: "An Introduction to Statistical Learning (ISLR)", type: "book" },
        { name: "fast.ai Practical Deep Learning course", type: "course" },
        { name: "Kaggle competitions (complete 3+)", type: "practice" },
        { name: "Mode Analytics SQL tutorial", type: "course" },
      ],
      milestone: "Complete an end-to-end ML project: problem → data → model → evaluation → presentation",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["ML pipeline engineering (MLflow, Kubeflow, or similar)", "Deep learning frameworks (PyTorch or TensorFlow)", "Feature engineering & feature stores", "Model deployment & monitoring (drift detection)", "Causal inference & advanced experimentation"],
      resources: [
        { name: "Designing Machine Learning Systems by Chip Huyen", type: "book" },
        { name: "Deploy a model to production with monitoring", type: "practice" },
        { name: "Stanford CS229 or CS230 (free lectures)", type: "course" },
        { name: "Build an internal ML tool used by stakeholders", type: "practice" },
      ],
      milestone: "Deploy a model that drives measurable business impact (revenue, efficiency, or user engagement)",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["ML system architecture at scale", "Research-to-production pipeline ownership", "Cross-functional influence (product, engineering, executives)", "Technical mentorship & team building", "Publishing & conference presentations"],
      resources: [
        { name: "Publish a blog post or paper on applied ML", type: "practice" },
        { name: "Present at a data science meetup or conference", type: "community" },
        { name: "Lead a company-wide data/ML initiative", type: "practice" },
        { name: "Mentor junior data scientists (2+)", type: "community" },
      ],
      milestone: "You define the ML strategy — teams come to you for guidance on what's feasible and impactful",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Linear algebra refresher", "Python fundamentals & clean code practices", "Version control with Git"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "product-manager": {
    aliases: ["pm", "product lead", "senior pm", "group pm", "product owner", "head of product", "vp product"],
    category: "product",
    foundation: {
      skills: ["User research & discovery interviews", "PRD & spec writing", "Metrics definition (north star, input/output metrics)", "Prioritization frameworks (RICE, ICE, opportunity scoring)", "Wireframing & prototyping basics"],
      resources: [
        { name: "Inspired by Marty Cagan", type: "book" },
        { name: "Conduct 10+ user interviews", type: "practice" },
        { name: "Reforge Product Strategy course", type: "course" },
        { name: "Lenny's Newsletter & podcast", type: "community" },
      ],
      milestone: "Own a feature from discovery to launch with measurable success criteria",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Go-to-market strategy", "Data analysis & SQL for product insights", "Stakeholder management & executive communication", "Growth loops & retention analysis", "A/B testing & experimentation programs"],
      resources: [
        { name: "Continuous Discovery Habits by Teresa Torres", type: "book" },
        { name: "Launch a 0→1 product or major feature", type: "practice" },
        { name: "Build a product analytics dashboard from scratch", type: "practice" },
        { name: "Product School community", type: "community" },
      ],
      milestone: "Ship a product initiative that moves a key business metric by 10%+",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Product vision & multi-year strategy", "Team building & PM mentorship", "Board/exec-level communication", "Market analysis & competitive intelligence", "Platform thinking & ecosystem design"],
      resources: [
        { name: "Empowered by Marty Cagan", type: "book" },
        { name: "Write a product strategy doc for a new market", type: "practice" },
        { name: "Speak at a product conference", type: "community" },
        { name: "Build a public product thought leadership presence", type: "practice" },
      ],
      milestone: "You set the product vision — the org trusts your judgment on what to build and why",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.6, extraFoundationSkills: ["Learn basic SQL and data querying", "Understand the engineering development cycle", "Practice writing clear user stories"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "devops-engineer": {
    aliases: ["devops", "sre", "site reliability engineer", "platform engineer", "infrastructure engineer", "cloud engineer", "senior devops"],
    category: "devops",
    foundation: {
      skills: ["Linux systems administration & networking", "Docker & container orchestration (Kubernetes)", "Infrastructure as Code (Terraform, Pulumi)", "CI/CD pipeline design (GitHub Actions, GitLab CI)", "Cloud platform fundamentals (AWS/GCP/Azure)"],
      resources: [
        { name: "The Phoenix Project by Gene Kim", type: "book" },
        { name: "KodeKloud Kubernetes courses", type: "course" },
        { name: "Build a full CI/CD pipeline for a real project", type: "practice" },
        { name: "AWS/GCP free tier hands-on labs", type: "practice" },
      ],
      milestone: "Deploy a containerized application with automated CI/CD, monitoring, and rollback capability",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Observability stack (Prometheus, Grafana, OpenTelemetry)", "Incident management & on-call processes", "GitOps workflows (ArgoCD, Flux)", "Security hardening & compliance automation", "Cost optimization & FinOps basics"],
      resources: [
        { name: "Site Reliability Engineering (Google SRE book, free online)", type: "book" },
        { name: "Set up a full observability stack for a production service", type: "practice" },
        { name: "Implement GitOps for a multi-environment deployment", type: "practice" },
        { name: "HashiCorp Learn tutorials", type: "course" },
      ],
      milestone: "Achieve 99.9% uptime SLA with automated incident detection and self-healing capabilities",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Platform engineering & internal developer experience", "Multi-cloud & hybrid architecture", "Disaster recovery & business continuity planning", "Team topology for platform teams", "Technical evangelism & DevOps culture"],
      resources: [
        { name: "Team Topologies by Skelton & Pais", type: "book" },
        { name: "Design an internal developer platform (IDP)", type: "practice" },
        { name: "Present at DevOpsDays or KubeCon", type: "community" },
        { name: "Contribute to CNCF projects", type: "community" },
      ],
      milestone: "You define the infrastructure strategy — developers ship faster because of the platform you built",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Linux command line proficiency", "Networking fundamentals (TCP/IP, DNS, HTTP)", "Scripting (Bash, Python)"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "ux-designer": {
    aliases: ["ux", "ui/ux", "product designer", "senior designer", "design lead", "ux researcher", "interaction designer", "ui designer"],
    category: "design",
    foundation: {
      skills: ["User research methods (interviews, usability testing, surveys)", "Information architecture & user flows", "Wireframing & prototyping (Figma)", "Design systems fundamentals", "Accessibility in design (WCAG)"],
      resources: [
        { name: "Don't Make Me Think by Steve Krug", type: "book" },
        { name: "Google UX Design Certificate (Coursera)", type: "course" },
        { name: "Redesign 3 existing apps with documented rationale", type: "practice" },
        { name: "Nielsen Norman Group articles", type: "community" },
      ],
      milestone: "Complete a full design project: research → wireframes → prototype → usability test → iterate",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Advanced prototyping & micro-interactions", "Design system creation & governance", "Data-informed design (analytics + qualitative)", "Cross-functional collaboration (eng, PM, data)", "Design critique & workshop facilitation"],
      resources: [
        { name: "Build and maintain a design system in Figma", type: "practice" },
        { name: "Refactoring UI by Adam Wathan & Steve Schoger", type: "book" },
        { name: "Run a design sprint for a real product problem", type: "practice" },
        { name: "Dribbble & Behance portfolio curation", type: "practice" },
      ],
      milestone: "Ship a design that measurably improves user engagement or task completion rates",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Design strategy & vision", "Team leadership & mentoring", "Executive presentations & design advocacy", "Design ops & process optimization", "Brand & product language evolution"],
      resources: [
        { name: "Org Design for Design Orgs by Merholz & Skinner", type: "book" },
        { name: "Speak at a design conference or meetup", type: "community" },
        { name: "Write about design process publicly", type: "practice" },
        { name: "Mentor 2+ junior designers", type: "community" },
      ],
      milestone: "You set the design direction — product quality is elevated because of your influence",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Visual design fundamentals (typography, color, layout)", "Figma proficiency", "Portfolio building"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "backend-engineer": {
    aliases: ["backend", "back-end", "server-side engineer", "senior backend", "api engineer", "backend developer", "senior software engineer"],
    category: "engineering",
    foundation: {
      skills: ["API design (REST best practices, OpenAPI specs)", "Database design & optimization (PostgreSQL, indexing, query plans)", "Authentication & authorization patterns (OAuth2, JWT, RBAC)", "Error handling, logging & structured observability", "Testing strategy (unit, integration, contract tests)"],
      resources: [
        { name: "Clean Architecture by Robert C. Martin", type: "book" },
        { name: "PostgreSQL official documentation deep-dive", type: "practice" },
        { name: "Build a production-ready REST API with auth", type: "practice" },
        { name: "Backend Masters course (Hussein Nasser)", type: "course" },
      ],
      milestone: "Ship a production API with proper auth, rate limiting, error handling, and >90% test coverage",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Distributed systems patterns (CQRS, event sourcing, saga)", "Message queues & async processing (Kafka, RabbitMQ, SQS)", "Caching strategies (Redis, CDN, application-level)", "Performance profiling & optimization", "Database scaling (replication, sharding, read replicas)"],
      resources: [
        { name: "Designing Data-Intensive Applications by Kleppmann", type: "book" },
        { name: "Build a system handling 1K+ concurrent connections", type: "practice" },
        { name: "Contribute to an open-source backend framework", type: "practice" },
        { name: "System Design Primer (GitHub)", type: "course" },
      ],
      milestone: "Design and ship a service that handles production-scale traffic with clear SLOs",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Service architecture & API platform design", "Technical debt strategy & migration planning", "Cross-team technical leadership", "Performance budgeting & capacity planning", "Engineering standards & best practices documentation"],
      resources: [
        { name: "Building Microservices by Sam Newman", type: "book" },
        { name: "Write technical RFCs that influence architecture decisions", type: "practice" },
        { name: "Present at backend-focused meetups", type: "community" },
        { name: "Mentor mid-level engineers on system design", type: "community" },
      ],
      milestone: "You're the go-to person for backend architecture — your designs scale and your opinions carry weight",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["HTTP protocol deep-dive", "Data structures & algorithms", "Linux basics & CLI proficiency"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "fullstack-engineer": {
    aliases: ["fullstack", "full-stack", "full stack developer", "senior fullstack", "generalist engineer", "web developer"],
    category: "engineering",
    foundation: {
      skills: ["Modern frontend framework mastery (React/Next.js or Vue/Nuxt)", "Server-side development (Node.js, Python, or Go)", "Database design (SQL + NoSQL fundamentals)", "API design & integration patterns", "Authentication flows (OAuth2, sessions, JWTs)"],
      resources: [
        { name: "Full Stack Open (University of Helsinki, free)", type: "course" },
        { name: "Build and deploy a complete SaaS app end-to-end", type: "practice" },
        { name: "The Pragmatic Programmer by Hunt & Thomas", type: "book" },
        { name: "Vercel/Netlify deployment & serverless patterns", type: "practice" },
      ],
      milestone: "Ship a complete full-stack application with auth, database, API, and polished frontend",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["Performance optimization across the stack", "Infrastructure as Code & deployment automation", "Real-time features (WebSockets, SSE)", "Payment integration & third-party APIs", "Monitoring & error tracking (end-to-end)"],
      resources: [
        { name: "Build a SaaS with Stripe billing, user management, and dashboards", type: "practice" },
        { name: "Implement real-time features in a production app", type: "practice" },
        { name: "Web Scalability for Startup Engineers by Ejsmont", type: "book" },
        { name: "Open source a full-stack project with >50 GitHub stars", type: "practice" },
      ],
      milestone: "Own a product end-to-end from database to deployment — ship features that users pay for",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Architecture decisions across frontend & backend", "Technical product sense & feature scoping", "Developer experience & tooling", "Team velocity optimization", "Technical writing & knowledge sharing"],
      resources: [
        { name: "Write a technical blog (3+ posts on full-stack patterns)", type: "practice" },
        { name: "Architect a multi-service application", type: "practice" },
        { name: "IndieHackers & Hacker News community engagement", type: "community" },
        { name: "Mentor developers transitioning to full-stack", type: "community" },
      ],
      milestone: "You can take any idea from napkin sketch to production — teams trust your technical judgment across the entire stack",
      baseDurationMonths: 3,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.4, extraFoundationSkills: ["HTML/CSS fundamentals", "JavaScript/TypeScript proficiency", "Git & collaborative development"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "cybersecurity-engineer": {
    aliases: ["security engineer", "cybersecurity", "appsec", "security analyst", "pentester", "penetration tester", "infosec", "security architect"],
    category: "security",
    foundation: {
      skills: ["Network security fundamentals (firewalls, VPNs, IDS/IPS)", "OWASP Top 10 & web application security", "Linux security hardening", "Cryptography basics (TLS, hashing, PKI)", "Security tools (Burp Suite, Nmap, Wireshark)"],
      resources: [
        { name: "TryHackMe or HackTheBox beginner paths", type: "practice" },
        { name: "CompTIA Security+ study material", type: "course" },
        { name: "Web Security Academy by PortSwigger (free)", type: "course" },
        { name: "The Web Application Hacker's Handbook", type: "book" },
      ],
      milestone: "Complete 20+ CTF challenges and perform a security audit on a real web application",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["Threat modeling & risk assessment", "SIEM & security monitoring (Splunk, ELK)", "Incident response & forensics", "Cloud security (AWS/GCP IAM, network policies)", "Automated security testing in CI/CD pipelines"],
      resources: [
        { name: "Implement a security monitoring pipeline", type: "practice" },
        { name: "SANS training courses (or equivalent)", type: "course" },
        { name: "Build automated security scanning into a CI/CD pipeline", type: "practice" },
        { name: "Bug bounty programs (HackerOne, Bugcrowd)", type: "practice" },
      ],
      milestone: "Identify and remediate a critical vulnerability in a production system through proactive testing",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Security architecture & zero-trust design", "Compliance frameworks (SOC 2, ISO 27001, GDPR)", "Security program building & team leadership", "Executive risk communication", "Security culture & training programs"],
      resources: [
        { name: "CISSP or equivalent certification preparation", type: "course" },
        { name: "Present at BSides or DEF CON", type: "community" },
        { name: "Build a company-wide security awareness program", type: "practice" },
        { name: "Write security advisories or blog posts", type: "practice" },
      ],
      milestone: "You define the security posture — the organization is measurably more secure because of your leadership",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Networking fundamentals (TCP/IP, DNS, HTTP)", "Basic scripting (Python, Bash)", "Operating system internals"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "ai-ml-engineer": {
    aliases: ["ai engineer", "ml engineer", "machine learning", "deep learning engineer", "nlp engineer", "computer vision engineer", "ai/ml", "llm engineer"],
    category: "ai",
    foundation: {
      skills: ["Python ML stack (PyTorch, Hugging Face, LangChain)", "Neural network architectures (transformers, CNNs, RNNs)", "Prompt engineering & LLM application design", "Vector databases & RAG pipelines", "ML experiment tracking (W&B, MLflow)"],
      resources: [
        { name: "fast.ai Practical Deep Learning (free)", type: "course" },
        { name: "Andrej Karpathy's Neural Networks: Zero to Hero", type: "course" },
        { name: "Build a RAG application with real documents", type: "practice" },
        { name: "Hugging Face course (free)", type: "course" },
      ],
      milestone: "Build and deploy an AI application that solves a real problem using modern LLM/ML techniques",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["Fine-tuning & RLHF techniques", "ML infrastructure (GPU clusters, model serving)", "Evaluation frameworks & benchmarking", "Responsible AI & bias mitigation", "Cost optimization for inference at scale"],
      resources: [
        { name: "Fine-tune a model on custom data with evaluation", type: "practice" },
        { name: "Deploy a model with <100ms latency at scale", type: "practice" },
        { name: "Stanford CS224N or CS231N (free lectures)", type: "course" },
        { name: "Papers With Code — implement 3+ recent papers", type: "practice" },
      ],
      milestone: "Ship an AI feature to production that handles real users with monitoring, guardrails, and cost controls",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["AI strategy & build-vs-buy decisions", "Research-to-production pipeline ownership", "AI safety & governance frameworks", "Technical leadership in fast-moving AI landscape", "Publishing & conference presentations"],
      resources: [
        { name: "Publish a technical blog on AI engineering", type: "practice" },
        { name: "Present at NeurIPS, ICML, or industry AI events", type: "community" },
        { name: "Lead an org-wide AI adoption initiative", type: "practice" },
        { name: "Contribute to open-source AI projects", type: "community" },
      ],
      milestone: "You're the AI authority — leadership trusts your judgment on where AI can (and can't) create value",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Linear algebra & calculus refresher", "Python proficiency & clean code", "Statistics fundamentals"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "cto": {
    aliases: ["chief technology officer", "vp engineering", "vp of engineering", "head of engineering", "director of engineering", "svp engineering"],
    category: "management",
    foundation: {
      skills: ["Engineering organization design", "Technical strategy & vision creation", "Budgeting & resource planning", "Vendor evaluation & build-vs-buy frameworks", "Board & investor communication"],
      resources: [
        { name: "The CTO Handbook by Zack Argyle", type: "book" },
        { name: "An Elegant Puzzle by Will Larson", type: "book" },
        { name: "CTO Craft community", type: "community" },
        { name: "Shadow a current CTO or VP Eng", type: "practice" },
      ],
      milestone: "Create a 12-month technical strategy document with budget, headcount, and milestone projections",
      baseDurationMonths: 4,
    },
    execution: {
      skills: ["Hiring & scaling engineering teams (10→50→200)", "M&A technical due diligence", "Cross-functional executive leadership", "Technical debt vs. product velocity negotiation", "Security, compliance & risk management"],
      resources: [
        { name: "Scale an engineering org through a growth phase", type: "practice" },
        { name: "Manage a $1M+ engineering budget", type: "practice" },
        { name: "The Hard Thing About Hard Things by Ben Horowitz", type: "book" },
        { name: "Elad Gil's High Growth Handbook", type: "book" },
      ],
      milestone: "Successfully scale an engineering organization while maintaining velocity, quality, and culture",
      baseDurationMonths: 6,
    },
    authority: {
      skills: ["Industry thought leadership", "Fundraising & technical storytelling", "Partnership & ecosystem building", "Innovation lab & R&D investment", "Succession planning & leadership development"],
      resources: [
        { name: "Speak at CTO/leadership conferences", type: "community" },
        { name: "Advise startups on technical strategy", type: "practice" },
        { name: "Build a public presence (blog, podcast, talks)", type: "practice" },
        { name: "YC/Techstars/advisor network", type: "community" },
      ],
      milestone: "You shape the technical landscape — your decisions directly drive company valuation and market position",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 2.5, extraFoundationSkills: ["Gain deep IC experience first (5+ years)", "Lead progressively larger teams", "Understand the business model deeply"] },
      mid: { durationMult: 1.5, extraFoundationSkills: ["Build executive communication skills", "Learn financial modeling basics"] },
      senior: { durationMult: 1.0, extraFoundationSkills: [] },
    },
  },

  "data-engineer": {
    aliases: ["data eng", "analytics engineer", "data platform engineer", "etl developer", "big data engineer", "senior data engineer"],
    category: "data",
    foundation: {
      skills: ["SQL mastery (complex joins, window functions, CTEs, optimization)", "Python for data pipelines (pandas, PySpark)", "Data warehouse concepts (star schema, slowly changing dimensions)", "ETL/ELT pipeline design", "Cloud data services (BigQuery, Snowflake, Redshift)"],
      resources: [
        { name: "Fundamentals of Data Engineering by Reis & Housley", type: "book" },
        { name: "Build a complete ETL pipeline from source to dashboard", type: "practice" },
        { name: "DataTalks.Club Data Engineering Zoomcamp (free)", type: "course" },
        { name: "dbt fundamentals course (free)", type: "course" },
      ],
      milestone: "Build a production data pipeline: ingest → transform → load → serve with data quality checks",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Stream processing (Kafka, Flink, Spark Streaming)", "Data modeling at scale", "Data orchestration (Airflow, Dagster, Prefect)", "Data governance & cataloging", "Cost optimization for data infrastructure"],
      resources: [
        { name: "Implement a real-time streaming pipeline", type: "practice" },
        { name: "Design a data mesh or lakehouse architecture", type: "practice" },
        { name: "Streaming Systems by Akidau, Chernyak & Lax", type: "book" },
        { name: "Contribute to Apache open-source data projects", type: "community" },
      ],
      milestone: "Own a data platform that serves real-time and batch analytics reliably to multiple teams",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Data platform architecture & strategy", "Data mesh / data product thinking", "Cross-org data governance", "Team building & data engineering culture", "Vendor negotiation & platform decisions"],
      resources: [
        { name: "Data Mesh by Zhamak Dehghani", type: "book" },
        { name: "Present at data engineering conferences", type: "community" },
        { name: "Write about data architecture decisions publicly", type: "practice" },
        { name: "Lead a data platform migration or major initiative", type: "practice" },
      ],
      milestone: "You define how data flows through the org — your platform enables every team to be data-driven",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["SQL fundamentals", "Python basics", "Understanding of databases vs. data warehouses"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "mobile-engineer": {
    aliases: ["ios developer", "android developer", "mobile developer", "react native developer", "flutter developer", "senior mobile engineer", "mobile lead"],
    category: "engineering",
    foundation: {
      skills: ["Platform-native fundamentals (Swift/Kotlin or cross-platform)", "Mobile UI patterns & responsive layouts", "State management & navigation architecture", "API integration & offline-first patterns", "App Store guidelines & release processes"],
      resources: [
        { name: "Apple's SwiftUI tutorials or Android Jetpack Compose docs", type: "course" },
        { name: "Build and publish an app to the App Store/Play Store", type: "practice" },
        { name: "Mobile development best practices (Ray Wenderlich)", type: "course" },
        { name: "Flutter or React Native official docs + project", type: "practice" },
      ],
      milestone: "Ship a polished mobile app with auth, API integration, and offline support to a public app store",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Performance profiling & optimization", "Push notifications & background tasks", "CI/CD for mobile (Fastlane, Bitrise)", "Analytics & crash reporting integration", "Accessibility on mobile platforms"],
      resources: [
        { name: "Optimize an app for 60fps scrolling & fast startup", type: "practice" },
        { name: "Set up mobile CI/CD with automated testing", type: "practice" },
        { name: "Advanced iOS/Android programming courses", type: "course" },
        { name: "Contribute to a popular mobile open-source library", type: "practice" },
      ],
      milestone: "Own a mobile product used by 10K+ users with 4.5+ star rating and <1% crash rate",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Mobile architecture patterns at scale", "Cross-platform strategy decisions", "Mobile platform team leadership", "App performance & growth metrics", "Technical mentorship & hiring"],
      resources: [
        { name: "Lead a mobile platform architecture overhaul", type: "practice" },
        { name: "Present at mobile conferences (WWDC-adjacent, Droidcon)", type: "community" },
        { name: "Write about mobile engineering challenges", type: "practice" },
        { name: "Mentor junior mobile developers", type: "community" },
      ],
      milestone: "You define mobile strategy — app quality, performance, and team capability are excellent because of your leadership",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.4, extraFoundationSkills: ["Programming fundamentals", "Object-oriented design patterns", "Version control with Git"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },

  "digital-marketer": {
    aliases: ["growth marketer", "performance marketer", "marketing manager", "growth hacker", "seo specialist", "content marketer", "head of marketing", "cmo"],
    category: "marketing",
    foundation: {
      skills: ["SEO fundamentals (technical, on-page, off-page)", "Google Analytics 4 & tag management", "Content strategy & copywriting", "Email marketing & automation", "Social media marketing fundamentals"],
      resources: [
        { name: "Google Digital Garage (free certification)", type: "course" },
        { name: "Ahrefs Academy SEO course (free)", type: "course" },
        { name: "Launch a content marketing campaign from scratch", type: "practice" },
        { name: "Marketing Examples newsletter", type: "community" },
      ],
      milestone: "Drive measurable organic traffic growth (50%+) to a website through SEO and content",
      baseDurationMonths: 3,
    },
    execution: {
      skills: ["Paid acquisition (Google Ads, Meta Ads, LinkedIn)", "Conversion rate optimization (CRO)", "Marketing automation (HubSpot, Mailchimp, etc.)", "Attribution modeling & analytics", "A/B testing for landing pages & campaigns"],
      resources: [
        { name: "Run a profitable paid ad campaign ($1K+ budget)", type: "practice" },
        { name: "CXL Institute growth marketing courses", type: "course" },
        { name: "Build a marketing funnel with automated nurture sequences", type: "practice" },
        { name: "GrowthHackers community", type: "community" },
      ],
      milestone: "Achieve positive ROAS on a paid campaign while growing organic channels simultaneously",
      baseDurationMonths: 5,
    },
    authority: {
      skills: ["Brand strategy & positioning", "Marketing team building & management", "Budget allocation & forecasting", "Cross-channel attribution & data strategy", "Thought leadership & industry presence"],
      resources: [
        { name: "Obviously Awesome by April Dunford", type: "book" },
        { name: "Speak at marketing conferences", type: "community" },
        { name: "Build a personal brand through content", type: "practice" },
        { name: "Mentor junior marketers", type: "community" },
      ],
      milestone: "You own the growth engine — the company scales because of the marketing machine you built",
      baseDurationMonths: 4,
    },
    seniorityModifiers: {
      junior: { durationMult: 1.5, extraFoundationSkills: ["Basic HTML/CSS understanding", "Canva or design tool proficiency", "Writing & communication skills"] },
      mid: { durationMult: 1.0, extraFoundationSkills: [] },
      senior: { durationMult: 0.7, extraFoundationSkills: [] },
    },
  },
};

/**
 * Fuzzy-match a user's target role to a career profile.
 * Returns the profile key or null if no match.
 */
export function matchCareerProfile(targetRole: string): string | null {
  const normalized = targetRole.toLowerCase().trim();

  // Direct key match
  const directKey = normalized.replace(/\s+/g, "-");
  if (CAREER_PROFILES[directKey]) return directKey;

  // Alias match (best = longest matching alias)
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [key, profile] of Object.entries(CAREER_PROFILES)) {
    for (const alias of profile.aliases) {
      const aliasLower = alias.toLowerCase();
      if (normalized.includes(aliasLower) || aliasLower.includes(normalized)) {
        const score = aliasLower.length; // longer alias = more specific
        if (score > bestScore) {
          bestScore = score;
          bestMatch = key;
        }
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Keyword match — check for category keywords
  const keywordMap: Record<string, string> = {
    frontend: "senior-frontend-engineer",
    "front-end": "senior-frontend-engineer",
    react: "senior-frontend-engineer",
    vue: "senior-frontend-engineer",
    angular: "senior-frontend-engineer",
    backend: "backend-engineer",
    "back-end": "backend-engineer",
    api: "backend-engineer",
    server: "backend-engineer",
    fullstack: "fullstack-engineer",
    "full-stack": "fullstack-engineer",
    "full stack": "fullstack-engineer",
    web: "fullstack-engineer",
    devops: "devops-engineer",
    sre: "devops-engineer",
    infrastructure: "devops-engineer",
    platform: "devops-engineer",
    cloud: "devops-engineer",
    kubernetes: "devops-engineer",
    data: "data-scientist",
    analytics: "data-engineer",
    machine: "ai-ml-engineer",
    ai: "ai-ml-engineer",
    ml: "ai-ml-engineer",
    "artificial intelligence": "ai-ml-engineer",
    llm: "ai-ml-engineer",
    product: "product-manager",
    ux: "ux-designer",
    ui: "ux-designer",
    design: "ux-designer",
    security: "cybersecurity-engineer",
    cyber: "cybersecurity-engineer",
    mobile: "mobile-engineer",
    ios: "mobile-engineer",
    android: "mobile-engineer",
    flutter: "mobile-engineer",
    manager: "engineering-manager",
    lead: "engineering-manager",
    cto: "cto",
    "vp eng": "cto",
    director: "cto",
    marketing: "digital-marketer",
    growth: "digital-marketer",
    seo: "digital-marketer",
  };

  for (const [keyword, profileKey] of Object.entries(keywordMap)) {
    if (normalized.includes(keyword)) return profileKey;
  }

  return null;
}

/**
 * Infer seniority level from experience years and current role.
 */
export function inferSeniority(
  experience: number,
  currentRole: string
): "junior" | "mid" | "senior" {
  const roleLower = currentRole.toLowerCase();

  // Role-based hints override experience
  if (
    roleLower.includes("senior") ||
    roleLower.includes("lead") ||
    roleLower.includes("principal") ||
    roleLower.includes("staff")
  ) {
    return "senior";
  }
  if (
    roleLower.includes("junior") ||
    roleLower.includes("intern") ||
    roleLower.includes("entry") ||
    roleLower.includes("associate") ||
    roleLower.includes("starter")
  ) {
    return "junior";
  }

  // Experience-based
  if (experience <= 2) return "junior";
  if (experience <= 5) return "mid";
  return "senior";
}
