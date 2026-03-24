import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Redis from "ioredis";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load REDIS_URL from .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const redisMatch = envContent.match(/REDIS_URL="?([^"\n]+)"?/);
if (!redisMatch) {
  console.error("REDIS_URL not found in .env.local");
  process.exit(1);
}
const REDIS_URL = redisMatch[1];

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });

const now = new Date().toISOString();

const roadmaps = [
  {
    slug: "teacher-to-hr-specialist",
    input: {
      currentRole: "Teacher",
      targetRole: "HR Specialist",
      skills: ["Communication", "Training", "Conflict Resolution", "Curriculum Design", "Public Speaking"],
      experience: 5,
    },
    result: {
      roadmap: [
        {
          phase: 1,
          title: "Learn the Basics",
          duration: "3 months",
          skills: [
            "Employment law basics (hiring rules, discrimination laws, worker rights)",
            "HR software systems (BambooHR or Workday basics)",
            "Resume screening and candidate evaluation",
            "Employee handbook and policy reading",
            "Benefits administration fundamentals",
          ],
          resources: [
            "🎓 SHRM Essentials of HR Management (online course)",
            "📚 The HR Answer Book by Shawn Smith & Rebecca Mazin",
            "🔨 Volunteer to help with hiring at your school or a nonprofit",
            "👥 Join your local SHRM chapter and attend a meeting",
          ],
          milestone: "Complete the SHRM Essentials course and help screen candidates for one real job opening",
        },
        {
          phase: 2,
          title: "Build Real Experience",
          duration: "5 months",
          skills: [
            "New employee onboarding program design",
            "Performance review facilitation",
            "Employee engagement surveys and follow-up",
            "Workplace conflict mediation (building on your teaching skills)",
            "HR data tracking in spreadsheets",
          ],
          resources: [
            "🔨 Design and run an onboarding process for new hires",
            "📚 Who by Geoff Smart & Randy Street",
            "🎓 LinkedIn Learning — HR Foundations certificate",
            "🔨 Create a 30-60-90 day plan template for new employees",
          ],
          milestone: "Run the complete onboarding process for 5+ new hires and collect positive feedback from each",
        },
        {
          phase: 3,
          title: "Become the Expert",
          duration: "4 months",
          skills: [
            "Talent management and succession planning",
            "Diversity, equity, and inclusion program design",
            "HR analytics and workforce planning",
            "Training program development (your teaching background shines here)",
            "Employer branding and culture building",
          ],
          resources: [
            "🎓 SHRM-CP certification preparation",
            "📚 Work Rules! by Laszlo Bock",
            "👥 Present at a local HR meetup about training program design",
            "🔨 Build a company training curriculum using your teaching expertise",
          ],
          milestone: "Earn your SHRM-CP certification and be recognized as the go-to person for employee development",
        },
      ],
      estimatedTimeline: "12 months",
      generatedAt: now,
    },
    createdAt: now,
  },
  {
    slug: "retail-manager-to-b2b-sales",
    input: {
      currentRole: "Retail Manager",
      targetRole: "B2B Sales Representative",
      skills: ["Customer Service", "Team Management", "Inventory Management", "Sales Floor Leadership", "Cash Handling"],
      experience: 4,
    },
    result: {
      roadmap: [
        {
          phase: 1,
          title: "Learn the Basics",
          duration: "3 months",
          skills: [
            "B2B vs B2C sales — understanding business buyers",
            "CRM software basics (HubSpot free version)",
            "Cold outreach — emails and calls that get responses",
            "Discovery calls — asking the right questions to understand needs",
            "Sales pipeline stages from first contact to closed deal",
          ],
          resources: [
            "🎓 HubSpot Academy — Inbound Sales Certification (free)",
            "📚 SPIN Selling by Neil Rackham",
            "🔨 Set up a free HubSpot CRM and practice logging contacts",
            "👥 Join Sales Hacker community online",
          ],
          milestone: "Complete the HubSpot certification and book your first 5 discovery calls with real businesses",
        },
        {
          phase: 2,
          title: "Build Real Experience",
          duration: "5 months",
          skills: [
            "Building and managing a sales pipeline",
            "Handling objections — turning 'no' into 'tell me more'",
            "Writing proposals and quotes for business clients",
            "Negotiation techniques for larger deals",
            "Using data to track your sales performance",
          ],
          resources: [
            "🔨 Close your first 3 B2B deals from scratch",
            "📚 The Challenger Sale by Dixon & Adamson",
            "🎓 Salesforce Trailhead — Sales Representative path (free)",
            "🔨 Build a personal sales tracker spreadsheet with conversion rates",
          ],
          milestone: "Hit or exceed your sales target for 2 consecutive months with a growing pipeline",
        },
        {
          phase: 3,
          title: "Become the Expert",
          duration: "4 months",
          skills: [
            "Account management — growing existing client relationships",
            "Territory planning and strategic prospecting",
            "Sales presentations to groups of decision-makers",
            "Coaching and mentoring new sales reps",
            "Understanding your industry deeply enough to be a trusted advisor",
          ],
          resources: [
            "📚 Predictable Revenue by Aaron Ross",
            "👥 Find a sales mentor through Pavilion or Revenue Collective",
            "🔨 Create a sales playbook documenting your winning process",
            "👥 Mentor a junior sales rep through their first quarter",
          ],
          milestone: "You're consistently in the top 25% of sales performers and newer reps ask you for advice",
        },
      ],
      estimatedTimeline: "12 months",
      generatedAt: now,
    },
    createdAt: now,
  },
  {
    slug: "graphic-designer-to-marketing",
    input: {
      currentRole: "Graphic Designer",
      targetRole: "Marketing Coordinator",
      skills: ["Adobe Creative Suite", "Visual Design", "Brand Identity", "Typography", "Client Communication"],
      experience: 3,
    },
    result: {
      roadmap: [
        {
          phase: 1,
          title: "Learn the Basics",
          duration: "3 months",
          skills: [
            "Marketing fundamentals — the 4 Ps and how campaigns work",
            "Social media strategy (not just posting — planning and measuring)",
            "Email marketing basics (Mailchimp or similar tools)",
            "Content calendar creation and management",
            "Basic copywriting for ads, emails, and social posts",
          ],
          resources: [
            "🎓 HubSpot Content Marketing Certification (free)",
            "📚 Everybody Writes by Ann Handley",
            "🔨 Create and manage social media for a real brand for 30 days",
            "👥 Subscribe to Marketing Brew newsletter",
          ],
          milestone: "Plan and launch a 30-day social media campaign for a real brand, tracking engagement numbers",
        },
        {
          phase: 2,
          title: "Build Real Experience",
          duration: "5 months",
          skills: [
            "Campaign performance tracking with Google Analytics",
            "A/B testing — trying different approaches and measuring what works",
            "Event marketing and promotional materials",
            "Working with sales teams to create marketing that drives leads",
            "Marketing budget tracking and reporting",
          ],
          resources: [
            "🎓 Google Analytics certification (free)",
            "🔨 Run an email campaign with A/B testing and report the results",
            "📚 Building a StoryBrand by Donald Miller",
            "🔨 Create a complete brand style guide for a client or project",
          ],
          milestone: "Run a marketing campaign that increases engagement or leads by 20%, with data to prove it",
        },
        {
          phase: 3,
          title: "Become the Expert",
          duration: "4 months",
          skills: [
            "Marketing strategy and quarterly planning",
            "Cross-department collaboration with sales and product teams",
            "Influencer and partnership outreach",
            "PR basics and media relations",
            "Presenting marketing results to leadership",
          ],
          resources: [
            "📚 This Is Marketing by Seth Godin",
            "🔨 Develop a quarterly marketing strategy with budget and KPIs",
            "👥 Attend an American Marketing Association event",
            "👥 Mentor someone just starting in marketing",
          ],
          milestone: "You own the marketing calendar — your campaigns consistently deliver results and leadership trusts your strategy",
        },
      ],
      estimatedTimeline: "12 months",
      generatedAt: now,
    },
    createdAt: now,
  },
  {
    slug: "barista-to-customer-success",
    input: {
      currentRole: "Barista",
      targetRole: "Customer Success Manager",
      skills: ["Customer Service", "Multitasking", "Problem Solving", "Team Collaboration", "Cash Handling"],
      experience: 2,
    },
    result: {
      roadmap: [
        {
          phase: 1,
          title: "Learn the Basics",
          duration: "4 months",
          skills: [
            "What customer success is and how it differs from customer support",
            "CRM tools basics (HubSpot or Gainsight free resources)",
            "Customer onboarding — helping new users get started",
            "Measuring customer happiness (NPS and CSAT surveys)",
            "Professional email writing for business communication",
          ],
          resources: [
            "🎓 SuccessHACKER free customer success courses",
            "📚 Customer Success by Nick Mehta, Dan Steinman & Lincoln Murphy",
            "🔨 Practice using HubSpot free CRM — set up contacts and track interactions",
            "👥 Join the Customer Success Network on LinkedIn",
          ],
          milestone: "Complete the SuccessHACKER course and be able to explain the customer success lifecycle to anyone",
        },
        {
          phase: 2,
          title: "Build Real Experience",
          duration: "6 months",
          skills: [
            "Running check-in calls with customers (your people skills from the café shine here)",
            "Spotting at-risk customers before they leave",
            "Upselling — helping customers get more value (not just selling more)",
            "Creating customer health dashboards in spreadsheets",
            "Working with product and support teams to solve customer problems",
          ],
          resources: [
            "🔨 Volunteer to manage client relationships for a small business or nonprofit",
            "📚 The Effortless Experience by Dixon, Toman & DeLisi",
            "🔨 Build a customer tracking spreadsheet with health scores",
            "🎓 LinkedIn Learning — Customer Success Management fundamentals",
          ],
          milestone: "Manage 10+ customer relationships with a 90%+ satisfaction score",
        },
        {
          phase: 3,
          title: "Become the Expert",
          duration: "5 months",
          skills: [
            "Quarterly business reviews (QBRs) with important clients",
            "Customer advocacy and referral programs",
            "Churn analysis — understanding why customers leave and preventing it",
            "Building repeatable processes for the customer success team",
            "Presenting customer insights to company leadership",
          ],
          resources: [
            "📚 The Customer Success Professional's Handbook by Vaidyanathan & Rabago",
            "🔨 Build a customer success playbook with templates and checklists",
            "👥 Attend a Pulse or customer success community event",
            "👥 Mentor someone transitioning into customer success",
          ],
          milestone: "Your customers renew and grow their accounts because of the relationship and value you provide",
        },
      ],
      estimatedTimeline: "15 months",
      generatedAt: now,
    },
    createdAt: now,
  },
];

async function seed() {
  console.log("Seeding 4 sample roadmaps...");

  for (const roadmap of roadmaps) {
    const key = `roadmap:${roadmap.slug}`;
    await redis.set(key, JSON.stringify(roadmap));

    // Add to sorted set (score = timestamp)
    const timestamp = new Date(roadmap.createdAt).getTime();
    await redis.zadd("roadmaps:created", timestamp, roadmap.slug);

    console.log(`  ✓ ${roadmap.slug}`);
  }

  console.log("Done! Seeded 4 roadmaps.");
  await redis.quit();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
