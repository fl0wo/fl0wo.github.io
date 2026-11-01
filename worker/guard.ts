/** Pure helpers for the /3lm edge guard (kept out of the entry module: the Workers
 * runtime only accepts handlers as exports of the main module). */

export const ROBOTS_HEADER = 'noindex, nofollow, noarchive, nosnippet, noimageindex'
// Search engines, AI crawlers, SEO tools and link-preview fetchers. Most identify
// with one of these words; the named ones don't.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|scrape|archiver|facebookexternalhit|meta-externalagent|anthropic-ai|claude-web|chatgpt-user|perplexity|cohere-ai|bytespider|ccbot|diffbot|whatsapp|embedly|preview|headless|curl|wget|python-requests|go-http-client|httpclient|java\//i

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent)
}
