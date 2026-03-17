import { TwitterApi } from "twitter-api-v2";
import { readFileSync } from "fs";

// Load .env.local
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

async function main() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  console.log("🔑 Verifying credentials...");
  const me = await client.v2.me();
  console.log(`✅ Authenticated as: @${me.data.username}\n`);

  console.log("📝 Posting tweet...");
  const tweet = await client.v2.tweet(
    "Career growth shouldn't be a guessing game. 🚀 #SkillBridge"
  );
  console.log(`✅ Tweet posted!`);
  console.log(`   https://x.com/${me.data.username}/status/${tweet.data.id}`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message || err);
  if (err.data) console.error("   API response:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
