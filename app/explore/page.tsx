import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Explore Career Blueprints | SkillBridge",
  description: "Browse real career roadmaps created by SkillBridge users. See how others are planning their transition from junior to senior, engineer to manager, and more.",
};

interface RoadmapSummary {
  slug: string;
  currentRole: string;
  targetRole: string;
  estimatedTimeline: string;
  phases: string[];
  createdAt: string;
}

async function getRoadmaps(): Promise<RoadmapSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/explore`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ExplorePage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Explore Career Blueprints
          </h1>
          <p className="mx-auto max-w-lg text-base text-zinc-400">
            Real roadmaps from real career transitions. Get inspired, then{" "}
            <Link href="/" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">
              create yours
            </Link>.
          </p>
        </div>

        {roadmaps.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f14] p-12 text-center">
            <p className="text-lg text-zinc-500">No blueprints yet. Be the first!</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Create Blueprint →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {roadmaps.map((r) => (
              <Link
                key={r.slug}
                href={`/r/${r.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-[#0f0f14] p-6 transition hover:border-blue-500/30 hover:bg-[#12121a]"
              >
                <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
                  <span>{r.currentRole}</span>
                  <span className="text-zinc-700">→</span>
                  <span className="font-medium text-blue-400 group-hover:text-blue-300">{r.targetRole}</span>
                </div>
                <div className="mb-3 flex gap-2">
                  {r.phases.map((p, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-500"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>⏱ {r.estimatedTimeline}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
