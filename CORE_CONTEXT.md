# CORE_CONTEXT.md — SkillBridge Long-Term Memory

> Last updated: 2026-03-24
> Maintainer: Nazmi (Lead Architect)

---

## Product Positioning

**Target audience:** Career changers — people transitioning between fields (teacher→HR, retail→sales, designer→marketing, barista→customer success). NOT primarily developers.

**Value prop:** "Your next career move, mapped out." — Personalized 3-phase career roadmaps for people who feel lost and need a clear path.

**Revenue:** $9 mock interview evaluation.

**Phase names:** Learn the Basics → Build Real Experience → Become the Expert

**Voice:** 8th-grade reading level, zero jargon, warm and practical. Transferable skills are a core theme.

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

### Shared Singletons & Modules (`lib/` — 16 files)
- `anthropic.ts` — Anthropic client
- `redis.ts` — ioredis client
- `stripe.ts` — Stripe client
- `resend.ts` — Resend client
- `cron.ts` — `verifyCron()` for all protected cron routes
- `ip.ts` — `getClientIp()` for rate limiting
- `rate-limit.ts` — Redis-backed sliding window rate limiter
- `twitter.ts` — Twitter API v2 client
- `career-data.ts` — **25 role profiles** with fuzzy matching (15 tech + 10 non-tech)
- `x-content.ts` — 52-tweet bank + target accounts + topics (career changer voice)
- `analytics.ts` — event tracking (roadmap saves, email unlocks, blog views)
- `blog.ts` — blog post helpers
- `phase-config.ts` — roadmap phase configuration
- `progress.ts` — progress tracking logic
- `types.ts` — shared TypeScript types
- `validate-input.ts` — profanity filter, keyboard smash detection, input validation

---

## Career Profiles (25 total)

### Tech (15 — original)
senior-frontend-engineer, staff-engineer, engineering-manager, data-scientist, product-manager, devops-engineer, ux-designer, backend-engineer, fullstack-engineer, cybersecurity-engineer, ai-ml-engineer, cto, data-engineer, mobile-engineer, digital-marketer

### Non-Tech (10 — added Sprint 1, 2026-03-24)
hr-specialist, sales-representative, project-manager-general, marketing-coordinator, customer-success-manager, operations-manager, financial-analyst, ux-writer, recruiter, event-planner

**Categories:** engineering, design, data, product, management, devops, security, marketing, ai, hr, sales, operations, finance, creative

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

## Sample Roadmaps (seeded 2026-03-24)

4 non-tech sample roadmaps in Redis and on `/explore`:
- `teacher-to-hr-specialist` — Teacher → HR Specialist
- `retail-manager-to-b2b-sales` — Retail Manager → B2B Sales Rep
- `graphic-designer-to-marketing` — Graphic Designer → Marketing Coordinator
- `barista-to-customer-success` — Barista → Customer Success Manager

---

## SEO Blog Engine

**Cron:** `/api/cron/blog-post` — runs weekly Monday @ 09:00 UTC

**Topic Pool (updated 2026-03-24 — career changer focus):**
1. Career change guide (step-by-step transitions)
2. Transferable skills (undervalued everyday skills)
3. Interview confidence (career changer interview prep)
4. "Is it too late" (age and career change data)
5. First 90 days (starting in a new field)
6. Career change anxiety (emotional side, imposter syndrome)
7. Salary in new career (financial reality, negotiation)
8. Skills roadmap (building a learning plan)

**Flow:**
1. Loads `blog:used_topics` from Redis to avoid repeating angles
2. Picks a random unused topic from the 8-topic pool
3. Calls Claude Sonnet 4 with HTML-only formatting, warm/practical voice for career changers
4. Claude returns JSON: `{ title, description, tags, readingTime, heroImageQuery, sectionImageQueries, content }`
5. Generates slug from title, replaces `SECTION_IMAGE_1/2` placeholders with URLs from a curated Unsplash photo pool
6. Saves post to `blog:post:{slug}`, adds to `blog:posts` sorted set index
7. Marks the topic angle as used; pool resets when all 8 are exhausted

