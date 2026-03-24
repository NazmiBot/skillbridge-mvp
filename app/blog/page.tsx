import Link from "next/link";
import { getAllPosts, formatBlogDate } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// Re-render on each request so Redis-stored posts appear immediately
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — SkillBridge | Career Roadmap Insights",
  description:
    "Practical career advice for people changing careers. Roadmaps, transferable skills, and strategies for your next chapter.",
  openGraph: {
    title: "Blog — SkillBridge",
    description:
      "Practical career advice for people changing careers. Roadmaps, transferable skills, and strategies for your next chapter.",
    type: "website",
    siteName: "SkillBridge",
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-2 font-mono text-sm text-blue-400">Blog</p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Career Insights
          </h1>
          <p className="text-lg text-zinc-400">
            Practical advice for career changers — real strategies, no fluff.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
                <time dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>

              <h2 className="mb-2 text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition">
                {post.title}
              </h2>

              <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                {post.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
