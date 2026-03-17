import { TwitterApi } from "twitter-api-v2";

let _client: TwitterApi | null = null;

export function getTwitterClient(): TwitterApi {
  if (!_client) {
    _client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }
  return _client;
}
