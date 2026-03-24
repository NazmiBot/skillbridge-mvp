/**
 * Pre-written tweet bank organized by content pillar.
 * Each tweet is used once, then marked as posted in Redis.
 */

export const TWEET_BANK: { pillar: string; text: string }[] = [
  // ── Career Wisdom (40% — 21 tweets) ──────────────────────
  {
    pillar: "wisdom",
    text: "Your skills don't disappear when you change careers. A teacher who managed 30 kids is a project manager who doesn't know it yet.",
  },
  {
    pillar: "wisdom",
    text: "The scariest part of a career change isn't starting over. It's realizing you already waited too long to start.",
  },
  {
    pillar: "wisdom",
    text: "Nobody's career is a straight line. The people who look like they have it figured out? They pivoted at least twice.",
  },
  {
    pillar: "wisdom",
    text: "You're not 'starting from zero' when you change careers. You're starting from experience. There's a massive difference.",
  },
  {
    pillar: "wisdom",
    text: "The biggest lie about career changes: you need to go back to school. Most of the time, you need a plan — not a degree.",
  },
  {
    pillar: "wisdom",
    text: "Feeling stuck in your career isn't a sign of failure. It's a sign you've outgrown where you are. That's growth trying to happen.",
  },
  {
    pillar: "wisdom",
    text: "A barista who handles 200 customers a day under pressure has more customer success skills than most people with the job title.",
  },
  {
    pillar: "wisdom",
    text: "Career changers have a superpower: fresh perspective. Every industry is drowning in groupthink. You're the outside voice they need.",
  },
  {
    pillar: "wisdom",
    text: "The worst career advice: 'just be grateful you have a job.' Gratitude is great. Settling is not. You can appreciate where you are and still want more.",
  },
  {
    pillar: "wisdom",
    text: "Most people don't hate their jobs. They hate that their jobs don't use the best parts of who they are. That's a career fit problem, not a work ethic problem.",
  },
  {
    pillar: "wisdom",
    text: "Your first career chose you. Your next one should be something you choose. That's not selfish — that's growth.",
  },
  {
    pillar: "wisdom",
    text: "A designer who switches to marketing isn't starting over. They're bringing visual storytelling skills that most marketers would kill for.",
  },
  {
    pillar: "wisdom",
    text: "The people who successfully change careers aren't braver than you. They just got tired of wondering 'what if' and made a plan.",
  },
  {
    pillar: "wisdom",
    text: "You don't need permission to change careers. Not from your parents, not from your partner, not from LinkedIn. You need a roadmap.",
  },
  {
    pillar: "wisdom",
    text: "Every expert was once a beginner. Every hiring manager was once the nervous new person. Imposter syndrome lies to you.",
  },
  {
    pillar: "wisdom",
    text: "The cost of changing careers is 6-12 months of discomfort. The cost of not changing? Decades of wondering.",
  },
  {
    pillar: "wisdom",
    text: "Stop waiting until you're 'ready' to change careers. Ready is a feeling. Prepared is a plan. Focus on prepared.",
  },
  {
    pillar: "wisdom",
    text: "A retail manager who handled scheduling, inventory, conflict resolution, and training is qualified for way more jobs than they think.",
  },
  {
    pillar: "wisdom",
    text: "The myth of the 'perfect career' keeps people stuck. There's no perfect — there's just better. And better is always worth pursuing.",
  },
  {
    pillar: "wisdom",
    text: "Career changes aren't just for your 20s. Some of the best pivots happen at 35, 42, 50. Experience isn't a liability — it's leverage.",
  },
  {
    pillar: "wisdom",
    text: "The hardest part of a career change isn't learning new skills. It's unlearning the identity tied to your old job. You are not your job title.",
  },

  // ── Industry Insights (30% — 16 tweets) ──────────────────
  {
    pillar: "insight",
    text: "Companies don't hire credentials. They hire people who can solve problems. Your 5 years in retail taught you more about people than most MBA programs.",
  },
  {
    pillar: "insight",
    text: "The fastest-growing career fields right now — HR, customer success, sales ops — are filled with career changers. You're not behind. You're the new normal.",
  },
  {
    pillar: "insight",
    text: "Hiring managers spend 7 seconds on your resume. They're not counting your years in one field. They're looking for proof you can do THIS job.",
  },
  {
    pillar: "insight",
    text: "Here's what most career changers get wrong: they apologize for their background instead of translating it.\n\n'I was just a teacher' → 'I trained and evaluated 150+ people per year.'\n\nSame experience. Completely different impact.",
  },
  {
    pillar: "insight",
    text: "The 'skills gap' is mostly a confidence gap. When we map career changers' existing skills against job requirements, they're usually 60-70% there already.",
  },
  {
    pillar: "insight",
    text: "Companies are getting smarter about hiring. Many now prefer career changers because they bring cross-industry thinking that lifers can't.\n\nYour 'non-traditional background' is becoming your edge.",
  },
  {
    pillar: "insight",
    text: "The #1 reason career changers don't get callbacks? Their resume still reads like their old career.\n\nYou need to translate, not just list. Show the new employer how your old skills solve THEIR problems.",
  },
  {
    pillar: "insight",
    text: "Most people think they need 100% of the qualifications to apply. Research shows people who match 60% get hired all the time.\n\nYou're probably more qualified than you think.",
  },
  {
    pillar: "insight",
    text: "The job market doesn't care about your career narrative being 'clean.' It cares about what you can do right now.\n\nStop trying to explain your path. Start showing your value.",
  },
  {
    pillar: "insight",
    text: "Transferable skills are the most undervalued currency in the job market.\n\nCommunication. Problem-solving. Managing people. Training others. Leading under pressure.\n\nThese aren't soft skills. They're the skills that actually run companies.",
  },
  {
    pillar: "insight",
    text: "The biggest misconception about career changes: that you'll take a massive pay cut forever.\n\nReality: most career changers recover to their previous salary within 18-24 months. Some exceed it.",
  },
  {
    pillar: "insight",
    text: "Every job posting is a wishlist, not a checklist. 'Required: 5 years experience' often means 'we'd love someone who knows what they're doing.'\n\nYour 5 years in a different field? That counts more than you think.",
  },
  {
    pillar: "insight",
    text: "The interview question career changers fear most: 'Why are you leaving your field?'\n\nThe winning answer isn't about running FROM something. It's about running TOWARD something. Frame it as growth, not escape.",
  },
  {
    pillar: "insight",
    text: "Networking isn't schmoozing. For career changers, it's the #1 way in.\n\nOne coffee chat with someone in your target field is worth 50 cold applications. People hire people they've talked to.",
  },
  {
    pillar: "insight",
    text: "The rise of remote work has been a gift for career changers. Suddenly you're not competing with just your local job market — and companies aren't limited to local talent pools.",
  },
  {
    pillar: "insight",
    text: "Here's a pattern we see constantly: people spend months 'researching' career changes but never actually talk to someone in the field.\n\nOne informational interview will teach you more than 100 articles.",
  },

  // ── Practical Tips (20% — 10 tweets) ─────────────────────
  {
    pillar: "tip",
    text: "Before applying to a new field, do this:\n\nFind 5 job postings for your dream role. Write down every skill mentioned more than twice. That's your study plan.\n\nThe market is literally telling you what it wants.",
  },
  {
    pillar: "tip",
    text: "The STAR method for career changer interviews:\n\n• Situation — set the scene from your current/past job\n• Task — what was YOUR responsibility\n• Action — what you specifically did\n• Result — use numbers whenever possible\n\nThis works for ANY background. Practice 5 stories.",
  },
  {
    pillar: "tip",
    text: "How to rewrite your resume for a career change in 30 minutes:\n\n1. Read the job posting out loud\n2. Circle every skill they mention\n3. For each one, write a bullet from YOUR experience that proves it\n4. Lead with those bullets\n\nStop sending your old resume to new careers.",
  },
  {
    pillar: "tip",
    text: "Free career change hack:\n\nFind 3 people on LinkedIn with the job title you want. Look at their career history. At least one of them changed careers too.\n\nStudy their path. Then reach out and ask how they did it.",
  },
  {
    pillar: "tip",
    text: "Starting a career change? Do these 3 things this week:\n\n1. Write down the top 10 skills from your current job\n2. Match them to skills needed in your target role\n3. Identify the 3 gaps you need to fill\n\nYou just built your roadmap.",
  },
  {
    pillar: "tip",
    text: "How to answer 'tell me about yourself' when you're changing careers:\n\nDon't recite your old job history. Instead:\n\n'I spent X years doing [old role], where I developed [transferable skill]. Now I'm bringing that to [new field] because [genuine reason].'\n\n30 seconds. Done.",
  },
  {
    pillar: "tip",
    text: "The fastest way to prove you belong in a new field: do the work before you get the job.\n\n• Volunteer for a project\n• Take a freelance gig\n• Build something on your own\n\nOne real example beats ten 'I'm a fast learner' claims.",
  },
  {
    pillar: "tip",
    text: "Career change interview prep nobody talks about:\n\nGoogle '[your target role] day in the life.' Read 5 articles. Now you can speak their language in interviews.\n\nMost career changers skip this and it shows.",
  },
  {
    pillar: "tip",
    text: "If you're worried about a career change pay cut, try this:\n\n1. Calculate your REAL hourly rate (salary ÷ actual hours worked)\n2. Factor in commute, stress, Sunday dread\n3. Compare honestly\n\nSometimes a 'pay cut' is actually a raise in life quality.",
  },
  {
    pillar: "tip",
    text: "Next time you finish a project at work, write 3 sentences:\n\n1. What problem did you solve?\n2. What did YOU specifically do?\n3. What was the result (with numbers)?\n\nDo this for 3 months. You'll have a career-change-ready resume without even trying.",
  },

  // ── Engagement / Community (10% — 5 tweets) ──────────────
  {
    pillar: "engagement",
    text: "What's the career change you've been thinking about but haven't started? Drop it below 👇",
  },
  {
    pillar: "engagement",
    text: "Career changers — what was the moment you knew it was time to leave your old field?\n\nI'll go first: when Sunday nights started feeling like Monday mornings.",
  },
  {
    pillar: "engagement",
    text: "Be honest: what's the #1 thing holding you back from changing careers?\n\n💰 = Money fears\n🎓 = Feel unqualified\n👨‍👩‍👧 = Family pressure\n😰 = Just scared\n\nNo judgment. Let's talk about it.",
  },
  {
    pillar: "engagement",
    text: "Unpopular opinion: you don't need to be 'passionate' about your career. You need to be engaged, challenged, and fairly paid.\n\nAgree or disagree? 👇",
  },
  {
    pillar: "engagement",
    text: "If you successfully changed careers, drop your before → after below.\n\nTeacher → ?\nRetail → ?\nFood service → ?\n\nLet's show people what's possible 🔥",
  },
];

/** Target accounts for engagement (reply strategy) */
export const TARGET_ACCOUNTS = [
  "simonsinek",
  "AdamMGrant",
  "JamesClear",
  "SahilBloom",
  "RamseyShow",
  "levelsio",
  "ShelcyJoseph",
  "IAmMarkManson",
  "austinkleon",
  "MelRobbins",
];

/** Topics we care about — used to filter tweets worth replying to */
export const RELEVANT_TOPICS = [
  "career",
  "career change",
  "career transition",
  "career pivot",
  "new job",
  "job change",
  "switching careers",
  "career advice",
  "interview",
  "resume",
  "skill",
  "learning",
  "growth",
  "transferable skills",
  "career path",
  "job search",
  "starting over",
  "career break",
  "new career",
  "hiring",
  "job market",
  "upskill",
  "professional development",
  "career coach",
  "career goals",
  "career plan",
];
