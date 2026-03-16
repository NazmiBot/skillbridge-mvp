import type { Metadata } from "next";
import Link from "next/link";
import SampleReportClient from "./sample-client";

export const metadata: Metadata = {
  title: "Sample Premium Report — SkillBridge",
  description:
    "See exactly what you get with the $9 SkillBridge Premium Readiness Report. Full mock interview evaluation, STAR rewrites, and a personalized learning roadmap.",
};

/* ------------------------------------------------------------------ */
/*  Hardcoded dummy data — fully anonymized                           */
/* ------------------------------------------------------------------ */

const SAMPLE_ROADMAP = {
  slug: "sample",
  input: {
    currentRole: "Junior Frontend Developer",
    targetRole: "Senior Full-Stack Engineer",
    skills: ["HTML", "CSS", "JavaScript", "React", "Git"],
    experience: 2,
  },
  result: {
    estimatedTimeline: "18–24 months",
    generatedAt: new Date().toISOString(),
    roadmap: [
      {
        phase: 1,
        title: "Foundation",
        duration: "Months 1–6",
        skills: [
          "TypeScript",
          "Node.js",
          "SQL & PostgreSQL",
          "REST API Design",
          "Testing (Jest / Vitest)",
        ],
        resources: [
          "TypeScript Handbook — typescriptlang.org",
          "Node.js Official Docs — nodejs.org",
          "SQLBolt Interactive — sqlbolt.com",
        ],
        milestone:
          "Build and deploy a full REST API with auth, tests, and a PostgreSQL database.",
      },
      {
        phase: 2,
        title: "Execution",
        duration: "Months 7–14",
        skills: [
          "System Design Basics",
          "CI / CD Pipelines",
          "Docker & Containers",
          "Caching (Redis)",
          "Monitoring & Observability",
        ],
        resources: [
          "Designing Data-Intensive Applications — Martin Kleppmann",
          "GitHub Actions Docs — docs.github.com",
          "Docker Getting Started — docker.com",
        ],
        milestone:
          "Ship a production feature end-to-end: frontend, backend, CI pipeline, and monitoring.",
      },
      {
        phase: 3,
        title: "Authority",
        duration: "Months 15–24",
        skills: [
          "Architecture Decision Records",
          "Mentoring & Code Reviews",
          "Performance Optimization",
          "Cloud Infrastructure (AWS / GCP)",
          "Technical Writing",
        ],
        resources: [
          "Staff Engineer — Will Larson",
          "AWS Well-Architected Framework",
          "Write useful code reviews — Google Eng. Practices",
        ],
        milestone:
          "Lead a cross-team initiative, mentor a junior, and present an architectural RFC.",
      },
    ],
  },
};

