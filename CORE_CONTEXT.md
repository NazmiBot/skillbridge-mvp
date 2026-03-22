# CORE_CONTEXT.md — SkillBridge Long-Term Memory

> Last updated: 2026-03-22
> Maintainer: Nazmi (Lead Architect)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (Turbopack) | 16.1.6 |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| AI | Anthropic Claude Sonnet 4 | claude-sonnet-4-20250514 |
| Payments | Stripe | 20.4.1 |
| Email | Resend + React Email | 6.9.3 |
| Database | Upstash Redis (via ioredis) | 5.10.0 |
| Social | Twitter API v2 | 1.29.0 |
| PDF | jsPDF (client-side) | 4.2.0 |
| Hosting | Vercel (Hobby plan) | — |
| Domain | tryskillbridge.com | Not yet wired to Vercel |

### Shared Singletons & Modules (`lib/` — 15 files)
- `anthropic.ts` — Anthropic client
- `redis.ts` — ioredis client
- `stripe.ts` — Stripe client
- `resend.ts` — Resend client
- `cron.ts` — `verifyCron()` for all protected cron routes
- `ip.ts` — `getClientIp()` for rate limiting
- `rate-limit.ts` — Redis-backed sliding window rate limiter
- `twitter.ts` — Twitter API v2 client
- `career-data.ts` — 15 role profiles with fuzzy matching
- `x-content.ts` — 52-tweet bank + target accounts + topics
- `analytics.ts` — event tracking (roadmap saves, email unlocks, blog views)
- `blog.ts` — blog post helpers
- `phase-config.ts` — roadmap phase configuration
- `progress.ts` — progress tracking logic
- `types.ts` — shared TypeScript types

---

## Redis Key Structure

### Core Product
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `roadmap:{slug}` | String (JSON) | None | SavedRoadmap data |
| `interview:paid:{slug}` | String ("true") | None | Stripe payment flag |
| `interview:questions:{slug}` | String (JSON) | 30d | Cached interview questions |
| `interview:evaluation:{slug}` | String (JSON) | None | Cached evaluation result |

### 48-Hour Follow-Up System
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `roadmaps:created` | **Sorted Set** | Auto-pruned (7d) | Index of all roadmaps by creation timestamp (score = `Date.now()`) |
| `lead:{email}` | String (JSON) | 7d | Lead data with `roadmapSlug` reference |
| `lead:by-slug:{slug}` | String (email) | 7d | Reverse index: slug → email (O(1) lookup) |
| `followup:sent:{slug}` | String (ISO date) | None | Day 2 email sent flag |
| `followup:day5:{slug}` | String (ISO date) | None | Day 5 email sent flag |
| `report:emailed:{slug}` | String ("true") | 90d | Report email sent flag |

**How the 48h follow-up works:**
1. When a roadmap is saved (`/api/roadmap/save`), it's added to the `roadmaps:created` sorted set with `Date.now()` as score. Entries older than 7 days are pruned.
2. The follow-up cron (`/api/cron/follow-up`, daily @ 14:00 UTC) runs two queries:
   - **Day 2 window (24–48h):** `ZRANGEBYSCORE roadmaps:created (now-48h) (now-24h)` → sends insider tip email
   - **Day 5 window (96–144h):** `ZRANGEBYSCORE roadmaps:created (now-144h) (now-96h)` → sends case study email
3. For each slug, it looks up the email via `lead:by-slug:{slug}`, skips if already paid or already emailed.
4. Insider tips and case studies are generated live by Claude (with fallback text).

### SEO Blog
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `blog:post:{slug}` | String (JSON) | None | Full blog post content |
| `blog:posts` | Sorted Set | None | Blog index (score = publish timestamp) |
| `blog:used_topics` | String (JSON array) | None | Tracks used topic angles to rotate |

### X Automation
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `x:posted_tweets` | String (JSON array) | None | Indices of posted tweets from bank |
| `x:replies:{YYYY-MM-DD}` | String (counter) | None | Daily reply count (max 3) |
| `x:last_reply_time` | String (ISO date) | None | Timestamp of last reply |
| `x:activity_log` | List | Capped at 200 | Activity feed for /api/x/status |

### Progress Tracking
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `progress:{email}:{slug}` | String (JSON) | None | User's completed skills |
| `progress:subscribers` | Set | None | Emails subscribed to weekly nudges |

