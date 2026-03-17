import { TwitterApi } from "twitter-api-v2";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";

const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const RELEVANT_TOPICS = ["career", "skill", "interview", "developer", "engineer", "learning", "growth", "senior", "junior", "hiring", "job", "startup", "building", "coding", "programming"];
const TARGET_ACCOUNTS = ["levelsio", "swyx", "GergelyOrosz", "SahilBloom", "ThePrimeagen", "t3dotgg", "DThompsonDev"];

async function main() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const me = await client.v2.me();
  console.log(`🔑 Authenticated as @${me.data.username}\n`);

  // Try accounts until we find a relevant tweet
  const shuffled = TARGET_ACCOUNTS.sort(() => Math.random() - 0.5);

  for (const account of shuffled) {
    console.log(`🔍 Checking @${account}...`);
    try {
      const user = await client.v2.userByUsername(account);
      if (!user.data) continue;

      const timeline = await client.v2.userTimeline(user.data.id, {
        max_results: 10,
        exclude: ["retweets", "replies"],
        "tweet.fields": ["created_at", "text"],
      });

      const tweets = timeline.data?.data || [];
      // Find a relevant tweet
      const tweet = tweets.find((t) => {
        const lower = t.text.toLowerCase();
        return RELEVANT_TOPICS.some((topic) => lower.includes(topic));
      }) || tweets[0];

      if (!tweet) continue;

      console.log(`\n🎯 Target: @${account}`);
      console.log(`📝 Tweet: "${tweet.text.slice(0, 150)}${tweet.text.length > 150 ? "..." : ""}"\n`);

      // Generate reply
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        system: `You are the voice behind @tryskillbridge — a thoughtful, knowledgeable person in the career development space. You write short, insightful Twitter replies.

RULES:
- Reply in 1-2 sentences MAX (under 200 characters is ideal)
- Be genuinely helpful or insightful — add value to the conversation
- Sound like a real person, not a brand. Casual but smart.
- NEVER mention SkillBridge, your product, or any link
- NEVER use hashtags in replies
- NEVER be sycophantic ("Great point!", "So true!", "This! 👆")
- Don't start with "I" — vary your sentence starters
- Match the energy of the original tweet
- Add a unique perspective or personal insight — don't just agree

Output ONLY the reply text. Nothing else.`,
        max_tokens: 150,
        temperature: 0.9,
        messages: [
          { role: "user", content: `Write a reply to this tweet by @${account}:\n\n"${tweet.text}"` },
        ],
      });

      const block = response.content[0];
      if (block.type !== "text") throw new Error("Non-text");
      const reply = block.text.replace(/^["']|["']$/g, "").trim();

      console.log(`💬 Reply: "${reply}"\n`);

      // Like first
      try {
        await client.v2.like(me.data.id, tweet.id);
        console.log(`❤️  Liked the tweet`);
      } catch { /* not critical */ }

      // Post reply
      const result = await client.v2.reply(reply, tweet.id);
      console.log(`✅ Reply posted!`);
      console.log(`   https://x.com/${me.data.username}/status/${result.data.id}`);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`   Skipping — ${msg}`);
    }
  }

  console.log("\n❌ Couldn't find a good tweet to reply to.");
}

main().catch((err) => {
  console.error("❌", err.message || err);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