const SAMPLE_EVALUATION = {
  score: 62,
  summary:
    "You demonstrate solid foundational frontend skills and communicate with enthusiasm, but your answers lack concrete metrics and structured storytelling. Backend knowledge gaps are apparent, particularly around database design and API architecture. With focused practice on the STAR method and backend fundamentals, you can close these gaps within 3–4 months.",
  strengths: [
    "Strong grasp of React component architecture and state management patterns — you articulated the trade-offs between local state and context clearly.",
    "Genuine enthusiasm and curiosity about learning new technologies; your answer about picking up TypeScript on the job showed real initiative.",
    "Good instinct for user experience — your explanation of how you optimized a checkout flow demonstrated product-minded thinking.",
    "Clear communication style with minimal filler; you structured most answers logically even when the content could be deeper.",
  ],
  weaknesses: [
    "Answers lacked quantifiable results — statements like 'it was much faster' need concrete numbers (e.g., '40% reduction in load time').",
    "Limited understanding of backend concepts; when asked about database indexing and query optimization, the response was surface-level.",
    "No mention of testing strategies — a senior role requires demonstrating commitment to code quality through unit, integration, and E2E testing.",
    "Struggled to articulate past conflict resolution — the question about disagreeing with a tech lead received a vague, non-specific answer.",
  ],
  starRewrites: [
    "QUESTION: \"Tell me about a time you improved application performance.\"\n\nORIGINAL (weak): \"I made the page load faster by optimizing some components and it was much better after.\"\n\nSTAR REWRITE:\n• Situation: Our e-commerce checkout page had a 4.2s load time, causing a 23% cart abandonment rate.\n• Task: I was assigned to reduce load time to under 2s before the holiday traffic spike.\n• Action: I profiled the bundle with Webpack Bundle Analyzer, code-split three heavy dependencies (Moment.js → date-fns, lodash → cherry-picked imports), added React.lazy for below-the-fold components, and implemented image lazy loading.\n• Result: Load time dropped to 1.6s (62% improvement), cart abandonment fell to 14%, and the changes contributed to a $180K revenue increase during Q4.",
    "QUESTION: \"Describe a disagreement with a colleague on a technical decision.\"\n\nORIGINAL (weak): \"I disagreed with my tech lead once about something but we worked it out.\"\n\nSTAR REWRITE:\n• Situation: During a sprint planning, my tech lead proposed using GraphQL for a simple internal dashboard that had 3 endpoints.\n• Task: I needed to present my case for REST without undermining the lead's authority or creating team friction.\n• Action: I prepared a one-page comparison (development time, team familiarity, maintenance overhead) and requested a 15-min slot to present it. I acknowledged GraphQL's strengths for complex data-fetching while showing REST would save ~2 weeks of development for this specific use case.\n• Result: The lead appreciated the structured approach, we went with REST, delivered 10 days early, and the lead later cited my approach as a model for healthy technical disagreements in the team retro.",
  ],
  learningRoadmap: {
    topicsToStudy: [
      "Database indexing strategies — understand B-tree vs. hash indexes, composite indexes, and when to use EXPLAIN ANALYZE to profile slow queries.",
      "RESTful API design patterns — study resource naming conventions, proper HTTP status codes, pagination strategies, and API versioning approaches.",
      "Testing pyramid fundamentals — learn the balance between unit tests (70%), integration tests (20%), and E2E tests (10%), using Jest and Playwright.",
    ],
    resourcesToWatch: [
      "\"System Design Interview\" by Gaurav Sen — YouTube playlist covering database scaling, caching, and load balancing.",
      "\"Node.js API Masterclass\" by Traversy Media — hands-on REST API build with Express, PostgreSQL, and JWT auth.",
      "\"Testing JavaScript\" by Kent C. Dodds — comprehensive guide to testing React and Node applications effectively.",
    ],
    milestones: [
      "Week 1–2: Complete SQLBolt exercises and build a PostgreSQL-backed REST API with proper indexing; write a blog post explaining your indexing decisions.",
      "Week 3–4: Add a full test suite (unit + integration) to your API project; aim for 80%+ coverage and practice TDD on at least 3 endpoints.",
      "Week 5–6: Build a small full-stack app (React + Node + PostgreSQL) with CI/CD via GitHub Actions; deploy to a cloud provider and document the architecture.",
    ],
  },
  aiGenerated: true,
  evaluatedAt: "2025-03-15T10:30:00Z",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SamplePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
            Sample Report
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Banner */}
        <div className="mb-10 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent p-6 text-center">
          <p className="mb-1 text-lg font-bold text-yellow-400">
            📄 This is a sample of the Premium Readiness Report
          </p>
          <p className="text-sm text-zinc-400">
            All data below is fictional. Your report will be personalized to your
            exact interview answers, career gap analysis, and target role.
          </p>
        </div>

        {/* Roadmap preview */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <p className="mb-2 font-mono text-sm text-zinc-500">
              Career Blueprint
            </p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-zinc-400">
                {SAMPLE_ROADMAP.input.currentRole}
              </span>
              <span className="mx-3 text-zinc-600">→</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {SAMPLE_ROADMAP.input.targetRole}
              </span>
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
              <span>⏱ {SAMPLE_ROADMAP.result.estimatedTimeline}</span>
              <span>•</span>
              <span>
                {SAMPLE_ROADMAP.input.experience} years experience
              </span>
              <span>•</span>
              <span>
                {SAMPLE_ROADMAP.input.skills.length} current skills
              </span>
            </div>
          </div>

          {/* Phase cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_ROADMAP.result.roadmap.map((step) => {
              const configs: Record<
                string,
                {
                  icon: string;
                  gradient: string;
                  border: string;
                  badge: string;
                }
              > = {
                Foundation: {
                  icon: "🧱",
                  gradient: "from-amber-500/10 to-orange-500/5",
                  border: "border-amber-500/20",
                  badge: "bg-amber-500/15 text-amber-400",
                },
                Execution: {
                  icon: "⚡",
                  gradient: "from-blue-500/10 to-cyan-500/5",
                  border: "border-blue-500/20",
                  badge: "bg-blue-500/15 text-blue-400",
                },
                Authority: {
                  icon: "👑",
                  gradient: "from-purple-500/10 to-pink-500/5",
                  border: "border-purple-500/20",
                  badge: "bg-purple-500/15 text-purple-400",
                },
              };
              const config = configs[step.title] ?? {
                icon: "📍",
                gradient: "from-zinc-500/10 to-zinc-500/5",
                border: "border-zinc-500/20",
                badge: "bg-zinc-500/15 text-zinc-400",
              };

              return (
                <div
                  key={step.phase}
                  className={`rounded-2xl border bg-gradient-to-br p-6 ${config.gradient} ${config.border}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-2xl">{config.icon}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium ${config.badge}`}
                    >
                      Phase {step.phase}
                    </span>
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mb-4 font-mono text-sm text-zinc-500">
                    {step.duration}
                  </p>
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Skills to Develop
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {step.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Resources
                    </p>
                    <ul className="space-y-1">
                      {step.resources.map((r) => (
                        <li
                          key={r}
                          className="text-sm text-zinc-400 leading-relaxed"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                    <p className="text-xs text-zinc-500">🏁 Milestone</p>
                    <p className="text-sm font-medium text-zinc-300">
                      {step.milestone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-400">
            ✨ Premium Deep-Dive Below
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* Interview evaluation */}
        <SampleReportClient
          evaluation={SAMPLE_EVALUATION}
          currentRole={SAMPLE_ROADMAP.input.currentRole}
          targetRole={SAMPLE_ROADMAP.input.targetRole}
          estimatedTimeline={SAMPLE_ROADMAP.result.estimatedTimeline}
        />

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            Ready for your personalized report?
          </h2>
          <p className="mb-6 text-zinc-400">
            Generate your free career blueprint, take the mock interview, and
            unlock your own deep-dive feedback for just $9.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30"
          >
            Get Your Blueprint →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center text-sm text-zinc-600">
          <p>
            <Link href="/" className="transition hover:text-zinc-400">
              SkillBridge
            </Link>{" "}
            — Career blueprints, engineered.
          </p>
        </div>
      </footer>
    </div>
  );
}
