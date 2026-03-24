import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getAnthropic } from "@/lib/anthropic";
import { verifyCron } from "@/lib/cron";

const TOPIC_POOL = [
  {
    angle: "career change guide",
    keywords: ["career change", "switching careers", "career transition guide"],
    prompt: "Write about the step-by-step process of changing careers. Focus on a specific non-tech transition (e.g., teacher to HR, retail to sales). Include timelines, what to expect, and common mistakes.",
  },
  {
    angle: "transferable skills",
    keywords: ["transferable skills", "skills that transfer", "career skills"],
    prompt: "Write about transferable skills that most career changers undervalue. Show how everyday job skills (managing customers, organizing schedules, training coworkers) translate to new careers.",
  },
  {
    angle: "interview confidence",
    keywords: ["interview tips", "career change interview", "mock interview"],
    prompt: "Write about how to ace interviews when you're switching careers. Focus on how to talk about your past experience in a way that's relevant to the new role. Include specific example answers.",
  },
  {
    angle: "is it too late",
    keywords: ["career change at 30", "career change at 40", "too late to switch careers"],
    prompt: "Write about why it's never too late to change careers. Include real data on career changers at different ages and practical advice for people who feel stuck because of their age.",
  },
  {
    angle: "first 90 days",
    keywords: ["new career first 90 days", "starting a new career", "career change plan"],
    prompt: "Write about what the first 90 days in a new career look like. Cover what to learn, who to connect with, and how to build credibility fast when you're the 'new person' in a field.",
  },
  {
    angle: "career change anxiety",
    keywords: ["career change fear", "afraid to switch careers", "career change anxiety"],
    prompt: "Write about the emotional side of career changes — fear, imposter syndrome, financial anxiety. Be real and practical, not just 'believe in yourself.' Include coping strategies that actually work.",
  },
  {
    angle: "salary in new career",
    keywords: ["career change salary", "salary negotiation new career", "pay cut career change"],
    prompt: "Write about the financial reality of career changes. When should you expect a pay cut? How do you negotiate when you're 'starting over'? Include specific strategies for maintaining your earning power.",
  },
  {
    angle: "skills roadmap",
    keywords: ["career roadmap", "learning plan career change", "skill gap career change"],
    prompt: "Write about how to build a learning roadmap for a career change. Cover how to identify which skills matter most, free and affordable resources, and how to prove your skills without formal credentials.",
  },
];

/**
 * GET /api/cron/blog-post — Vercel Cron handler (weekly)
 * POST /api/cron/blog-post — Manual trigger
 *
 * Generates a new SEO blog post via Claude and stores it in Redis.
 *
 * Query params:
 *   ?preview=true — generates but doesn't save
 */
export async function GET(req: NextRequest) { return handler(req); }
export async function POST(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preview = req.nextUrl.searchParams.get("preview") === "true";

  try {
    const db = getRedis();

    // Pick a topic we haven't used recently
    const usedRaw = await db.get("blog:used_topics");
    const usedAngles: string[] = usedRaw ? JSON.parse(usedRaw) : [];

    const available = TOPIC_POOL.filter((t) => !usedAngles.includes(t.angle));
    if (available.length === 0) {
      // Reset the pool
      await db.del("blog:used_topics");
      available.push(...TOPIC_POOL);
    }

    const topic = available[Math.floor(Math.random() * available.length)];

    // Generate the post via Claude
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: `You are a career advice writer for SkillBridge, a career roadmap tool for people changing careers. Write long-form blog posts that are genuinely helpful, SEO-optimized, and engaging. Write in a warm, practical, jargon-free voice — as if you're talking to someone Googling "how to change careers" at midnight.

RULES:
- Write in a direct, opinionated voice. Not corporate. Not generic.
- Use HTML tags for formatting: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>
- Include 4-6 <h2> sections with descriptive headings
- Total length: 1200-1800 words
- Open with a hook — a bold claim, surprising stat, or contrarian take
- Include specific, actionable advice — not vague platitudes
- End with a natural segue to "building your career roadmap" (don't hard-sell, just plant the seed)
- NO markdown. HTML only.
- NO links. NO images. Just formatted text.

OUTPUT FORMAT (JSON):
{
  "title": "SEO-optimized title (50-65 chars ideal)",
  "description": "Meta description for search results (140-160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": "X min read",
  "heroImageQuery": "one or two word Unsplash search term for the hero image",
  "sectionImageQueries": ["query1", "query2"],
  "content": "<p>Full HTML content...</p>"
}

For images: include 2 inline images in the content using this exact format:
<img src="SECTION_IMAGE_1" alt="descriptive alt text" style="width:100%;border-radius:12px;margin:24px 0;" />

Place them between major sections (after every 2-3 paragraphs). Use SECTION_IMAGE_1 and SECTION_IMAGE_2 as placeholders — they'll be replaced with real URLs.

Output ONLY the JSON. No explanation, no markdown fences.`,
      max_tokens: 4000,
      temperature: 0.85,
      messages: [
        {
          role: "user",
          content: `Write a blog post about: ${topic.prompt}\n\nTarget SEO keywords: ${topic.keywords.join(", ")}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Non-text response");

    const cleaned = block.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const post = JSON.parse(cleaned);

    // Generate slug from title
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80)
      .replace(/-$/, "");

    const today = new Date().toISOString().slice(0, 10);

    // Curated Unsplash photo pool (source.unsplash.com is deprecated/dead)
    const HERO_IMAGES = [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=500&fit=crop&q=80",
    ];
    const SECTION_IMAGES = [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop&q=80",
    ];

    // Pick random images from pool (avoid repeats within a post)
    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const heroUrl = pickRandom(HERO_IMAGES);
    const sectionImg1 = pickRandom(SECTION_IMAGES);
    let sectionImg2 = pickRandom(SECTION_IMAGES);
    if (sectionImg2 === sectionImg1) sectionImg2 = SECTION_IMAGES[(SECTION_IMAGES.indexOf(sectionImg1) + 1) % SECTION_IMAGES.length];

    // Replace section image placeholders with real Unsplash URLs
    let content = post.content;
    content = content.replace(/SECTION_IMAGE_1/g, sectionImg1);
    content = content.replace(/SECTION_IMAGE_2/g, sectionImg2);

    const blogPost = {
      slug,
      title: post.title,
      description: post.description,
      publishedAt: today,
      author: "SkillBridge",
      readingTime: post.readingTime || "7 min read",
      tags: post.tags || topic.keywords,
      heroImage: heroUrl,
      heroAlt: post.title,
      content,
      generatedBy: "claude",
      topic: topic.angle,
    };

    if (preview) {
      return NextResponse.json({ preview: true, post: blogPost });
    }

    // Save to Redis (no TTL — blog posts persist)
    await db.set(`blog:post:${slug}`, JSON.stringify(blogPost));

    // Add to the blog index (sorted set, score = publish timestamp)
    await db.zadd("blog:posts", Date.now(), slug);

    // Mark this topic as used
    usedAngles.push(topic.angle);
    await db.set("blog:used_topics", JSON.stringify(usedAngles));

    // Log activity
    await db.lpush(
      "x:activity_log",
      JSON.stringify({
        type: "blog_post_generated",
        slug,
        title: post.title,
        topic: topic.angle,
        timestamp: new Date().toISOString(),
      })
    );
    await db.ltrim("x:activity_log", 0, 199);

    return NextResponse.json({
      success: true,
      slug,
      title: post.title,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com"}/blog/${slug}`,
    });
  } catch (err) {
    console.error("[Blog Cron] Failed:", err);
    return NextResponse.json({ error: "Blog generation failed" }, { status: 500 });
  }
}
