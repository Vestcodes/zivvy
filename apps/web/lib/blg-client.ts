import { BlogClient } from "babylovegrowth-next-js-blog";

let _client: BlogClient | null = null;

export function getBlogClient(): BlogClient | null {
  const apiKey = process.env.BABYLOVEGROWTH_BLOG_API_KEY;
  if (!apiKey) return null;
  if (!_client) {
    _client = new BlogClient({ apiKey, revalidate: 86400 });
  }
  return _client;
}
