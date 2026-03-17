import { TwitterApi } from "twitter-api-v2";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";

// Load .env.local
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const TARGET_ACCOUNTS = ["levelsio", "swyx", "GergelyOrosz", "SahilBloom", "ThePrimeagen"];

async function main() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Pick a random target
  const account = TARGET_ACCOUNTS[Math.floor(Math.random() * TARGET_ACCOUNTS.length)];
  console.log(`🎯 Target: @${account}\n`);

  // Fetch their recent tweets
  const user = await client.v2.userByUsername(account);
  if (!user.data) throw new Error(`User @${account} not found`);

  const timeline = await client.v2.userTimeline(user.data.id, {
    max_results: 5,
    exclude: ["retweets", "replies"],
    "tweet.fields": ["created_at", "text"],
  });

  const tweets = timeline.data?.data || [];
  if (tweets.length === 0) throw new Error("No tweets found");

  const tweet = tweets[0];
  console.log(`📝 Tweet: "${tweet.text.slice(0, 120)}${tweet.text.length > 120 ? '...' : ''}"\n`);

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
  if (block.type !== "text") throw new Error("Non-text response");
  const reply = block.text.replace(/^["']|["']$/g, "").trim();

  console.log(`💬 Draft reply: "${reply}"\n`);
  console.log(`✅ PREVIEW ONLY — nothing was posted.`);
}

main().catch((err) => {
  console.error("❌", err.message || err);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
