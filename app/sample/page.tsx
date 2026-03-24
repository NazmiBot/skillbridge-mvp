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
    currentRole: "High School Teacher",
    targetRole: "HR Specialist",
    skills: ["Communication", "Conflict Resolution", "Scheduling", "Microsoft Office", "Training"],
    experience: 5,
  },
  result: {
    estimatedTimeline: "8–12 months",
    generatedAt: new Date().toISOString(),
    roadmap: [
      {
        phase: 1,
        title: "Learn the Basics",
        duration: "Months 1–3",
        skills: [
          "Employment Law Fundamentals",
          "HR Information Systems (HRIS)",
          "Recruiting & Onboarding Processes",
          "Compensation & Benefits Basics",
          "Workplace Compliance (OSHA, EEOC)",
        ],
        resources: [
          "SHRM Essentials of HR Management — shrm.org",
          "The HR Answer Book by Shawn Smith",
          "BambooHR Academy — free online courses",
        ],
        milestone:
          "Pass the SHRM-CP practice exam with 70%+ and complete a mock employee onboarding workflow.",
      },
      {
        phase: 2,
        title: "Build Real Experience",
        duration: "Months 4–8",
        skills: [
          "Employee Relations & Conflict Mediation",
          "Performance Review Processes",
          "HR Analytics & Reporting",
          "Interview Coordination & Screening",
          "Policy Writing & Documentation",
        ],
        resources: [
          "Volunteer HR support for a local nonprofit",
          "LinkedIn Learning — HR Foundations Certificate",
          "HR Open Source community — hropensource.org",
        ],
        milestone:
          "Complete a 3-month HR volunteer or internship role and build a portfolio of HR documents you've created.",
      },
      {
        phase: 3,
        title: "Become the Expert",
        duration: "Months 9–12",
        skills: [
          "Talent Development & Succession Planning",
          "HR Strategy & Organizational Design",
          "Diversity, Equity & Inclusion Programs",
          "Change Management",
          "HR Budget Management",
        ],
        resources: [
          "SHRM-CP Certification prep course",
          "HR Bartender blog — hrbartender.com",
          "Join your local SHRM chapter for networking",
        ],
        milestone:
          "Land your first HR role and earn SHRM-CP certification within your first year.",
      },
    ],
  },
};

const SAMPLE_EVALUATION = {
  score: 62,
  summary:
    "You bring strong people skills from your teaching background and communicate with warmth and clarity. However, your answers lack specific HR terminology and measurable outcomes. You need to translate your classroom management experience into HR language — your skills transfer more than you realize, but you need to frame them differently.",
  strengths: [
    "Excellent communication skills — you explained complex situations clearly and concisely, a critical skill for HR professionals.",
    "Strong conflict resolution instincts from managing a classroom of 30+ students — you naturally de-escalate tensions.",
    "Genuine empathy and active listening — your answer about helping a struggling student showed the people-first mindset HR teams need.",
    "Organized and process-oriented — your description of managing lesson plans and parent meetings translates directly to HR workflows.",
  ],
  weaknesses: [
    "Answers lacked measurable results — 'it went well' needs to become 'reduced parent complaints by 40% over one semester.'",
    "Limited knowledge of HR-specific processes — when asked about onboarding, the response was too general. Study real onboarding checklists.",
    "No mention of employment law or compliance — even basic awareness of EEOC guidelines and at-will employment would strengthen your answers.",
    "The question about handling a workplace policy violation received a classroom-based answer — practice reframing your teaching experience in corporate terms.",
  ],
  starRewrites: [
    "QUESTION: \"Tell me about a time you resolved a conflict between two people.\"\n\nORIGINAL (weak): \"I had two students who didn't get along and I talked to them and they worked it out.\"\n\nSTAR REWRITE:\n• Situation: Two students in my 10th-grade class had an ongoing conflict that was disrupting the learning environment and affecting 28 other students.\n• Task: I needed to resolve the conflict while maintaining a safe classroom and following school mediation policies.\n• Action: I scheduled individual meetings with each student to hear their perspective, then facilitated a joint mediation session using active listening techniques. I documented the agreements they made and scheduled two follow-up check-ins over the next month.\n• Result: The conflict was fully resolved within two weeks. Classroom disruptions dropped by 60%, and both students' grades improved by one letter grade that quarter. The principal later asked me to train other teachers on my mediation approach.",
    "QUESTION: \"How would you handle an employee who's consistently underperforming?\"\n\nORIGINAL (weak): \"I would talk to them and try to help them improve.\"\n\nSTAR REWRITE:\n• Situation: In my teaching role, I had a teaching assistant who was consistently missing deadlines for grading assignments, which affected 120 students across 4 classes.\n• Task: I needed to address the performance issue while maintaining a positive working relationship and following school HR procedures.\n• Action: I scheduled a private one-on-one meeting, documented specific instances with dates, and asked open-ended questions to understand root causes. Together we created a 30-day improvement plan with clear weekly milestones and check-ins every Friday.\n• Result: The TA met all milestones within 3 weeks, grading turnaround time improved from 2 weeks to 3 days, and they were later promoted to lead TA the following semester.",
  ],
  learningRoadmap: {
    topicsToStudy: [
      "Employment law basics — understand at-will employment, FMLA, ADA accommodations, and anti-discrimination laws (Title VII).",
      "HRIS systems — get comfortable with BambooHR or Workday through free trials and demo environments.",
      "HR metrics and analytics — learn to track turnover rate, time-to-hire, employee satisfaction scores, and cost-per-hire.",
    ],
    resourcesToWatch: [
      "\"HR Basics\" by GreggU on YouTube — clear, beginner-friendly explanations of core HR concepts.",
      "\"Josh Bersin Academy\" — industry-leading HR learning platform with career changer tracks.",
      "\"The HR Bartender\" blog and podcast — practical, real-world HR advice for people entering the field.",
    ],
    milestones: [
      "Week 1–2: Complete the SHRM Essentials online course and create a glossary of 50 HR terms you need to know.",
      "Week 3–4: Set up a BambooHR free trial, create a mock company with 20 employees, and practice running reports.",
      "Week 5–6: Rewrite 5 of your teaching accomplishments using HR language and measurable outcomes. Use these as your interview answer bank.",
    ],
  },
  aiGenerated: true,
  evaluatedAt: "2026-03-15T10:30:00Z",
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
              Career Roadmap
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
                "Learn the Basics": {
                  icon: "📖",
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
                "Build Real Experience": {
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
                "Become the Expert": {
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
            Build your free career roadmap, take the mock interview, and
            unlock your own deep-dive feedback for just $9.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30"
          >
            Build Your Roadmap →
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
            — Career roadmaps for real people.
          </p>
        </div>
      </footer>
    </div>
  );
}
