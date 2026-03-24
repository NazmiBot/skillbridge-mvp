import { createClient } from "redis";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

// Parse .env.local manually
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
  if (match) envVars[match[1].trim()] = match[2];
}

const redisUrl = envVars.REDIS_URL;
if (!redisUrl) {
  console.error("❌ REDIS_URL not found in .env.local");
  process.exit(1);
}

const client = createClient({ url: redisUrl });
await client.connect();

const keys = ["x:posted_tweets", "blog:used_topics"];
const results = [];

for (const key of keys) {
  const deleted = await client.del(key);
  results.push({ key, deleted: deleted === 1 });
  console.log(
    deleted === 1
      ? `✅ Deleted "${key}"`
      : `⚠️  "${key}" did not exist (nothing to delete)`
  );
}

await client.quit();
console.log("\n🎉 Redis content state reset complete.");
