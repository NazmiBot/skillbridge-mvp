import { TwitterApi } from "twitter-api-v2";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";

const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const TARGET_ACCOUNTS = ["swyx", "t3dotgg", "DThompsonDev", "ThePrimeagen", "GergelyOrosz", "levelsio", "RandallKanna"];

async function main() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const me = await client.v2.me();
  console.log(`🔑 @${me.data.username}\n`);

  for (const account of TARGET_ACCOUNTS) {
    console.log(`🔍 Trying @${account}...`);
    try {
      const user = await client.v2.userByUsername(account);
      if (!user.data) continue;

      const timeline = await client.v2.userTimeline(user.data.id, {
        max_results: 5,
        exclude: ["retweets", "replies"],
        "tweet.fields": ["text", "reply_settings"],
      });

      const tweets = timeline.data?.data || [];
      if (!tweets.length) { console.log("   No tweets\n"); continue; }

      const tweet = tweets[0];
      console.log(`   Tweet: "${tweet.text.slice(0, 100)}..."`);

      // Generate reply
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        system: `You write short Twitter replies. 1-2 sentences max, under 200 chars. Sound human, casual, smart. NEVER mention any product or link. NEVER be sycophantic. Add a unique perspective. Output ONLY the reply.`,
        max_tokens: 100,
        temperature: 0.9,
        messages: [
          { role: "user", content: `Reply to @${account}: "${tweet.text}"` },
        ],
      });

      const block = response.content[0];
      if (block.type !== "text") continue;
      const reply = block.text.replace(/^["']|["']$/g, "").trim();
      console.log(`   Reply: "${reply}"`);

      // Try posting
      const result = await client.v2.tweet({
        text: reply,
        reply: { in_reply_to_tweet_id: tweet.id },
      });

      console.log(`\n✅ SUCCESS! Reply to @${account} posted!`);
      console.log(`   https://x.com/${me.data.username}/status/${result.data.id}`);
      return;
    } catch (err: unknown) {
      const data = (err as { data?: { detail?: string } }).data;
      console.log(`   ❌ ${data?.detail || (err instanceof Error ? err.message : "Failed")}\n`);
    }
  }
  console.log("\n😔 All accounts have reply restrictions for new accounts.");
}

main().catch((err) => {
  console.error("❌", err.message || err);
  process.exit(1);
});
