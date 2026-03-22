#!/usr/bin/env node
/**
 * 🧹 The Great Purge — Clean vandalized entries from /explore
 * 
 * Scans all roadmap:* keys, flags entries with:
 *   - Profanity in currentRole or targetRole
 *   - Keyboard smashes (too few unique chars, no vowels)
 *   - Job titles shorter than 4 characters
 * 
 * Usage: node scripts/purge-explore.mjs [--dry-run]
 */

import Redis from "ioredis";
import { readFileSync } from "fs";

// Parse .env.local manually (no dotenv dependency)
const envFile = readFileSync(".env.local", "utf8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
  if (match) process.env[match[1]] = match[2];
}

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) { console.error("Missing REDIS_URL"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");

// Profanity list — extend as needed
const PROFANITY = [
  "fuck", "shit", "ass", "damn", "bitch", "dick", "cock", "pussy",
  "cunt", "nigger", "nigga", "fag", "faggot", "whore", "slut",
  "retard", "bastard", "penis", "vagina", "anus", "titties", "tits",
  "bollocks", "wanker", "twat",
];

const PROFANITY_RE = new RegExp(`\\b(${PROFANITY.join("|")})\\b`, "i");

function isKeyboardSmash(text) {
  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 3) return true;
  // Too few unique characters relative to length
  const unique = new Set(clean.split("")).size;
  if (unique <= 2 && clean.length > 3) return true;
  // No vowels at all (very likely gibberish)
  if (!/[aeiou]/.test(clean)) return true;
  // Repeated character runs (e.g. "aaaaaa", "asdasdasd")
  if (/(.)\1{3,}/.test(clean)) return true;
  // Repeating 2-3 char pattern (asdasd, ababab)
  if (/^(.{2,3})\1{1,}$/.test(clean)) return true;
  return false;
}

function isBadTitle(text) {
  if (!text || typeof text !== "string") return "empty";
  const trimmed = text.trim();
  if (trimmed.length < 4) return `too short (${trimmed.length} chars)`;
  if (PROFANITY_RE.test(trimmed)) return `profanity: "${trimmed}"`;
  if (isKeyboardSmash(trimmed)) return `keyboard smash: "${trimmed}"`;
  return null;
}

async function main() {
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });
  
  console.log(DRY_RUN ? "🔍 DRY RUN — no deletions" : "🗑️  LIVE PURGE — deleting bad entries");
  console.log("---");

  const keys = await redis.keys("roadmap:*");
  console.log(`Found ${keys.length} roadmap keys\n`);

  let purged = 0;
  let clean = 0;
  const purgeKeys = [];

  // Batch fetch
  if (keys.length === 0) {
    console.log("Nothing to scan.");
    await redis.quit();
    return;
  }

  const pipeline = redis.pipeline();
  for (const key of keys) pipeline.get(key);
  const results = await pipeline.exec();

  for (let i = 0; i < keys.length; i++) {
    const [err, raw] = results[i];
    if (err || !raw) continue;

    let data;
    try { data = JSON.parse(raw); } catch { continue; }

    const currentRole = data?.input?.currentRole || "";
    const targetRole = data?.input?.targetRole || "";

    const currentBad = isBadTitle(currentRole);
    const targetBad = isBadTitle(targetRole);

    if (currentBad || targetBad) {
      const slug = keys[i].replace("roadmap:", "");
      const reasons = [
        currentBad ? `currentRole: ${currentBad}` : null,
        targetBad ? `targetRole: ${targetBad}` : null,
      ].filter(Boolean).join(", ");

      console.log(`❌ ${slug} — ${reasons}`);
      purgeKeys.push(keys[i]);
      purged++;
    } else {
      clean++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Clean: ${clean} | Flagged: ${purged}`);

  if (purgeKeys.length > 0 && !DRY_RUN) {
    // Also clean up related keys
    const delPipeline = redis.pipeline();
    for (const key of purgeKeys) {
      const slug = key.replace("roadmap:", "");
      delPipeline.del(key);
      delPipeline.del(`interview:paid:${slug}`);
      delPipeline.del(`interview:questions:${slug}`);
      delPipeline.del(`interview:evaluation:${slug}`);
      delPipeline.zrem("roadmaps:created", slug);
    }
    await delPipeline.exec();
    console.log(`\n🗑️  Purged ${purgeKeys.length} entries + related keys`);
  } else if (DRY_RUN && purgeKeys.length > 0) {
    console.log(`\n⚠️  Would purge ${purgeKeys.length} entries. Run without --dry-run to execute.`);
  }

  await redis.quit();
}

main().catch((e) => { console.error(e); process.exit(1); });
