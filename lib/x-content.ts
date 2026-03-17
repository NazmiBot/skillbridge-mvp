/**
 * Pre-written tweet bank organized by content pillar.
 * Each tweet is used once, then marked as posted in Redis.
 */

export const TWEET_BANK: { pillar: string; text: string }[] = [
  // ── Career Wisdom (40%) ──────────────────────────────────
  {
    pillar: "wisdom",
    text: "The biggest skill gap isn't technical — it's knowing what to learn next.",
  },
  {
    pillar: "wisdom",
    text: "Nobody got promoted by learning everything. They got promoted by learning the right things at the right time.",
  },
  {
    pillar: "wisdom",
    text: "Your career isn't a ladder. It's a map. And most people are walking without one.",
  },
  {
    pillar: "wisdom",
    text: "The difference between a junior and a senior isn't years — it's knowing which problems matter.",
  },
  {
    pillar: "wisdom",
    text: "Stop collecting certificates. Start collecting solved problems.",
  },
  {
    pillar: "wisdom",
    text: "The fastest way to get stuck in your career: optimize for your current role instead of your next one.",
  },
  {
    pillar: "wisdom",
    text: "Career advice nobody gives you: the skills that got you here won't get you there. Every level requires a different toolkit.",
  },
  {
    pillar: "wisdom",
    text: "Most people spend more time planning a vacation than planning their career. Then wonder why they feel lost.",
  },
  {
    pillar: "wisdom",
    text: "A 10-year career plan is useless. A 6-month skill plan is priceless.",
  },
  {
    pillar: "wisdom",
    text: "The best engineers I know aren't the smartest. They're the ones who figured out what to learn and what to skip.",
  },
  {
    pillar: "wisdom",
    text: "Unpopular opinion: career growth isn't about working harder. It's about closing the right skill gaps at the right time.",
  },
  {
    pillar: "wisdom",
    text: "You don't need 10 years of experience. You need 1 year of intentional growth, repeated.",
  },

  // ── Industry Insights (30%) ──────────────────────────────
  {
    pillar: "insight",
    text: "Companies say they want 'Senior Engineers' but the job description is 3 different roles.\n\nHere's how to decode it: look at the team size. Under 5? They want a generalist. Over 20? They want depth. Between? They don't know yet.",
  },
  {
    pillar: "insight",
    text: "The tech job market didn't get harder. It got more specific.\n\nGeneralists are competing with specialists. The fix isn't more skills — it's a clearer direction.",
  },
  {
    pillar: "insight",
    text: "AI won't replace developers. But developers who understand AI will replace those who don't.\n\nThe gap isn't coding ability. It's adaptability.",
  },
  {
    pillar: "insight",
    text: "Hot take: most 'career advice' on Twitter is survivorship bias disguised as strategy.\n\nWhat actually works? Mapping your specific gaps and closing them systematically.",
  },
  {
    pillar: "insight",
    text: "The most in-demand skill for 2026 isn't a programming language.\n\nIt's the ability to learn one quickly, apply it, and move on.",
  },
  {
    pillar: "insight",
    text: "Every senior engineer I've talked to says the same thing: 'I wish someone had told me what to focus on earlier.'\n\nThe information exists. The roadmap doesn't. That's the real problem.",
  },
  {
    pillar: "insight",
    text: "Hiring managers don't reject you for lacking skills.\n\nThey reject you for not showing a plan to acquire them. Growth trajectory > current ability.",
  },
  {
    pillar: "insight",
    text: "The 'learn to code' era is over.\n\nThe 'learn the right code at the right time for the right role' era just started.",
  },

  // ── Practical Tips (20%) ──────────────────────────────────
  {
    pillar: "tip",
    text: "Before your next interview, do this:\n\n1. Find 3 recent blog posts from the company's engineering team\n2. Reference them in your answers\n3. Watch the interviewer light up\n\nIt works because almost nobody does it.",
  },
  {
    pillar: "tip",
    text: "Simple framework for career planning:\n\n1. Pick your target role\n2. List every skill it requires\n3. Cross off what you already have\n4. Rank the gaps by impact\n5. Close the top 3\n\nThat's it. No 47-step process needed.",
  },
  {
    pillar: "tip",
    text: "How to answer 'Where do you see yourself in 5 years?' without sounding generic:\n\nDon't name a title. Name a skill set.\n\n'I want to be someone who can architect systems end-to-end and mentor the next generation of engineers.'",
  },
  {
    pillar: "tip",
    text: "The STAR method for interviews, simplified:\n\n• Situation — set the scene (2 sentences max)\n• Task — what was your specific job\n• Action — what YOU did (not the team)\n• Result — numbers. always numbers.\n\n70% of your answer should be Action + Result.",
  },
  {
    pillar: "tip",
    text: "Want to stand out in interviews?\n\nStop saying 'we' for everything.\n\nInterviewers want to know what YOU did. Use 'I led', 'I decided', 'I identified the issue.'\n\nBeing humble is good. Being invisible is not.",
  },
  {
    pillar: "tip",
    text: "Free career hack: read the last 10 job postings for your dream role.\n\nWrite down every skill mentioned more than 3 times.\n\nThat's your learning roadmap. The market is literally telling you what it wants.",
  },

  // ── Engagement / Community (10%) ──────────────────────────
  {
    pillar: "engagement",
    text: "What's the one skill you wish you'd learned 2 years earlier? 👇",
  },
  {
    pillar: "engagement",
    text: "Hot debate: Is it better to go deep in one technology or stay broad across many?\n\nDrop your take 👇",
  },
  {
    pillar: "engagement",
    text: "If you could restart your tech career knowing what you know now, what would you do differently?",
  },
  {
    pillar: "engagement",
    text: "The most underrated skill in tech is ______.\n\nFill in the blank 👇",
  },
  {
    pillar: "engagement",
    text: "Be honest: do you have a career plan, or are you just winging it?\n\n🗺️ = I have a plan\n🎲 = Making it up as I go",
  },
];

/** Target accounts for engagement (reply strategy) */
export const TARGET_ACCOUNTS = [
  // Tech Career / Leadership
  "levelsio",
  "swyx",
  "GergelyOrosz",
  "RandallKanna",
  "DThompsonDev",
  // Tech / Engineering
  "ThePrimeagen",
  "firaborgnern",
  "t3dotgg",
  // Motivation / Frameworks
  "SahilBloom",
  "JamesClear",
];

/** Topics we care about — used to filter tweets worth replying to */
export const RELEVANT_TOPICS = [
  "career",
  "skill",
  "interview",
  "developer",
  "engineer",
  "learning",
  "roadmap",
  "growth",
  "mentor",
  "senior",
  "junior",
  "promotion",
  "resume",
  "hire",
  "hiring",
  "job",
  "tech career",
  "career change",
  "career transition",
  "career advice",
  "career path",
  "upskill",
  "coding",
  "programming",
  "startup",
  "building",
];
