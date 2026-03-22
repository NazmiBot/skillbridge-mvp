import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts, getAllPostsStatic, formatBlogDate } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogTracker from "./blog-tracker";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  // Only static bank posts get pre-rendered; Redis posts are rendered on-demand
  return getAllPostsStatic().map((post) => ({ slug: post.slug }));
}

// Allow dynamic blog posts from Redis to be rendered on-demand
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found — SkillBridge" };

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";

  return {
    title: `${post.title} — SkillBridge`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      siteName: "SkillBridge",
      images: [
        {
          url: `${baseUrl}/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <BlogTracker slug={slug} />

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-sm text-zinc-500 transition hover:text-blue-400"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed">
            {post.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Hero image */}
        {post.heroImage && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.heroImage}
              alt={post.heroAlt || post.title}
              className="w-full h-auto object-cover"
              style={{ maxHeight: "400px" }}
            />
          </div>
        )}

        {/* Article body */}
        <article
          className="prose prose-invert prose-zinc max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
            prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
            prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-li:text-zinc-300 prose-li:leading-relaxed
            prose-strong:text-white prose-strong:font-semibold
            prose-em:text-zinc-200
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-table:border-white/10
            prose-th:border-white/10 prose-th:text-zinc-300 prose-th:font-semibold
            prose-td:border-white/10 prose-td:text-zinc-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA — Blog-to-Roadmap Bridge */}
        <div className="relative mt-16 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.04] to-indigo-500/[0.08] p-10 text-center sm:p-12">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="relative">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-purple-400">
              Your move
            </p>
            <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Stop guessing your next career move.
            </h3>
            <p className="mx-auto mb-8 max-w-lg text-base text-zinc-400">
              Build your free AI-powered career roadmap in 10 seconds.
              Personalized skills, real resources, concrete milestones — no signup required.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-purple-500/25 transition hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-[0.98]"
            >
              Generate Free Roadmap →
            </Link>
            <p className="mt-4 text-xs text-zinc-600">
              Free • 10 seconds • No account needed
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
