import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExploreGrid from "./explore-grid";

export const metadata: Metadata = {
  title: "Explore Career Roadmaps | SkillBridge",
  description:
    "Browse real career roadmaps created by SkillBridge users. See how others are navigating career changes — teachers to HR, marketers to UX, and more.",
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
    const res = await fetch(`${baseUrl}/api/explore`, {
      next: { revalidate: 300 },
    });
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
            Explore Career Roadmaps
          </h1>
          <p className="mx-auto max-w-lg text-base text-zinc-400">
            Real roadmaps from real career transitions. Get inspired, then{" "}
            <a
              href="/"
              className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
            >
              create yours
            </a>
            .
          </p>
        </div>

        <ExploreGrid roadmaps={roadmaps} />
      </main>
      <Footer />
    </div>
  );
}
