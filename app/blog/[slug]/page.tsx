import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
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
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

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
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">
            Ready to map your career transition?
          </h3>
          <p className="mb-6 text-sm text-zinc-400">
            Get a personalized 3-phase roadmap in 10 seconds. Free, no signup
            required.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:shadow-blue-500/40"
          >
            Generate My Career Blueprint →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
