import { TwitterApi } from "twitter-api-v2";
import { readFileSync } from "fs";

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

  // Try replying to our OWN tweet first (the test tweet we posted)
  console.log("Testing reply to our own tweet...");
  try {
    const result = await client.v2.tweet({
      text: "Testing reply functionality 🧪",
      reply: { in_reply_to_tweet_id: "2033880691486650847" },
    });
    console.log("✅ Self-reply works! ID:", result.data.id);
    // Clean up
    await client.v2.deleteTweet(result.data.id);
    console.log("🗑️  Cleaned up test reply");
  } catch (err: unknown) {
    console.error("❌ Self-reply failed:", err instanceof Error ? err.message : err);
    if ((err as { data?: unknown }).data) console.error(JSON.stringify((err as { data: unknown }).data, null, 2));
  }
}

main().catch(console.error);
