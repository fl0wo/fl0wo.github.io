import { describe, expect, test } from 'vitest'
import worker from '../worker/index'
import { isBot, ROBOTS_HEADER } from '../worker/guard'

const browser =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'

const env = { ASSETS: { fetch: async () => new Response('<html>page</html>', { status: 200 }) } }

function get(path: string, userAgent: string | null) {
  const headers = userAgent ? { 'user-agent': userAgent } : undefined
  return worker.fetch(new Request(`https://floriansabani.com${path}`, { headers }), env)
}

describe('3lm edge guard', () => {
  test('recognizes crawlers, AI bots, preview fetchers and scripts', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'facebookexternalhit/1.1',
      'WhatsApp/2.23.20.0',
      'curl/8.7.1',
      null,
    ]) {
      expect(isBot(ua)).toBe(true)
    }
    expect(isBot(browser)).toBe(false)
  })

  test('blocks bots on 3lm pages with a noindex 403', async () => {
    const response = await get('/en/3lm/seera/01-names-and-lineage', 'Googlebot/2.1')
    expect(response.status).toBe(403)
    expect(response.headers.get('X-Robots-Tag')).toBe(ROBOTS_HEADER)
  })

  test('serves browsers on 3lm pages with noindex headers', async () => {
    const response = await get('/it/3lm', browser)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('page')
    expect(response.headers.get('X-Robots-Tag')).toBe(ROBOTS_HEADER)
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
  })

  test('leaves public pages untouched, even for bots', async () => {
    const response = await get('/en/posts/3lm-lookalike', 'Googlebot/2.1')
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })
})