**Rendering:** `/blog` reads from `blog:posts` sorted set → dynamic SSR. `/blog/[slug]` loads from `blog:post:{slug}`. Three static seed articles exist from initial build.

---

## X (Twitter) Automation

**Tweet Bank:** 52 tweets targeting career changers (updated 2026-03-24)
- 40% wisdom — transferable skills, career mindset, "you're not starting from zero"
- 30% insight — job market reality for career changers, hiring patterns
- 20% tips — practical career change tactics, interview prep, skill mapping
- 10% engagement — polls, questions, "what career change are you considering?"

**Target Accounts:** simonsinek, AdamMGrant, JamesClear, SahilBloom, RamseyShow, levelsio, ShelcyJoseph, IAmMarkManson, austinkleon, MelRobbins

**Relevant Topics:** 26 career-change-focused keywords (career change, career pivot, transferable skills, starting over, etc.)

---

## Email Templates (5)

All emails use "Career roadmaps for real people." tagline. Default examples: Teacher → HR Specialist.

| Template | Trigger | Purpose |
|----------|---------|---------|
| `BlueprintEmail` | Email gate unlock | Sends full roadmap with 3 phases |
| `FollowUpEmail` | Day 2 cron (24-48h) | Insider tip + mock interview CTA |
| `CaseStudyEmail` | Day 5 cron (96-144h) | Career change success story + CTA |
| `NudgeEmail` | Weekly Monday cron | Progress nudge with completion % |
| `ReportEmail` | Post-evaluation | Score, strengths, weaknesses summary |

---

## Project Scale

- **23 API routes** across checkout, cron, evaluation, generation, interviews, leads, progress, roadmaps, stats, webhooks, and X automation
- **13 components** — CareerForm, CareerPaths, Footer, Header, HeroSection, HowItWorks, LoadingSkeleton, PhaseCard, ProgressTracker, RoadmapResults, ScoreChecker, Spinner, DownloadPDF
- **16 lib modules** — shared singletons, career data (25 profiles), analytics, blog, progress, types, validate-input
- **12 pages** — home, blog (index + [slug]), explore, privacy, terms, sample, score/[id], roadmap/[slug] (view, interview, results, share)
- **5 email templates** via React Email
- **3 utility scripts** — `scripts/purge-explore.mjs`, `scripts/backup-redis.mjs`, `scripts/seed-samples.mjs`
- **9 explore categories** — Business & Sales, Human Resources, Marketing & Creative, Operations, Finance, Tech, Leadership, Healthcare, Education

---

## AI Prompts Summary

### Roadmap Generation (`/api/generate`)
- 8th-grade reading level, plain language
- Explicitly identifies transferable skills from current role
- Phase names: "Learn the Basics", "Build Real Experience", "Become the Expert"
- Resources: accessible (free YouTube, affordable courses, practical projects)
- R-or-Fail STAR rubric on evaluation

### Interview Questions (`/api/interview/[slug]`)
- "Friendly but thorough career coach" persona
- Plain conversational language, avoids jargon
- STAR explained as storytelling: "What was happening? What did you need to do? What did you do? What was the result?"

### Evaluation (`/api/evaluate`)
- "Hiring Manager from Hell" persona (still tough, but career-changer-aware)
- Recognizes transferable skills and potential, not just domain expertise
- Suggests accessible learning resources (YouTube, free courses)
- R-or-Fail rule: no measurable Result = capped at 40/100

### Blog Generation (`/api/cron/blog-post`)
- Warm, practical, jargon-free voice
- Written for someone Googling "how to change careers" at midnight
- HTML-only formatting, 1200-1800 words

---

## Recent Changes

