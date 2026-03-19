export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  readingTime: string;
  tags: string[];
  content: string; // HTML content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-become-a-staff-engineer",
    title: "How to Become a Staff Engineer: A Realistic Roadmap for 2026",
    description:
      "The jump from Senior to Staff Engineer is the hardest promotion in tech. Here's what actually matters — from engineers who've made the leap.",
    publishedAt: "2026-03-19",
    author: "SkillBridge",
    readingTime: "8 min read",
    tags: ["staff engineer", "career growth", "engineering leadership"],
    content: `
<p>Ask ten Senior Engineers what a Staff Engineer <em>does</em>, and you'll get ten different answers. That's part of the problem. The role is poorly defined, inconsistently leveled across companies, and almost never taught.</p>

<p>But here's what's consistent: <strong>the jump from Senior to Staff is the single hardest promotion in software engineering.</strong> It's not about writing more code. It's about changing the kind of problems you solve.</p>

<h2>Why Most Senior Engineers Get Stuck</h2>

<p>The skills that made you a great Senior Engineer — deep technical expertise, fast execution, reliable delivery — are necessary but insufficient for Staff. The gap isn't technical. It's <strong>strategic</strong>.</p>

<p>Staff Engineers operate at the intersection of technology and business. They don't just build what's asked — they figure out what <em>should</em> be built. That requires a completely different toolkit:</p>

<ul>
<li><strong>Systems thinking over component thinking.</strong> You stop optimizing individual services and start optimizing how the entire system evolves over 2–3 years.</li>
<li><strong>Influence over authority.</strong> You'll rarely have direct reports. Your impact comes from convincing teams, writing design docs that change direction, and mentoring without a formal title.</li>
<li><strong>Problem selection over problem solving.</strong> The hardest part isn't solving the problem — it's knowing which problem is worth solving.</li>
</ul>

<h2>The Three Phases of the Transition</h2>

<h3>Phase 1: Foundation (Months 1–3)</h3>

<p>Before you can lead technical direction, you need to see the full picture. This means:</p>

<ul>
<li>Read every architecture decision record (ADR) your org has written. Understand <em>why</em> decisions were made, not just what was decided.</li>
<li>Map your company's technical landscape. Which systems are load-bearing? Where are the hidden dependencies? What's the oldest, scariest code?</li>
<li>Start writing. RFCs, design docs, post-mortems. Staff Engineers are prolific writers because writing is thinking, and thinking is their job.</li>
</ul>

<h3>Phase 2: Execution (Months 3–8)</h3>

<p>Now you need to demonstrate Staff-level impact without the title:</p>

<ul>
<li><strong>Lead a cross-team technical initiative.</strong> Not a feature — a migration, a platform improvement, a reliability project that spans multiple teams.</li>
<li><strong>Become the go-to person for a domain.</strong> Not because you gatekeep knowledge, but because you actively share it. Write internal docs. Give tech talks. Review designs from other teams.</li>
<li><strong>Make one bet that saves the company real money or time.</strong> Staff promotions require evidence of outsized impact. "I refactored this service" won't cut it. "I identified and led the migration that reduced our infra costs by 30%" will.</li>
</ul>

<h3>Phase 3: Authority (Months 8–14)</h3>

<p>At this point, you should be operating at Staff level even if the title hasn't caught up:</p>

<ul>
<li><strong>Your technical judgment is trusted by leadership.</strong> PMs and Directors come to you when making build-vs-buy decisions.</li>
<li><strong>You've mentored at least 2–3 engineers</strong> who can point to specific ways you accelerated their growth.</li>
<li><strong>You have a "body of work"</strong> — a portfolio of design docs, shipped projects, and strategic decisions that tell a coherent story about your impact.</li>
</ul>

<h2>The Skills That Actually Matter</h2>

<p>Based on hundreds of career roadmaps we've analyzed, here are the most common skill gaps for Senior Engineers targeting Staff:</p>

<ol>
<li><strong>System Design at Scale</strong> — Not just "design a URL shortener" interview prep, but real distributed systems thinking. Read "Designing Data-Intensive Applications" if you haven't.</li>
<li><strong>Technical Communication</strong> — Writing clear RFCs, presenting to non-technical stakeholders, distilling complex tradeoffs into actionable recommendations.</li>
<li><strong>Organizational Awareness</strong> — Understanding how your company makes decisions, where budget comes from, and what leadership actually cares about.</li>
<li><strong>Mentorship</strong> — The ability to accelerate others without doing the work for them.</li>
<li><strong>Strategic Thinking</strong> — Connecting technical decisions to business outcomes. "We should use Kafka" is engineering. "We should use Kafka because our event throughput will 10x in Q3 based on the sales pipeline" is Staff-level thinking.</li>
</ol>

<h2>How Long Does It Take?</h2>

<p>Honestly? 12–18 months of intentional effort <em>after</em> you've been a strong Senior for 2+ years. The "intentional" part is key — many engineers spend 5+ years as Senior without progressing because they're optimizing depth instead of breadth.</p>

<p>The fastest path is having a clear roadmap: know exactly which gaps to close, in what order, and what "done" looks like for each one.</p>

<h2>Start With Your Gaps</h2>

<p>Every transition is different. A Senior Frontend Engineer targeting Staff has different gaps than a Senior Backend Engineer. Your current skills, your company's engineering culture, and your specific target role all matter.</p>

<p>The first step is always the same: <strong>figure out exactly where you are and where you need to be.</strong> Then close the gaps systematically.</p>
`,
  },
  {
    slug: "career-roadmap-software-engineer",
    title: "How to Build a Career Roadmap as a Software Engineer",
    description:
      "Most engineers don't have a career plan. Here's a framework for building one that actually works — whether you're junior or senior.",
    publishedAt: "2026-03-19",
    author: "SkillBridge",
    readingTime: "6 min read",
    tags: ["career roadmap", "software engineer", "career planning"],
    content: `
<p>Here's an uncomfortable truth: <strong>most software engineers spend more time planning a sprint than planning their career.</strong></p>

<p>They pick up whatever skills their current job requires, learn frameworks because they're trending on Twitter, and hope that "being good at code" is enough. For a while, it is. Then they look up one day and realize they've been a Mid-level Engineer for four years with no clear path forward.</p>

<p>A career roadmap fixes this. Not a vague "5-year plan" that becomes irrelevant in 6 months — a specific, skill-based roadmap that tells you exactly what to learn next.</p>

<h2>Why Skill-Based Planning Beats Title-Based Planning</h2>

<p>Most career advice says: "Set a goal title and work toward it." Become a Senior Engineer. Then a Staff Engineer. Then a Director.</p>

<p>This is backwards. Titles are outcomes. Skills are inputs. And the same title means wildly different things at different companies.</p>

<p>A better approach:</p>

<ol>
<li><strong>Pick a target role</strong> (not just a title — a specific kind of work you want to do)</li>
<li><strong>Map the skills that role requires</strong> — talk to people in that role, read job postings, analyze what successful people in that role actually do</li>
<li><strong>Audit your current skills</strong> against that list</li>
<li><strong>Rank the gaps by impact</strong> — which missing skill would move the needle most?</li>
<li><strong>Close 2–3 gaps at a time</strong> — not everything at once</li>
</ol>

<p>This works because it's <em>specific</em>. "Become a better engineer" is a wish. "Learn system design patterns for distributed systems, practice writing RFCs, and lead one cross-team project this quarter" is a plan.</p>

<h2>The Three-Phase Framework</h2>

<p>Regardless of where you're starting or where you're going, career transitions follow a predictable pattern:</p>

<h3>🏗️ Foundation</h3>
<p>Fill the knowledge gaps. Take courses, read books, build side projects that exercise the specific skills you're missing. This is where most people spend too long — don't let "learning" become a way to avoid doing.</p>

<h3>⚡ Execution</h3>
<p>Apply what you've learned in real contexts. Take on stretch assignments at work. Contribute to open source in your target domain. Build things that create evidence of your new capabilities.</p>

<h3>👑 Authority</h3>
<p>Become known for your expertise. Write about it. Speak about it. Mentor others. This phase is about <em>visibility</em> — making sure the right people know you've made the transition.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Learning everything</h3>
<p>You don't need to know everything about your target role before pursuing it. You need to know the 3–5 things that matter most and be actively closing the remaining gaps. Hiring managers care about trajectory as much as current ability.</p>

<h3>Mistake 2: No timeline</h3>
<p>A roadmap without deadlines is a dream. Give each phase a duration. "Foundation: 2 months. Execution: 4 months. Authority: 3 months." Adjust as you go, but start with constraints.</p>

<h3>Mistake 3: Going alone</h3>
<p>Find someone who's already in your target role. Buy them coffee. Ask them what they wish they'd known. One conversation with the right person is worth 10 hours of blog reading.</p>

<h2>Get Specific</h2>

<p>The biggest career accelerator isn't working harder — it's knowing exactly which skills to develop and in what order. A personalized roadmap that accounts for your current skills, experience level, and target role is the difference between 6 months of progress and 2 years of wandering.</p>
`,
  },
  {
    slug: "skill-gap-analysis-career-change",
    title: "Skill Gap Analysis: The First Step in Any Career Change",
    description:
      "Before you start learning, figure out what's actually missing. A proper skill gap analysis saves months of wasted effort.",
    publishedAt: "2026-03-19",
    author: "SkillBridge",
    readingTime: "7 min read",
    tags: ["skill gap", "career change", "career transition"],
    content: `
<p>Everyone tells you to "upskill." Nobody tells you <em>which</em> skills to focus on.</p>

<p>The result? Engineers spend months learning things that don't move the needle. They take a Kubernetes course when their real gap is system design. They grind LeetCode when they actually need to learn how to communicate technical decisions to non-engineers.</p>

<p>A skill gap analysis cuts through the noise. It's a structured comparison between where you are now and where you want to be — and it tells you exactly what's missing.</p>

<h2>What Is a Skill Gap Analysis?</h2>

<p>At its simplest, a skill gap analysis answers three questions:</p>

<ol>
<li><strong>What skills does my target role require?</strong></li>
<li><strong>Which of those skills do I already have?</strong></li>
<li><strong>Which missing skills have the highest impact?</strong></li>
</ol>

<p>That third question is the one most people skip — and it's the most important. Not all gaps are equal. Some missing skills are blockers. Others are nice-to-haves that you can learn on the job.</p>

<h2>How to Do It Properly</h2>

<h3>Step 1: Define Your Target</h3>

<p>Be specific. "I want to be a manager" is too vague. "I want to be an Engineering Manager at a Series B startup managing a team of 5–8 engineers" is actionable. The more specific you are, the more useful the analysis.</p>

<h3>Step 2: Build the Skill Map</h3>

<p>Research what your target role actually requires. Three approaches that work:</p>

<ul>
<li><strong>Job postings:</strong> Read the last 15–20 postings for your target role. Write down every skill mentioned more than 3 times. That's what the market wants.</li>
<li><strong>Informational interviews:</strong> Talk to 3–5 people currently in the role. Ask: "What do you wish you'd known before starting? What skills do you use daily that surprised you?"</li>
<li><strong>Career frameworks:</strong> Many companies publish their engineering ladders. Look at Dropbox, Rent the Runway, CircleCI, or Buffer — they've all open-sourced their leveling frameworks.</li>
</ul>

<h3>Step 3: Honest Self-Assessment</h3>

<p>For each skill on your map, rate yourself honestly:</p>

<ul>
<li><strong>Strong:</strong> You could teach this to someone else</li>
<li><strong>Adequate:</strong> You can do it but wouldn't call it a strength</li>
<li><strong>Weak:</strong> You understand it conceptually but lack real experience</li>
<li><strong>Missing:</strong> You've never done this</li>
</ul>

<p>Your "Weak" and "Missing" skills are your gaps. But don't try to fix all of them.</p>

<h3>Step 4: Prioritize by Impact</h3>

<p>Ask yourself for each gap:</p>

<ul>
<li>Is this a <strong>blocker</strong>? (I literally can't do the job without it)</li>
<li>Is this a <strong>differentiator</strong>? (It would make me stand out)</li>
<li>Is this a <strong>nice-to-have</strong>? (I can learn it on the job)</li>
</ul>

<p>Focus on blockers first, then differentiators. Ignore nice-to-haves for now.</p>

<h2>Real Example: Frontend Engineer → Engineering Manager</h2>

<p>Let's say you're a Senior Frontend Engineer wanting to become an Engineering Manager. Your gap analysis might look like:</p>

<table>
<thead>
<tr><th>Skill</th><th>Current Level</th><th>Priority</th></tr>
</thead>
<tbody>
<tr><td>1:1 meetings / coaching</td><td>Missing</td><td>Blocker</td></tr>
<tr><td>Project planning / estimation</td><td>Weak</td><td>Blocker</td></tr>
<tr><td>Hiring / interviewing</td><td>Weak</td><td>Blocker</td></tr>
<tr><td>Performance reviews</td><td>Missing</td><td>Differentiator</td></tr>
<tr><td>Cross-team communication</td><td>Adequate</td><td>Differentiator</td></tr>
<tr><td>Budget management</td><td>Missing</td><td>Nice-to-have</td></tr>
<tr><td>Backend systems knowledge</td><td>Weak</td><td>Nice-to-have</td></tr>
</tbody>
</table>

<p>Now you know: spend the next 3 months on coaching skills, project planning, and interview training. Skip budget management entirely for now. That clarity is worth everything.</p>

<h2>The Cost of Skipping This Step</h2>

<p>Without a gap analysis, career changers typically waste 3–6 months learning the wrong things. They focus on what's comfortable (another technical course) instead of what's actually missing (soft skills, strategic thinking, domain knowledge).</p>

<p>The 2 hours it takes to do a proper gap analysis saves months of misdirected effort. Do it before you sign up for anything.</p>

<h2>Automate It</h2>

<p>If mapping all this manually sounds tedious — it is. That's why tools exist to do the analysis for you, comparing your current skills against your target role and generating a personalized roadmap with specific resources for each gap.</p>

<p>The important thing is that you do it. How you do it matters less.</p>
`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
