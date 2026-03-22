#!/usr/bin/env node
/**
 * 💾 Redis Backup — Export all SkillBridge data to a JSON file
 *
 * Backs up: blog posts, roadmaps, leads, progress, X automation state,
 * follow-up flags, and all other keys.
 *
 * Usage:
 *   node scripts/backup-redis.mjs                    # writes to backups/redis-YYYY-MM-DD.json
 *   node scripts/backup-redis.mjs --out custom.json  # writes to custom path
 *   node scripts/backup-redis.mjs --dry-run          # scan + count only, no file written
 *
 * Restore:
 *   node scripts/backup-redis.mjs --restore backups/redis-2026-03-22.json
 */

import Redis from "ioredis";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

// Parse .env.local
const envFile = readFileSync(".env.local", "utf8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
  if (match) process.env[match[1]] = match[2];
}

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) { console.error("Missing REDIS_URL"); process.exit(1); }

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESTORE = args.includes("--restore");
const restoreFile = RESTORE ? args[args.indexOf("--restore") + 1] : null;
const outIdx = args.indexOf("--out");
const today = new Date().toISOString().split("T")[0];
const outPath = outIdx !== -1 ? args[outIdx + 1] : `backups/redis-${today}.json`;

async function backup() {
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });

  console.log(DRY_RUN ? "🔍 DRY RUN — scan only" : `💾 Backing up to ${outPath}`);
  console.log("---");

  // Scan all keys
  const keys = [];
  let cursor = "0";
  do {
    const [nextCursor, batch] = await redis.scan(cursor, "COUNT", 200);
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  console.log(`Found ${keys.length} keys\n`);

  if (DRY_RUN) {
    // Group by prefix for overview
    const prefixes = {};
    for (const key of keys) {
      const prefix = key.split(":").slice(0, key.startsWith("blog:post:") ? 2 : 1).join(":");
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
    for (const [prefix, count] of Object.entries(prefixes).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${prefix}: ${count}`);
    }
    await redis.quit();
    return;
  }

  // Export each key with its type and value
  const data = { exportedAt: new Date().toISOString(), keyCount: keys.length, keys: {} };

  for (const key of keys) {
    const type = await redis.type(key);
    let value;
    let ttl;

    switch (type) {
      case "string":
        value = await redis.get(key);
        break;
      case "list":
        value = await redis.lrange(key, 0, -1);
        break;
      case "set":
        value = await redis.smembers(key);
        break;
      case "zset":
        value = await redis.zrange(key, 0, -1, "WITHSCORES");
        break;
      case "hash":
        value = await redis.hgetall(key);
        break;
      default:
        value = null;
    }

    ttl = await redis.ttl(key);

    data.keys[key] = { type, value, ttl: ttl > 0 ? ttl : null };
  }

  // Write file
  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2));

  const sizeMb = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(2);
  console.log(`✅ Backed up ${keys.length} keys (${sizeMb} MB) → ${outPath}`);

  await redis.quit();
}

async function restore() {
  if (!restoreFile || !existsSync(restoreFile)) {
    console.error(`File not found: ${restoreFile}`);
    process.exit(1);
  }

  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });
  const data = JSON.parse(readFileSync(restoreFile, "utf8"));

  console.log(`🔄 Restoring ${data.keyCount} keys from ${restoreFile} (exported ${data.exportedAt})`);
  console.log("---");

  let restored = 0;
  let skipped = 0;

  for (const [key, entry] of Object.entries(data.keys)) {
    const { type, value, ttl } = entry;

    try {
      switch (type) {
        case "string":
          if (ttl) await redis.set(key, value, "EX", ttl);
          else await redis.set(key, value);
          break;
        case "list":
          await redis.del(key);
          if (value.length > 0) await redis.rpush(key, ...value);
          if (ttl) await redis.expire(key, ttl);
          break;
        case "set":
          await redis.del(key);
          if (value.length > 0) await redis.sadd(key, ...value);
          if (ttl) await redis.expire(key, ttl);
          break;
        case "zset": {
          await redis.del(key);
          // value is [member, score, member, score, ...]
          const pairs = [];
          for (let i = 0; i < value.length; i += 2) {
            pairs.push(parseFloat(value[i + 1]), value[i]);
          }
          if (pairs.length > 0) await redis.zadd(key, ...pairs);
          if (ttl) await redis.expire(key, ttl);
          break;
        }
        case "hash":
          await redis.del(key);
          const entries = Object.entries(value);
          if (entries.length > 0) await redis.hmset(key, ...entries.flat());
          if (ttl) await redis.expire(key, ttl);
          break;
        default:
          skipped++;
          continue;
      }
      restored++;
    } catch (err) {
      console.error(`  ❌ ${key}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n✅ Restored ${restored} keys, skipped ${skipped}`);
  await redis.quit();
}

if (RESTORE) {
  restore().catch((e) => { console.error(e); process.exit(1); });
} else {
  backup().catch((e) => { console.error(e); process.exit(1); });
}
