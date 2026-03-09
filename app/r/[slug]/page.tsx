import { notFound } from "next/navigation";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ slug: string }>;

const phaseConfig: Record<
  string,
  { icon: string; gradient: string; border: string; badge: string }
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

async function getRoadmap(slug: string): Promise<SavedRoadmap | null> {
  try {
    const db = getRedis();
    const data = await db.get(`roadmap:${slug}`);
    if (!data) return null;
    return JSON.parse(data) as SavedRoadmap;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap Not Found — SkillBridge" };

  const title = `${roadmap.input.currentRole} → ${roadmap.input.targetRole} | SkillBridge`;
  const description = `A personalized ${roadmap.result.estimatedTimeline} career roadmap from ${roadmap.input.currentRole} to ${roadmap.input.targetRole}. Built with SkillBridge.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "SkillBridge",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedRoadmap({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) notFound();

  const { input, result } = roadmap;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-500">
            Shared Blueprint
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-sm text-zinc-500">Career Blueprint</p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-zinc-400">{input.currentRole}</span>
            <span className="mx-3 text-zinc-600">→</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {input.targetRole}
            </span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
            <span>⏱ {result.estimatedTimeline}</span>
            <span>•</span>
            <span>{input.experience} years experience</span>
            <span>•</span>
            <span>{input.skills.length} current skills</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.roadmap.map((step) => {
            const config = phaseConfig[step.title] ?? {
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
                        className="flex items-center gap-2 text-sm text-zinc-400"
                      >
                        <span className="text-zinc-600">→</span> {r}
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

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
          >
            Generate Your Own Blueprint →
          </Link>
          <p className="mt-3 text-sm text-zinc-600">
            Free • Takes 10 seconds • No signup required
          </p>
        </div>
      </main>
    </div>
  );
}