### Other
| Key Pattern | Type | TTL | Purpose |
|------------|------|-----|---------|
| `leads:count` | Counter | None | Total leads captured |
| `ratelimit:{action}:{ip}` | String (counter) | Varies | Rate limit tracking |

---

## SEO Blog Engine

**Cron:** `/api/cron/blog-post` — runs weekly Monday @ 09:00 UTC

**Flow:**
1. Loads `blog:used_topics` from Redis to avoid repeating angles
2. Picks a random unused topic from the 8-topic pool:
   - career transition, interview prep, skill development, engineering leadership
   - salary negotiation, remote work, portfolio building, burnout recovery
3. Calls Claude Sonnet 4 with HTML-only formatting instructions (no markdown)
4. Claude returns JSON: `{ title, description, tags, readingTime, heroImageQuery, sectionImageQueries, content }`
5. Generates slug from title, replaces `SECTION_IMAGE_1/2` placeholders with Unsplash URLs
6. Saves post to `blog:post:{slug}`, adds to `blog:posts` sorted set index
7. Marks the topic angle as used; pool resets when all 8 are exhausted
8. Supports `?preview=true` for dry runs

**Rendering:** `/blog` reads from `blog:posts` sorted set → dynamic SSR. `/blog/[slug]` loads from `blog:post:{slug}`. Three static seed articles exist from initial build.

---

## Project Scale

- **22 API routes** across checkout, cron, evaluation, generation, interviews, leads, progress, roadmaps, webhooks, and X automation
- **13 components** — CareerForm, CareerPaths, Footer, Header, HeroSection, HowItWorks, LoadingSkeleton, PhaseCard, ProgressTracker, RoadmapResults, ScoreChecker, Spinner, DownloadPDF
- **15 lib modules** — shared singletons, career data, analytics, blog, progress, types
- **12 pages** — home, blog (index + [slug]), explore, privacy, terms, sample, score/[id], roadmap/[slug] (view, interview, results, share)
- **5 email templates** via React Email

---

## Recent Changes (since 2026-03-20)

| Commit | Description |
|--------|-------------|
| `f8728ec` | **fix:** Replace deprecated Unsplash Source with Pexels API for tweet images |
| `cbfa795` | **feat:** Images on every tweet (bank + curiosity), punchier curiosity prompt (200-280 chars, mini-rant style), route renamed .ts→.tsx for JSX |
| `6fc3d78` | **fix:** Absolute OG image URLs on /r/[slug]/share — social crawlers now resolve images |
| `47f8afb` | **fix:** Email gate amnesia (localStorage flag `skillbridge_email_captured`) + PDF unicode corruption (strip emojis, replace → with ASCII) |

### Key Technical Notes
- **Tweet images:** Switched from `source.unsplash.com` (deprecated) to Pexels API. Bank tweets attach pillar-themed photos, curiosity tweets use inline `next/og` ImageResponse for stats images.
- **OG sharing:** Share pages now have proper `openGraph.images` + `twitter.images` metadata with absolute URLs.
- **PDF sanitization:** All PDF text stripped of emojis, unicode arrows replaced with ASCII. Phase accents use [F]/[E]/[A] markers.
- **Email gate:** Users who enter email at Authority gate no longer see duplicate PDF email modal (shared localStorage flag).

---

## Last 3 Commits

```
f8728ec fix: replace deprecated Unsplash Source with Pexels API for tweet images
cbfa795 feat: upgrade X tweets — images on every post + meatier curiosity tweets
6fc3d78 fix: add absolute OG image URLs to share page metadata
```

---

## Vercel Cron Schedule

| Time (UTC) | Route | Frequency | Purpose |
|------------|-------|-----------|---------|
| 09:00 Mon | `/api/cron/blog-post` | Weekly | Generate SEO article |
| 10:00 Mon | `/api/progress/nudge` | Weekly | Progress nudge emails to subscribers |
| 11:30 M-F | `/api/x/engage` | Weekdays | X engagement (reply to targets) |
| 14:00 daily | `/api/x/tweet` | Daily | Post from tweet bank |
| 14:00 daily | `/api/cron/follow-up` | Daily | Day 2 + Day 5 email sequences |
| 16:00 M-F | `/api/x/engage` | Weekdays | X engagement round 2 |
| 19:30 MWF | `/api/x/engage` | 3x/week | X engagement round 3 |