| Commit | Date | Description |
|--------|------|-------------|
| `428ea6c` | 2026-03-24 | **feat:** Sprint 2 — 52 new career-changer tweets, new blog topics, all 5 email templates updated |
| `304f503` | 2026-03-24 | **feat:** Sprint 1 — 10 non-tech career profiles, landing page rewrite, Claude prompt overhaul, sample roadmaps |
| `8aa1bde` | 2026-03-23 | **fix:** Dark mode meta tags on all 5 email templates |
| `ea17662` | 2026-03-23 | **fix:** Replace dead `source.unsplash.com` with curated image pool for blog cron |
| `f4cce21` | 2026-03-22 | **feat:** Tier 3 — Redis backup script, sitemap enhancement, .gitignore backups |
| `8163939` | 2026-03-22 | **feat:** Tier 2 — blog-to-roadmap CTA bridge, explore page filter pills, sample report teaser |
| `80a5794` | 2026-03-22 | **fix:** Favicon — dark purple `#4f39c8` rounded square with white lowercase 's' |
| `fb0d229` | 2026-03-21 | **feat:** Tier 1 — CTA copy upgrade, social proof counter, blog relative dates |

### Key Technical Notes
- **Repositioning (2026-03-24):** Full pivot from developer-focused to career-changer audience. Landing page, AI prompts, tweet bank, blog topics, email templates all rewritten. Tech careers still fully supported — this is an additive change.
- **Tweet images:** Pexels API for bank tweets, `next/og` ImageResponse for curiosity tweets.
- **Blog images:** Curated pool of `images.unsplash.com/photo-*` URLs (source.unsplash.com is dead).
- **Email dark mode:** All 5 templates include `color-scheme: dark` meta tags.
- **OG sharing:** Share pages have proper `openGraph.images` + `twitter.images` metadata.
- **PDF sanitization:** Emojis stripped, unicode arrows → ASCII, phase accents use markers.
- **Input validation:** Zero-dependency profanity filter + keyboard smash detection.
- **Favicon:** `app/icon.tsx` (32×32) + `app/apple-icon.tsx` (180×180). Dark purple `#4f39c8`.
- **Social proof:** `/api/stats` → hero counter "Join X+ career changers building their next chapter"

---

## Rate Limiting

| Route | Limit | Window | Prefix |
|-------|-------|--------|--------|
| `/api/generate` | 3 | 24 hours | `generate` |
| `/api/score` | 20 | 1 hour | `score` |
| `/api/checkout` | 10 | 1 hour | `checkout` |
| `/api/leads` | 10 | 1 hour | `leads` |
| `/api/evaluate` | 5 | 1 hour | `evaluate` |
| `/api/send-report` | 5 | 1 hour | `send-report` |

Owner IPs whitelisted via `RATE_LIMIT_WHITELIST` env var.

---

## Redis Backup

**Script:** `scripts/backup-redis.mjs`
```bash
node scripts/backup-redis.mjs              # Full backup
node scripts/backup-redis.mjs --dry-run    # Scan + count only
node scripts/backup-redis.mjs --restore backups/redis-2026-03-22.json
```

---

## Env Keys (Vercel)
- ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET, TWITTER_BEARER_TOKEN
- CRON_SECRET, RESEND_API_KEY, REDIS_URL
- RATE_LIMIT_WHITELIST
- Always run `vercel env pull .env.local` to sync locally

---

## Vercel Cron Schedule

| Time (UTC) | Route | Frequency | Purpose |
|------------|-------|-----------|---------|
| 09:00 Mon | `/api/cron/blog-post` | Weekly | Generate SEO article (career changer topics) |
| 10:00 Mon | `/api/progress/nudge` | Weekly | Progress nudge emails to subscribers |
| 11:30 M-F | `/api/x/engage` | Weekdays | X engagement (reply to career change accounts) |
| 14:00 daily | `/api/x/tweet` | Daily | Post from career-changer tweet bank |
| 14:00 daily | `/api/cron/follow-up` | Daily | Day 2 + Day 5 email sequences |
| 16:00 M-F | `/api/x/engage` | Weekdays | X engagement round 2 |
| 19:30 MWF | `/api/x/engage` | 3x/week | X engagement round 3 |
